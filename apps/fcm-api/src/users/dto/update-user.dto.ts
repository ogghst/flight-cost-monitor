import { IsString, IsOptional, IsUrl } from 'class-validator'
import type { UpdateUser } from '@fcm/storage'

export class UpdateUserDto implements UpdateUser {
  @IsString()
  @IsOptional()
  username?: string

  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string

  @IsUrl()
  @IsOptional()
  image?: string
}