import { AuthUserWithTokens } from '@fcm/shared/auth'
import { ConsoleLogger } from '@fcm/shared/logging/console'
import { OAuthProvider } from '@fcm/shared/types'
import { LoginOAuthUser } from '@fcm/shared/user'
import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

const log = new ConsoleLogger()

export const config = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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
            accessToken: data.tokenPair.accessToken,
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
      return !!user
    },

    async jwt({ token, trigger }) {
      log.debug(
        'jwt callback. objects:\n   token: ' +
          JSON.stringify(token) +
          '\n   trigger: ' +
          JSON.stringify(trigger)
      )

      // Return previous token if the access token has not expired
      if (Date.now() < (token.expiresAt as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      try {
        const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Important for sending cookies
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Failed to refresh token')

        const tokens = await response.json()

        return {
          ...token,
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        return { ...token, error: 'RefreshAccessTokenError' as const }
      }
    },

    async session({ session, token }) {
      log.debug(
        'session callback. objects:\n   token: ' +
          JSON.stringify(token) +
          '\n    session: ' +
          JSON.stringify(session)
      )

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
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
