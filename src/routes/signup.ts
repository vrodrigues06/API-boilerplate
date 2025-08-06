import { FastifyTypedInstance } from '@/@types/fastify.js'
import { createUser } from '@/functions/create-user.js'
import { AlreadyExistsEmailError } from '@/functions/errors/already-exists-email.js'
import { AppError } from '@/functions/errors/app-error.js'
import { setAuthToken } from '@/functions/set-auth-token.js'
import { prisma } from '@/lib/prisma.js'
import {
  CreateUserDTO,
  createUserSchema,
} from '@/schemas/create-user-schema.js'
import { hashPassword } from '@/utils/hash-password.js'
import { FastifyRequest } from 'fastify'
import * as z from 'zod'

const onSuccessResponseSchema = z.object({
  status: z.literal('success'),
  token: z.string(),
  data: z.object({
    user: z.object({
      id: z.uuid(),
      name: z.string(),
      email: z.email(),
      createdAt: z.date(),
    }),
  }),
})

const onAlreadyExistsEmailErrorSchema = z.object({
  status: z.literal('fail'),
  message: z.literal('email already exists'),
})

const onBadRequestErrorSchema = z.object({
  status: z.literal('fail'),
  message: z.string(),
})

const onServerInternalErrorSchema = z.object({
  status: z.literal('fail'),
  message: z.string(),
})

export function signup(app: FastifyTypedInstance) {
  app.post(
    '/signup',
    {
      schema: {
        body: createUserSchema,
        response: {
          201: onSuccessResponseSchema,
          400: onBadRequestErrorSchema,
          409: onAlreadyExistsEmailErrorSchema,
          500: onServerInternalErrorSchema,
        },
        tags: ['Auth'],
        summary: 'Register New User',
      },
    },
    async (req: FastifyRequest<{ Body: CreateUserDTO }>, reply) => {
      try {
        const { name, email, password } = req.body

        const existingUser = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (existingUser) {
          throw new AlreadyExistsEmailError()
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await createUser(name, email, hashedPassword)

        const token = await setAuthToken(reply, {
          sub: newUser.id,
          name: newUser.name,
          email: newUser.email,
        })

        const safeUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        }

        return reply.status(201).send({
          status: 'success',
          token,
          data: {
            user: safeUser,
          },
        })
      } catch (error) {
        if (error instanceof AppError) {
          switch (error.constructor.name) {
            case 'AlreadyExistsEmailError':
              return reply.status(409).send({
                status: 'fail',
                message: 'email already exists',
              })
            default:
              throw error
          }
        }
        throw error
      }
    },
  )
}
