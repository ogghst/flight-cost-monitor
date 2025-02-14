export const AUTH_CONSTANTS = {
  COOKIE_NAMES: {
    REFRESH_TOKEN: 'fcm_refresh_token',
    SESSION: 'next-auth.session-token'
  },
  TOKEN_EXPIRATION: {
    ACCESS: 15 * 60, // 15 minutes in seconds
    REFRESH: 30 * 24 * 60 * 60, // 30 days in seconds
    REFRESH_THRESHOLD: 60 * 1000 // 1 minute in milliseconds
  },
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  }
} as const

// Cookie configuration factory
export const getCookieConfig = (isProd: boolean) => ({
  refreshToken: {
    name: AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN,
    options: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax' as const,
      path: '/',
      maxAge: AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH * 1000
    }
  }
});