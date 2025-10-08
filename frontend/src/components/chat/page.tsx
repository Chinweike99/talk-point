'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/chat/Sidebar'
import { MessageList } from '@/components/chat/MessageList'
import { EnhancedMessageInput } from '@/components/chat/EnhancedMessageInput'
import { DirectMessageChat } from '@/components/chat/DirectMessageChat'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useAuth } from '@/contexts/AuthContext'
import { useEnhancedChat } from '@/contexts/EnhancedChatContext'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const { user, isLoading } = useAuth()
  const { 
    messages, 
    currentRoom, 
    currentConversation, 
    activeView,
    isAdminPanelOpen 
  } = useEnhancedChat()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) return null

  // Render admin panel if open
  if (isAdminPanelOpen) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <AdminPanel />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              {/* Room Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">#{currentRoom.name}</h2>
                    <p className="text-sm text-gray-500">
                      {currentRoom.members.length} members • {currentRoom.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{currentRoom._count?.messages || 0} messages</span>
                  </div>
                </div>
              </div>

              {/* Room Messages */}
              <MessageList messages={messages} />

              <EnhancedMessageInput />
            </>
          ) : currentConversation ? (
            <DirectMessageChat user={currentConversation} />
          ) : activeView === 'admin' ? (
            <AdminPanel />
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <div className="text-2xl">💬</div>
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to ChatApp</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  {activeView === 'direct' 
                    ? "Select a conversation from the sidebar or start a new one by messaging a user."
                    : "Select a room from the sidebar to start chatting, or create a new room to get started."
                  }
                </p>
                {activeView !== 'direct' && (
                  <button
                    onClick={() => {/* Create room logic */}}
                    className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Create Room
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}