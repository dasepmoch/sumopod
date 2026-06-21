import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            authority: string[] /** add extra user attributes here */
        } & DefaultSession['user']
        accessToken?: string
    }

    interface User extends DefaultUser {
        authority: string[]
        accessToken?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        authority: string[]
        accessToken?: string
    }
}
