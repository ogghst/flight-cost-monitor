import { OAuthProvider } from '@fcm/shared'
import type { CreateCredentialsUser, CreateOAuthUser } from '@fcm/storage'
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator'

export class CreateUserWithCredentialsDto
  implements Omit<CreateCredentialsUser, 'authType' | 'active'>
{
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  username?: string

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    }
  )
  password: string

  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string

  @IsString()
  @IsOptional()
  image?: string
}

export class CreateUserWithOAuthDto
  implements Omit<CreateOAuthUser, 'authType' | 'active'>
{
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  username?: string

  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string

  @IsString()
  @IsOptional()
  image?: string

  @IsEnum(['GITHUB', 'GOOGLE'])
  oauthProvider: OAuthProvider

  @IsString()
  oauthProviderId: string

  @IsString()
  @IsOptional()
  oauthProfile?: string
}
