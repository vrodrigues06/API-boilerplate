import { FastifyTypedInstance } from '@/@types/fastify.js'
import { AppError } from '@/functions/errors/app-error.js'
import { InvalidCredentials } from '@/functions/errors/invalid-credentials.js'
import { setAuthToken } from '@/functions/set-auth-token.js'
import { prisma } from '@/lib/prisma.js'
import { comparePasswords } from '@/utils/hash-password.js'
import { FastifyRequest } from 'fastify'
import * as z from 'zod'

const loginBodySchema = z.object({
  email: z.email(),
  password: z.string(),
})
const onSuccessLoginSchema = z.object({
  status: z.literal('success'),
  token: z.string(),
})

const onInvalidCredentialsErrorSchema = z.object({
  status: z.literal('fail'),
  message: z.string(),
})

type loginInput = z.infer<typeof loginBodySchema>

export async function login(app: FastifyTypedInstance) {
  app.post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: onSuccessLoginSchema,
          400: onInvalidCredentialsErrorSchema,
        },
        summary: 'Log in',
        tags: ['Auth'],
      },
    },
    async (request: FastifyRequest<{ Body: loginInput }>, reply) => {
      try {
        const { email, password } = request.body

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!user) {
          throw new InvalidCredentials()
        }

        const isValidPassword = await comparePasswords(password, user.password)

        if (!isValidPassword) {
          throw new InvalidCredentials()
        }

        const token = await setAuthToken(reply, {
          sub: user.id,
          name: user.name,
          email: user.email,
        })

        reply.status(200).send({
          status: 'success',
          token,
        })
      } catch (error) {
        if (
          error instanceof AppError &&
          error.constructor.name === 'InvalidCredentials'
        )
          return reply.status(400).send({
            status: 'fail',
            message: 'invalid credentials',
          })

        throw error
      }
    },
  )
}
