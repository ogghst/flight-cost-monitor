import { IsString, IsEmail, IsOptional, MinLength, Matches } from 'class-validator'

export class RegisterDto {
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
      message: 'Password must contain uppercase, lowercase, number and special character'
    }
  )
  password: string

  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string
}