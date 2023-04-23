const fastifyPlugin = require('fastify-plugin')
const Fastify = require('fastify')
const { PrismaClient } = require('@prisma/client')

async function prismaPlugin(fastify, options) {
  const prisma = new PrismaClient()
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async (instance, done) => {
    await prisma.$disconnect()
    done()
  })
}

const createFastifyApp = () => {
  const app = Fastify()

  app.register(fastifyPlugin(prismaPlugin))

  app.get('/api/discs', async (request, reply) => {
    const discs = await app.prisma.disc.findMany()
    reply.send(discs)
  })

  app.post('/api/discs', async (request, reply) => {
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