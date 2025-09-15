'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/console', icon: '📊' },
  { name: 'Sources', href: '/console/sources', icon: '📁' },
  { name: 'Jobs', href: '/console/jobs', icon: '⚙️' },
  { name: 'Events', href: '/console/events', icon: '🎯' },
  { name: 'Datasets', href: '/console/datasets', icon: '📦' },
  { name: 'Analytics', href: '/console/analytics', icon: '📈' },
  { name: 'Settings', href: '/console/settings', icon: '⚙️' },
]

export default function ConsoleSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6">
        <div className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
