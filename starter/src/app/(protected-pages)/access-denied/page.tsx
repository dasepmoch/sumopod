'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

const AccessDeniedPage = () => {
    const router = useRouter()
    return (
        <Card>
            <div className="text-center py-16">
                <h3 className="mb-2">Access Denied</h3>
                <p className="text-gray-500 mb-6">
                    You don&apos;t have permission to access this page.
                </p>
                <Button variant="solid" onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        </Card>
    )
}

export default AccessDeniedPage
