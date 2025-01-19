import { createZodDto } from '@anatine/zod-nestjs'
import { loginCredentialsUserSchema } from '@fcm/shared/user'

/*
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string // Can be email or username

  @IsString()
  @MinLength(8)
  password: string
}
*/

export class LoginCredentialsUserDtoSwagger extends createZodDto(
  loginCredentialsUserSchema
) {}
