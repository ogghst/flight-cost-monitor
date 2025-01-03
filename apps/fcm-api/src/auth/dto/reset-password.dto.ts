import { IsString, IsEmail, MinLength, Matches } from 'class-validator'

export class RequestPasswordResetDto {
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password must contain uppercase, lowercase, number and special character'
    }
  )
  password: string
}