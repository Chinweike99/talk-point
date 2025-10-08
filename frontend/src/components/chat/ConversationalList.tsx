'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, MessageCircle } from 'lucide-react'
import { Conversation } from '@/types'
import { messageAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/lib/utils'
import { useEnhancedChat } from '@/contexts/EnhancedChatContext'

export const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { startDirectMessage } = useEnhancedChat()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversation();
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // const startConversation = (conversation: Conversation) => {
  //   // This would open the direct message chat
  //   console.log('Open conversation with:', conversation.user.username)
  // }
  const handleOpenConversation = (conversation: Conversation) => {
    startDirectMessage(conversation.user)
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
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleOpenConversation(conversation)}
              className="w-full p-3 rounded-lg text-left transition-all hover:bg-gray-50 border-2 border-transparent"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    conversation.user.isOnline ? "bg-green-100" : "bg-gray-100"
                  )}>
                    <User className={cn(
                      "h-6 w-6",
                      conversation.user.isOnline ? "text-green-600" : "text-gray-400"
                    )} />
                  </div>
                  {conversation.user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.user.username}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.content}
                  </p>

                  {conversation.unreadCount > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-primary-600 font-medium">
                        {conversation.unreadCount} new message{conversation.unreadCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a conversation by messaging a user
            </p>
          </div>
        )}
      </div>
    </div>
  )
}