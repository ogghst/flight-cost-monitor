import { createZodDto } from '@anatine/zod-nestjs'
import { authUserSchema } from '@fcm/shared/auth'

export class AuthUserDtoSwagger extends createZodDto(authUserSchema) {}
