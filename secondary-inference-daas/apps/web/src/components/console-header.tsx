'use client'

import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'

export default function ConsoleHeader() {
  const { user, signOut } = useAuth()
  const [selectedOrg, setSelectedOrg] = useState('Demo Organization')
  const [selectedProject, setSelectedProject] = useState('Retail Analytics')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Secondary Inference DaaS
            </h1>
            
            {/* Organization Switcher */}
            <div className="flex items-center space-x-2">
              <label htmlFor="org-select" className="text-sm font-medium text-gray-700">
                Organization:
              </label>
              <select
                id="org-select"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Demo Organization">Demo Organization</option>
              </select>
            </div>

            {/* Project Switcher */}
            <div className="flex items-center space-x-2">
              <label htmlFor="project-select" className="text-sm font-medium text-gray-700">
                Project:
              </label>
              <select
                id="project-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Retail Analytics">Retail Analytics</option>
                <option value="Traffic Monitoring">Traffic Monitoring</option>
                <option value="Security Events">Security Events</option>
              </select>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
