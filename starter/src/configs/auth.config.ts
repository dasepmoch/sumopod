import type { NextAuthConfig } from 'next-auth'
import validateCredential from '../server/actions/user/validateCredential'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { SignInCredential } from '@/@types/auth'

export default {
    providers: [
        Github({
            clientId: process.env.GITHUB_AUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                /** validate credentials from backend here */
                const user = await validateCredential(
                    credentials as SignInCredential,
                )
                if (!user) {
                    return null
                }
                return {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    image: user.avatar,
                    authority: user.authority,
                    accessToken: user.accessToken,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Persist the authority & backend access token right after signin
            if (user) {
                token.authority = user.authority
                token.accessToken = user.accessToken
            }
            return token
        },
        async session({ session, token }) {
            // Send properties to the client
            return {
                ...session,
                accessToken: token.accessToken,
                user: {
                    ...session.user,
                    id: token.sub,
                    authority: token.authority,
                },
            }
        },
    },
} satisfies NextAuthConfig
