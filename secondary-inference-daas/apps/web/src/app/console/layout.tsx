'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ConsoleSidebar from '@/components/console-sidebar'
import ConsoleHeader from '@/components/console-header'

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to sign in...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsoleHeader />
      <div className="flex">
        <ConsoleSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
