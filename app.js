const fastifyPlugin = require('fastify-plugin')
const fastifySwagger = require('fastify-swagger')
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

  app.register(fastifySwagger, {
    routePrefix: '/',
    swagger: {
      info: {
        title: 'Disc API',
        description: 'API documentation for the Disc app',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
    exposeRoute: true,
  })

  app.register(fastifyPlugin(prismaPlugin))

  app.get('/discs', {
    schema: {
      description: 'Retrieve a paginated list of discs',
      tags: ['discs'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
        },
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            discs: { type: 'array', items: { type: 'object' } },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            totalPages: { type: 'integer' },
            totalItems: { type: 'integer' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const page = parseInt(request.query.page) || 1;
      const pageSize = parseInt(request.query.pageSize) || 10;
      const skip = (page - 1) * pageSize;

      const discs = await prisma.disc.findMany({
        skip,
        take: pageSize,
      });

      const totalItems = await prisma.disc.count();

      reply.send({
        discs,
        page,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
      });
    }
  })

  app.post('/discs', {
    schema: {
      description: 'Create a new disc',
      tags: ['discs'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const newDisc = await app.prisma.disc.create({
        data: {
          name: request.body.name,
        },
      })
      reply.send(newDisc)
    }
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