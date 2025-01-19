import { createZodDto } from '@anatine/zod-nestjs'
import { createUserSearchSchema } from '@fcm/shared/user-search'

export class CreateUserSearchDtoSwagger extends createZodDto(
  createUserSearchSchema
) {}
