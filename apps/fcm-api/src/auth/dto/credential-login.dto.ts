import { createZodDto } from '@anatine/zod-nestjs'
import { loginCredentialsUserSchema } from '@fcm/shared/user'


export class LoginCredentialsUserDtoSwagger extends createZodDto(
  loginCredentialsUserSchema
) {}
