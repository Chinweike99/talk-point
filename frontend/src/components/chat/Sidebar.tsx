// src/components/chat/Sidebar.tsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageCircle, Search, Plus } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { cn } from '@/lib/utils'
// import { RoomList } from './RoomList'
// import { UserList } from './UserList'
// import { ConversationList } from './ConversationList'

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, activeView, setActiveView } = useChat()

  const tabs = [
    { id: 'rooms' as const, label: 'Rooms', icon: Users },
    { id: 'direct' as const, label: 'Messages', icon: MessageCircle },
    { id: 'users' as const, label: 'Users', icon: Users },
  ]

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-80 bg-white border-r border-gray-200 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeView === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* {activeView === 'rooms' && <RoomList />}
            {activeView === 'direct' && <ConversationList />}
            {activeView === 'users' && <UserList />} */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}