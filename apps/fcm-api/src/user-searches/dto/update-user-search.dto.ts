import { createZodDto } from '@anatine/zod-nestjs'
import { updateUserSearchSchema } from '@fcm/shared/user-search'

export class UpdateUserSearchDtoSwagger extends createZodDto(
  updateUserSearchSchema
) {}
