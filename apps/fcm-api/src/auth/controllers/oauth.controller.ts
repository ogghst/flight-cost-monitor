import { InjectLogger } from '@/logging/index.js'
import { type Logger } from '@fcm/shared/logging'
import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { Public } from '../decorators/public.decorator.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { AuthService } from '../services/auth.service.js'

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  @Post('github')
  @Public()
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiBody({ type: LoginOAuthDtoSwagger })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with GitHub',
  })
  @ApiResponse({ status: 401, description: 'Invalid OAuth data' })
  async githubCallback(
    @Body() data: LoginOAuthDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ) {
    this.logger.debug('GitHub OAuth callback request received', { data })

    try {
      // OAuth verification is handled in oauthLogin
      const result = await this.authService.oauthLogin(data, response)

      return result
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException(
        'OAuth authentication failed: ' + error
      )
    }
  }
}
