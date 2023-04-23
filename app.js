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

const app = Fastify()

app.register(fastifyPlugin(prismaPlugin))

app.get('/discs', async (request, reply) => {
  const discs = await app.prisma.disc.findMany()
  reply.send(discs)
})

app.post('/discs', async (request, reply) => {
  const newDisc = await app.prisma.disc.create({
    data: {
      name: request.body.name,
    },
  })
  reply.send(newDisc)
})

const start = async () => {
  try {
    await app.listen(3000)
    console.log('Server listening on http://localhost:3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  start()
} else {
  module.exports = app
}