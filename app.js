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


async function main() {
  const app = Fastify({
    logger: true,
  })

  app.register(require('@fastify/swagger'))
  app.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  })

  app.put('/some-route/:id', {
    schema: {
      description: 'post some data',
      tags: ['user', 'code'],
      summary: 'qwerty',
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'user id'
          }
        }
      },
      body: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          obj: {
            type: 'object',
            properties: {
              some: { type: 'string' }
            }
          }
        }
      },
      response: {
        201: {
          description: 'Successful response',
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        },
        default: {
          description: 'Default response',
          type: 'object',
          properties: {
            foo: { type: 'string' }
          }
        }
      },
      security: [
        {
          "apiKey": []
        }
      ]
    }
  }, (req, reply) => { })

  app.register(fastifyPlugin(prismaPlugin))

  app.get('/', (request, reply) => {
    reply.redirect('/docs')
  })


  app.get('/discs', {
    schema: {},
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
    schema: {},
    handler: async (request, reply) => {
      const newDisc = await app.prisma.disc.create({
        data: {
          name: request.body.name,
        },
      })
      reply.send(newDisc)
    }
  })

  const isVercel = process.env.VERCEL_REGION !== undefined
  if (isVercel) {
    module.exports = (req, res) => {
      app.ready((err) => {
        if (err) throw err
        app.server.emit('request', req, res)
      })
    }
  } else {
    app.listen({ port: 3000 }, (err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log('Server listening on http://localhost:3000')
    })
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});