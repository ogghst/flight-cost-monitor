import { parseName } from '@/lib/utils'
import { PrismaClient } from '@fcm/storage'
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

const prisma = new PrismaClient()

export const config = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id.toString(),
          githubProfile: profile,
          roles: ['USER'], // Default role
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          const { firstName, lastName } = parseName(profile?.name?.toString())
          await prisma.user.upsert({
            where: {
              email: user.email!,
            },
            create: {
              email: user.email!,
              githubId: profile?.id?.toString(),
              githubProfile: JSON.stringify(profile),
              image: profile?.avatar_url?.toString(),
              firstName: firstName,
              lastName: lastName,
              active: true,
              roles: {
                connect: {
                  name: 'USER', // Default role
                },
              },
              password: '',
            },
            update: {
              githubId: profile?.id?.toString(),
              githubProfile: JSON.stringify(profile),
              image: profile?.avatar_url?.toString(),
              firstName: firstName,
              lastName: lastName,
              updatedAt: new Date(),
            },
          })
          return true
        } catch (error) {
          console.error('Error persisting user:', error)
          return '/auth/error?error=DatabaseError'
        }
      }
      return true
    },
    async jwt({ token, user, profile }) {
      if (profile) {
        token.githubId = profile.id
        token.image = profile.avatar_url
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.image as string
        session.user.roles = token.roles as string[]
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
