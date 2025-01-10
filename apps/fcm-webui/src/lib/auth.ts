import { parseName } from '@/lib/utils'
import { OAuthProvider } from '@fcm/shared/auth'
import NextAuth, { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { tokenStorage } from './auth/token-storage'

export const config = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Call your API endpoint for credentials verification
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          
          // Store access token in memory
          await tokenStorage.setAccessToken(data.accessToken)

          // Return user data in the format expected by NextAuth
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username || data.user.email,
            image: data.user.avatar || null, // Add image for avatar
            roles: data.user.roles,
            accessToken: data.accessToken,
          }
        } catch (error) {
          console.error('Authentication failed:', error)
          return null
        }
      }
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      async profile(profile, tokens) {
        const { firstName, lastName } = parseName(profile.name ?? undefined)

        try {
          const response = await fetch(
            `${process.env.API_URL}/auth/oauth/github`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: OAuthProvider.GITHUB,
                providerId: profile.id.toString(),
                email: profile.email,
                firstName,
                lastName,
                avatar: profile.avatar_url,
                accessToken: tokens.access_token,
              }),
              credentials: 'include',
            }
          )

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('OAuth exchange failed:', errorData)
            throw new Error('Failed to exchange OAuth token')
          }

          const data = await response.json()

          // Store access token in memory
          await tokenStorage.setAccessToken(data.accessToken)
          
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
      return !!user
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.roles = user.roles
        // Make sure to include the image in the token
        token.picture = user.image || null
        token.email = user.email
        token.name = user.name
      }
      return token
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
          image: token.picture as string, // Ensure image is passed to session
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
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)