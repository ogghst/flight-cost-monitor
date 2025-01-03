import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class OAuthLoginDto {
  @ApiProperty({
    enum: ['GITHUB', 'GOOGLE'],
    description: 'OAuth provider',
  })
  @IsEnum(['GITHUB', 'GOOGLE'])
  @IsNotEmpty()
  provider: 'GITHUB' | 'GOOGLE'

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
