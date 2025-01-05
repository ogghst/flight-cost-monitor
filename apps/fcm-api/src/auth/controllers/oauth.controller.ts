import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { Public } from '../decorators/public.decorator.js'
import { OAuthLoginDto } from '../dto/oauth-login.dto.js'
import { AuthService } from '../services/auth.service.js'

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('github')
  @Public()
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiBody({ type: OAuthLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with GitHub',
  })
  @ApiResponse({ status: 401, description: 'Invalid OAuth data' })
  async githubCallback(
    @Body() data: OAuthLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      // OAuth verification is handled in oauthLogin
      const result = await this.authService.oauthLogin(data)

      // Set refresh token as httpOnly cookie
      response.cookie('fcm_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      })

      return {
        ...result,
        refreshToken: undefined, // Don't send refresh token in response body
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      console.error('OAuth authentication failed:', error)
      throw new InternalServerErrorException('OAuth authentication failed')
    }
  }
}
