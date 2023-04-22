const fs = require('fs');
const csv = require('csv-parser');

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

function mapFlexibility(floatValue) {
  if (floatValue <= 2) {
    return 'LOW';
  } else if (floatValue <= 4) {
    return 'MEDIUM';
  } else {
    return 'HIGH';
  }
}

async function main() {
  const filePath = 'pdga-approved-disc-golf-discs_2023-03-15T19-00-31.csv'; // Path to your CSV file

  const discs = [];

  // Read and parse the CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        discs.push({
          manufacturer: row.Manufacturer,
          discModel: row['Disc Model'],
          maxWeight: parseFloat(row['Max Weight']),
          diameter: parseFloat(row.Diameter),
          height: parseFloat(row.Height),
          rimDepth: parseFloat(row['Rim Depth']),
          insideRimDiameter: parseFloat(row['Inside Rim Diameter']),
          rimThickness: parseFloat(row['Rim Thickness']),
          rimConfiguration: parseFloat(row['Rim Configuration']),
          flexibility: mapFlexibility(parseFloat(row.Flexibility)),
          certificationNumber: row['Certification Number'],
          approvedDate: new Date(row['Approved Date']),
        });
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error while processing CSV file:', error);
        reject(error);
      });
  });

  await prisma.disc.createMany({
    data: discs,
    skipDuplicates: true
  })

  console.log('Data successfully seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });