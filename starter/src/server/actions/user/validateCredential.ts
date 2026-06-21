'use server'
import type { SignInCredential } from '@/@types/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000/api'

/**
 * Validate credentials against the NestJS backend.
 * Returns a shape consumed by the Credentials provider in auth.config.ts.
 */
const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values

    try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            cache: 'no-store',
        })

        if (!res.ok) {
            return null
        }

        const data = await res.json()
        const { user, accessToken } = data

        if (!user || !accessToken) {
            return null
        }

        return {
            id: String(user.id),
            userName: user.name,
            email: user.email,
            avatar: '',
            authority: [user.role],
            accessToken,
        }
    } catch {
        return null
    }
}

export default validateCredential
