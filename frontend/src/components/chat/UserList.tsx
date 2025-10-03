// src/components/chat/UserList.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, MessageCircle } from 'lucide-react'
import { User as UserType } from '@/types'
import { usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { cn, formatDate } from '@/lib/utils'

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser, isAdmin } = useAuth()
  const { setActiveView } = useChat()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      if (isAdmin) {
        const response = await usersAPI.getUsers()
        setUsers(response.data)
      } else {
        // Regular users can only see admin
        const response = await usersAPI.getAdmin()
        setUsers([response.data])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startDirectMessage = (user: UserType) => {
    // This would set up a direct message conversation
    console.log('Start DM with:', user.username)
    setActiveView('direct')
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "bg-white p-3 rounded-lg border-2 border-transparent",
              "hover:border-gray-200 transition-all"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      user.isOnline ? "bg-green-100" : "bg-gray-100"
                    )}>
                      <User className={cn(
                        "h-5 w-5",
                        user.isOnline ? "text-green-600" : "text-gray-400"
                      )} />
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user.username}
                      </h3>
                      {user.role === 'ADMIN' && (
                        <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user.isOnline ? 'Online' : `Last seen ${formatDate(user.lastSeen)}`}
                    </p>
                  </div>
                </div>

                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => startDirectMessage(user)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Send message"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Admin-only user actions */}
              {isAdmin && user.role !== 'ADMIN' && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex space-x-2">
                  <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">
                    Ban User
                  </button>
                  <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                    View Profile
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}