import { createZodDto } from '@anatine/zod-nestjs'
import { userSchema, userWithRelationsSchema } from '@fcm/shared/user'

export class UserDtoSwagger extends createZodDto(userSchema) {}

export class UserWithRelationsDtoSwagger extends createZodDto(
  userWithRelationsSchema
) {}
