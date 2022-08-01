import { PrismaClient } from "@prisma/client";
import * as puppeteer from "puppeteer";
import { createReadStream } from "fs";
import * as path from "path";
import csvParser from "csv-parser";

const prisma = new PrismaClient();

function getDiscsFromCsv(): Promise<{ [key: string]: string[] }> {
  return new Promise((resolve, reject) => {
    // Read CSV file and group discs by manufacturer
    const approvedDiscs: any = {};
    const filePath = path.resolve(__dirname, "pdga-discs.csv");
    createReadStream(filePath, { encoding: "utf-8" })
      .pipe(csvParser())
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => resolve(approvedDiscs))
      .on("data", (row) => {
        if (row["Manufacturer / Distributor"] in approvedDiscs) {
          approvedDiscs[row["Manufacturer / Distributor"]].push(
            row["Disc Model"]
          );
        } else {
          approvedDiscs[row["Manufacturer / Distributor"]] = [
            row["Disc Model"],
          ];
        }
      });
  });
}

function parseFlightNumbers(flightNumbers: string, manufacturer: string) {
  // TODO: Change parsing based on manufacturer strings
  return flightNumbers
    .substring(1, flightNumbers.length - 1)
    .trim()
    .split(" | ");
}

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const approvedDiscs = await getDiscsFromCsv();

  for (const [manufacturer, models] of Object.entries(approvedDiscs)) {
    // Skip for testing purposes
    if (manufacturer !== "Innova Champion Discs") {
      continue;
    }

    // @ts-ignore
    const makeUrl = (manufacturer, model): string =>
      `https://www.innovadiscs.com/?s=${model}`;

    for (const model of models) {
      const found = await prisma.disc.findFirst({ where: { model } });
      if (found) {
        return;
      }

      try {
        await page.goto(makeUrl(manufacturer, model), {
          waitUntil: "networkidle2",
        });

        const discData = await page.evaluate(() => {
          const name = (
            document.querySelector(".disc-box .entry-title") as HTMLDivElement
          ).innerText;
          const flightNumbers = (
            document.querySelector(".disc-box h5") as HTMLDivElement
          ).innerText;

          return {
            name,
            flightNumbers,
          };
        });

        if (!discData.name) {
          return console.error(
            `Unable to pull name/flight numbers from the website: ${model}`
          );
        }

        const [speed, glide, turn, fade] = parseFlightNumbers(
          discData.flightNumbers,
          manufacturer
        );

        await prisma.disc.create({
          data: {
            model,
            manufacturer,
            speed: parseInt(speed),
            glide: parseInt(glide),
            turn: parseInt(turn),
            fade: parseInt(fade),
          },
        });
      } catch {
        console.error(`Unable to scrape ${manufacturer}:${model}`);
      }
    }
  }

  await browser.close();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
