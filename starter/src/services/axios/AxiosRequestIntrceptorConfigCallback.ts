import { getSession } from 'next-auth/react'
import type { InternalAxiosRequestConfig } from 'axios'

/**
 * Attach the backend JWT (stored in the NextAuth session) to every request.
 * Runs on the client side where the session is available.
 */
const AxiosRequestIntrceptorConfigCallback = async (
    config: InternalAxiosRequestConfig,
) => {
    if (typeof window !== 'undefined') {
        const session = await getSession()
        const token = session?.accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
}

export default AxiosRequestIntrceptorConfigCallback
