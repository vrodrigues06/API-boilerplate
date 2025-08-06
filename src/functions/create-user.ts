import { prisma } from '@/lib/prisma.js'

export async function createUser(
  name: string,
  email: string,
  password: string,
) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  })

  return user
}
