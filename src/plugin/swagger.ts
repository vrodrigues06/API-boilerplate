// plugins/swagger.ts
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'API Auto-Documentada',
        description: 'API construída com Fastify, Zod e Swagger',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}

export default fp(swaggerPlugin)
