import { createZodDto } from '@anatine/zod-nestjs'
import { updateUserSchema } from '@fcm/shared/user'

export class UpdateUserDtoSwagger extends createZodDto(updateUserSchema) {}
