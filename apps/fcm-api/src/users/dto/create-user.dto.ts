import { createZodDto } from '@anatine/zod-nestjs'
import {
  createCredentialsUserSchema,
  createOAuthUserSchema,
} from '@fcm/shared/user'

export class CreateUserWithCredentialsDtoSwagger extends createZodDto(
  createCredentialsUserSchema
) {}

export class CreateUserWithOAuthDtoSwagger extends createZodDto(
  createOAuthUserSchema
) {}
