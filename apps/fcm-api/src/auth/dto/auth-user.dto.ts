import { SwaggerSchema } from '@/common/decorators/swagger-schema.decorator.js'
import { createZodDto } from '@anatine/zod-nestjs'
import { authUserSchema } from '@fcm/shared/auth'

@SwaggerSchema(authUserSchema, {
  examples: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatars/user.jpg',
    authType: 'local',
    oauthProvider: 'google',
    roles: ['user', 'admin'],
  },
})
export class AuthUserDtoSwagger extends createZodDto(authUserSchema) {}
