import fastify from 'fastify'
import { logger } from './utils/logger.js'
import swaggerPlugin from './plugin/swagger.js'
import jwtPlugin from './plugin/jwt.js'
import { signup } from './routes/signup.js'
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyCookie from '@fastify/cookie'
import { login } from './routes/login.js'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'

const app = fastify({
  logger: logger(),
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Security
app.register(fastifyHelmet)
app.register(fastifyCors, {
  origin: '*',
})
app.register(fastifyRateLimit, {
  max: 65,
  timeWindow: '1 minute',
})

// Swagger configs
app.register(swaggerPlugin)

// JWT Plugin

app.register(jwtPlugin)
app.register(fastifyCookie)

// Routes
app.register(signup)
app.register(login)
app.get('/', (req, reply) => {
  return reply.status(200).send({
    message: 'Hello World',
  })
})

app.setErrorHandler((error, _request, reply) => {
  if (error.validation) {
    return reply.status(400).send({
      status: 'fail',
      message: error.message,
    })
  }

  if (error.statusCode === 429) {
    return reply.status(429).send({
      message: 'You hit the rate limit! Slow down please!',
    })
  }
})

export { app }
