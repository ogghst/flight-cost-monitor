import { AuthUserWithTokens } from '@fcm/shared/auth'
import { ConsoleLogger } from '@fcm/shared/logging/console'
import { OAuthProvider } from '@fcm/shared/types'
import { LoginOAuthUser } from '@fcm/shared/user'
import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

const log = new ConsoleLogger()

export const config: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        log.debug('credentials authorize callback triggered:', { credentials })

        try {
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include', // This is crucial for cookie handling
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          return data
        } catch (error) {
          console.error('Authentication failed:', error)
          return null
        }
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,

      async profile(profile, tokens) {
        //const { firstName, lastName } = parseName(profile.name ?? undefined)

        log.debug('github profile callback triggered:', { profile, tokens })

        if (!profile.email) {
          throw new Error('Email is required')
        }

        if (!tokens.access_token) {
          throw new Error('Access token is required')
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
              credentials: 'include', // This ensures cookies are handled
            }
          )

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Unknown error' }))
            console.error('OAuth exchange failed:', errorData)
            throw new Error('Failed to exchange OAuth token')
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
      log.debug('signIn callback triggered:', { user })

      return !!user
    },

    // apps/fcm-webui/src/lib/auth.ts
    async jwt({ token, user, account, trigger }) {
      const log = new ConsoleLogger()
      log.debug('JWT callback triggered:', { token, user, account, trigger })

      // Case 1: Initial sign-in with OAuth provider
      if (account && user) {
        // When signing in via OAuth, the user object contains data
        // from our profile() callback where we did the token exchange
        return {
          ...token,
          accessToken: user.accessToken,
          roles: user.roles || [],
          sub: user.id, // Important: set the subject claim to user ID
          email: user.email,
          name: user.name || user.email,
          picture: user.image,
          expiresAt: Date.now() + 14 * 60 * 1000, // 14 minutes for safety margin
        }
      }

      // Case 2: Token refresh is needed (happens automatically)
      const shouldRefresh =
        !token.expiresAt || Date.now() > (token.expiresAt as number) - 60000 // 1 min buffer

      if (shouldRefresh) {
        try {
          const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Important for the refresh token cookie
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-cache',
            mode: 'cors',
          })

          if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`)
          }

          const data = await response.json()

          if (!data.accessToken) {
            throw new Error('No access token in refresh response')
          }

          log.debug('Token refreshed successfully')

          // Update token with new data while preserving existing claims
          return {
            ...token,
            accessToken: data.accessToken,
            expiresAt: Date.now() + 14 * 60 * 1000,
            error: undefined, // Clear any previous errors
          }
        } catch (error) {
          log.error('Token refresh failed:', { error })

          // Return token with error - will trigger re-login on protected routes
          return {
            ...token,
            error: 'RefreshAccessTokenError',
          }
        }
      }

      // Case 3: Token is still valid, return as is
      return token
    },

    async session({ session, token }) {
      log.debug('session callback triggered:', { session, token })

      return {
        ...session,
        error: token.error,
        accessToken: token.accessToken as string,
        user: {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
          image: token.picture as string,
          roles: token.roles as string[],
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
}: {
  handlers: any
  auth: any
  signIn: any
  signOut: any
} = NextAuth(config)
