import { createZodDto } from '@anatine/zod-nestjs'
import { loginOAuthUserSchema } from '@fcm/shared/user'

export class LoginOAuthDtoSwagger extends createZodDto(loginOAuthUserSchema) {}
