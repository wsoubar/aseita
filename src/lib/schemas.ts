import { z } from 'zod'
import { isHttpUrl } from './utils'

const urlOrEmpty = (value: string) => value === '' || isHttpUrl(value)

export const DESCRIPTION_MAX = 4000

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, 'Use 3 a 20 caracteres: a-z, 0-9 e _')

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const registerSchema = loginSchema

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60),
  bio: z.string().trim().max(300, 'Máximo de 300 caracteres'),
  avatar_url: z
    .string()
    .trim()
    .refine(urlOrEmpty, 'Informe uma URL http(s) válida'),
  preferred_system_id: z.string(),
})

export const characterSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(80),
  system_id: z.string().min(1, 'Selecione um sistema'),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Máximo de ${DESCRIPTION_MAX} caracteres`),
  image_url: z
    .string()
    .trim()
    .refine(urlOrEmpty, 'Informe uma URL http(s) válida'),
})

export const postSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escreva algo')
    .max(1000, 'Máximo de 1000 caracteres'),
  character_id: z.string(),
})

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escreva algo')
    .max(500, 'Máximo de 500 caracteres'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type CharacterValues = z.infer<typeof characterSchema>
export type PostValues = z.infer<typeof postSchema>
export type CommentValues = z.infer<typeof commentSchema>
