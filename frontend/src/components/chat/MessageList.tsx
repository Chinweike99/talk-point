'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Image as ImageIcon } from 'lucide-react'
import { Message } from '@/types'
import { formatDate, formatTime, cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface MessageListProps {
  messages: Message[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.senderId === user?.id
        const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-start space-x-3 group",
              isOwn && "flex-row-reverse space-x-reverse"
            )}
          >
            {/* Avatar */}
            {showAvatar ? (
              <div className={cn(
                "w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0",
                isOwn ? "bg-primary-500" : "bg-gray-300"
              )}>
                <User className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="w-8 flex-shrink-0" />
            )}

            {/* Message Content */}
            <div className={cn(
              "max-w-[70%] space-y-1",
              isOwn && "text-right"
            )}>
              {/* Sender info */}
              {showAvatar && (
                <div className={cn(
                  "flex items-center space-x-2 mb-1",
                  isOwn && "flex-row-reverse space-x-reverse"
                )}>
                  <span className="text-sm font-medium text-gray-900">
                    {message.sender.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              )}

              {/* Message bubble */}
              <div className={cn(
                "px-4 py-2 rounded-2xl transition-colors",
                isOwn
                  ? "bg-primary-500 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md",
                !showAvatar && isOwn ? "rounded-tr-md" : "",
                !showAvatar && !isOwn ? "rounded-tl-md" : ""
              )}>
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <p className="break-words">{message.content}</p>
              </div>

              {/* Timestamp for consecutive messages */}
              {!showAvatar && (
                <span className={cn(
                  "text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity",
                  isOwn ? "pr-4" : "pl-4"
                )}>
                  {formatTime(message.createdAt)}
                </span>
              )}
            </div>
          </motion.div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}