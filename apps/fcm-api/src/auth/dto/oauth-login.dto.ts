import { createZodDto } from '@anatine/zod-nestjs'
import { loginOAuthUserSchema } from '@fcm/shared/user'

export class LoginOAuthDtoSwagger extends createZodDto(loginOAuthUserSchema) {}

/*
export class OAuthLoginDto {
  @ApiProperty({
    enum: [OAuthProvider],
    description: 'OAuth provider',
  })
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider

  @ApiProperty({
    description: 'Provider-specific user ID',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string

  @ApiProperty({
    description: 'User email from OAuth provider',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    required: false,
    description: 'User first name',
  })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({
    required: false,
    description: 'User last name',
  })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({
    required: false,
    description: 'User avatar URL',
  })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({
    description: 'OAuth provider access token for verification',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string
}
*/
