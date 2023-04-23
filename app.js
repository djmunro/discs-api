const fastifyPlugin = require('fastify-plugin')
const Fastify = require('fastify')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function prismaPlugin(fastify, options) {
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async (instance, done) => {
    await prisma.$disconnect()
    done()
  })
}

const createFastifyApp = () => {
  const app = Fastify()

  app.register(fastifyPlugin(prismaPlugin))

  app.get('/discs', async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const pageSize = parseInt(request.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const discs = await prisma.disc.findMany({
      skip,
      take: pageSize,
    });

    const totalItems = await prisma.disc.count();

    reply.json({
      discs,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    });
  })

  app.post('/discs', async (request, reply) => {
    const newDisc = await app.prisma.disc.create({
      data: {
        name: request.body.name,
      },
    })
    reply.send(newDisc)
  })

  return app
}

const fastifyApp = createFastifyApp()

const isVercel = process.env.VERCEL_REGION !== undefined
if (isVercel) {
  module.exports = (req, res) => {
    fastifyApp.ready((err) => {
      if (err) throw err
      fastifyApp.server.emit('request', req, res)
    })
  }
} else {
  fastifyApp.listen({ port: 3000 }, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log('Server listening on http://localhost:3000')
  })
}