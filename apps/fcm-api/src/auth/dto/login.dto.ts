import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string // Can be email or username

  @IsString()
  @MinLength(8)
  password: string
}