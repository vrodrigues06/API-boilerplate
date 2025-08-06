import { FastifyReply } from 'fastify'

interface Payload {
  sub: string
  name: string
  email: string
}

export async function setAuthToken(reply: FastifyReply, payload: Payload) {
  const token = await reply.jwtSign(payload, { expiresIn: '1m' })

  reply.setCookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })

  return token
}
