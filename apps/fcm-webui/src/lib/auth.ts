import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const config = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.image = profile.avatar_url
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.image as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
