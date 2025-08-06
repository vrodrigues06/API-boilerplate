import * as z from 'zod'

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(3, 'O nome deve ter no mínimo 3 caracteres.')
      .max(100, 'O nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ' ]+$/, 'O nome deve conter apenas letras e espaços.'),

    email: z
      .email('E-mail Inválido')
      .max(100, 'O e-mail deve ter no máximo 100 caracteres.'),

    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmPassword'],
  })

// Tipos inferidos automaticamente
export type CreateUserDTO = z.infer<typeof createUserSchema>
