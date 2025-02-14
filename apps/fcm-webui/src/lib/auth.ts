import { AuthUserWithTokens, RefreshResponse } from '@fcm/shared/auth'
import { ConsoleLogger } from '@fcm/shared/logging/console'
import { OAuthProvider } from '@fcm/shared/types'
import { LoginOAuthUser } from '@fcm/shared/user'
import { jwtDecode } from 'jwt-decode'
import NextAuth, { NextAuthConfig } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

const log = new ConsoleLogger()

// Early refresh threshold - 1 minute before expiry
const REFRESH_THRESHOLD = 60 * 1000
// Queue to handle concurrent refresh requests
let refreshPromise: Promise<JWT> | null = null

function getTokenExpirationFromJwt(token: string): number {
  try {
    const decoded = jwtDecode(token)
    if (decoded && decoded.exp) {
      // exp is in seconds, convert to milliseconds
      return decoded.exp * 1000
    }
  } catch (error) {
    log.error('Failed to decode JWT:', { error })
  }
  return 0
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      log.debug('Waiting for existing refresh to complete')
      return await refreshPromise
    }

    // Create new refresh promise
    refreshPromise = (async () => {
      try {
        log.debug('Starting token refresh')
        const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.accessToken}`, // Add the old token for validation
          },
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error' }))
          log.error('Refresh failed:', errorData)
          throw new Error('RefreshAccessTokenError')
        }

        const refreshedTokens: RefreshResponse = await response.json()
        const expiresAt = getTokenExpirationFromJwt(refreshedTokens.accessToken)

        // Validate the new token
        if (!refreshedTokens.accessToken || !expiresAt) {
          throw new Error('Invalid refresh response')
        }

        log.debug('Token refresh successful', { expiresAt })
        return {
          ...token,
          accessToken: refreshedTokens.accessToken,
          accessTokenExpires: expiresAt,
          error: undefined,
        }
      } catch (error) {
        log.error('Token refresh failed:', { error })
        throw error // Rethrow to be caught by outer try-catch
      }
    })()

    return await refreshPromise
  } catch (error) {
    log.error('Token refresh failed:', { error })
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  } finally {
    refreshPromise = null // Clear the promise when done
  }
}

export const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        log.debug('credentials authorize callback triggered')

        try {
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
          })

          if (!response.ok) {
            return null
          }

          const data = (await response.json()) as AuthUserWithTokens

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username || data.user.email,
            roles: data.user.roles,
            accessToken: data.accessToken,
          }
        } catch (error) {
          console.error('Authentication failed:', error)
          return null
        }
      },
    }),
    GitHub({
      // Explicitly define required scopes
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      async profile(profile, tokens) {
        log.debug('GitHub profile callback triggered', {
          hasEmail: !!profile.email,
          hasAccessToken: !!tokens.access_token,
          profileId: profile.id,
        })

        if (!profile.email) {
          log.error('GitHub profile missing email', {
            profile: { ...profile, email: undefined },
          })
          throw new Error('GitHub email is required and must be public')
        }

        if (!tokens.access_token) {
          log.error('GitHub OAuth missing access token')
          throw new Error('GitHub OAuth token is required')
        }

        // Validate token format
        try {
          await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          })
        } catch (error) {
          log.error('GitHub token validation failed', { error })
          throw new Error('Invalid GitHub token')
        }

        const loginOAuthUser: LoginOAuthUser = {
          email: profile.email,
          accessToken: tokens.access_token,
          oauthProvider: OAuthProvider.GITHUB,
          oauthProviderId: profile.id.toString(),
          oauthProfile: JSON.stringify(profile),
        }

        try {
          const response = await fetch(
            `${process.env.API_URL}/auth/oauth/github`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(loginOAuthUser),
              credentials: 'include',
            }
          )

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Unknown error' }))
            console.error('OAuth exchange failed:', errorData)
            throw new Error(
              `Failed to exchange OAuth token: ${errorData.message}`
            )
          }

          const data = <AuthUserWithTokens>await response.json()

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username || data.user.email,
            image: profile.avatar_url,
            roles: data.user.roles,
            accessToken: data.accessToken,
          }
        } catch (error) {
          console.error('OAuth token exchange failed:', error)
          throw new Error('Authentication failed')
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      log.debug('signIn callback triggered')
      return !!user
    },

    async jwt({ token, user, trigger }): Promise<JWT> {
      log.debug('JWT callback triggered', { trigger, hasUser: !!user })

      // Initial sign in
      if (user) {
        log.debug('Initial signin')
        const expiresAt = getTokenExpirationFromJwt(user.accessToken)
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpires: expiresAt,
          email: user.email,
          roles: user.roles,
          sub: user.id,
        }
      }

      // Return previous token if still valid
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - REFRESH_THRESHOLD
      ) {
        log.debug('Token still valid')
        return token
      }

      // Token needs refresh
      log.debug('Token needs refresh')
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      log.debug('session callback triggered', {
        hasToken: !!token,
        tokenExpiry: token.accessTokenExpires,
      })

      if (!token.sub) {
        log.error('Missing user ID in token')
        throw new Error('User ID is required')
      }

      // Check for token errors
      if (token.error) {
        log.warn('Token error detected', { error: token.error })
      }

      return {
        ...session,
        error: token.error,
        user: {
          id: token.sub,
          name: token.name ?? '',
          email: token.email ?? '',
          roles: (token.roles as string[]) ?? [],
          accessToken: token.accessToken as string,
          image: token.picture ?? '',
        },
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
    //maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE,
    //updateAge: AUTH_CONSTANTS.REFRESH_THRESHOLD, // Update session age when token is refreshed
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
