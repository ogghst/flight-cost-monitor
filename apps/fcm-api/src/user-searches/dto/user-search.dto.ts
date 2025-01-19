import { createZodDto } from '@anatine/zod-nestjs'
import { userSearchSchema } from '@fcm/shared/user-search'

export class UserSearchDtoSwagger extends createZodDto(userSearchSchema) {}
