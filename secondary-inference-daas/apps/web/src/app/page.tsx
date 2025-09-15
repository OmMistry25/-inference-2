'use client'

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Secondary Inference DaaS
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform vision model outputs into higher-order, time-aware events
          </p>
        </div>

        <div className="mt-12">
          {user ? (
            <div className="text-center">
              <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Welcome back!
                </h2>
                <p className="text-gray-600 mb-4">
                  Signed in as: {user.email}
                </p>
                <div className="space-y-2">
                  <Link
                    href="/console"
                    className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Go to Console
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in to access your projects and start processing vision data.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/auth/signin"
                    className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
