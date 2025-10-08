'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Send, Image as ImageIcon, Smile } from 'lucide-react'
import { Message, User as UserType } from '@/types'
import { messageAPI } from '@/lib/api'
import { socketService } from '@/lib/socket'
import { useAuth } from '@/contexts/AuthContext'
import { useEnhancedChat } from '@/contexts/EnhancedChatContext'
import { formatDate, formatTime, cn } from '@/lib/utils'

interface DirectMessageChatProps {
  user: UserType
}

export const DirectMessageChat: React.FC<DirectMessageChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user: currentUser } = useAuth()
  const { addNotification, markAsRead } = useEnhancedChat()

  useEffect(() => {
    loadMessages()
    setupSocketListeners()

    return () => {
      // Cleanup socket listeners
      socketService.off('direct_message', handleDirectMessage)
    }
  }, [user.id])

  useEffect(() => {
    scrollToBottom()
    markMessagesAsRead()
  }, [messages])

  const loadMessages = async (loadPage: number = 1) => {
    try {
      const response = await messageAPI.getDirectMessages(user.id, loadPage, 50)
      const newMessages = response.data.messages

      if (loadPage === 1) {
        setMessages(newMessages)
      } else {
        setMessages(prev => [...prev, ...newMessages])
      }

      setHasMore(response.data.pagination.hasNext)
      setPage(loadPage)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const setupSocketListeners = () => {
    socketService.on('direct_message', handleDirectMessage)
  }

  const handleDirectMessage = (message: Message) => {
    if (
      (message.senderId === user.id && message.receiverId === currentUser?.id) ||
      (message.senderId === currentUser?.id && message.receiverId === user.id)
    ) {
      setMessages(prev => [...prev, message])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)

    try {
      socketService.emit('send_direct_message', {
        receiverId: user.id,
        content: newMessage.trim()
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      addNotification({
        id: `error-${Date.now()}`,
        userId: currentUser!.id,
        type: 'ERROR',
        data: { message: 'Failed to send message' },
        isRead: false,
        createdAt: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      msg => msg.senderId === user.id && !msg.isRead
    )

    if (unreadMessages.length > 0) {
      try {
        await messageAPI.markAsRead({
          messageIds: unreadMessages.map(msg => msg.id)
        })
        
        // Update local state
        setMessages(prev =>
          prev.map(msg =>
            unreadMessages.some(unread => unread.id === msg.id)
              ? { ...msg, isRead: true }
              : msg
          )
        )
      } catch (error) {
        console.error('Failed to mark messages as read:', error)
      }
    }
  }

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMessages) return
    await loadMessages(page + 1)
  }

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              user.isOnline ? "bg-green-100" : "bg-gray-100"
            )}>
              <User className={cn(
                "h-5 w-5",
                user.isOnline ? "text-green-600" : "text-gray-400"
              )} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
              <p className="text-sm text-gray-500">
                {user.isOnline ? 'Online' : `Last seen ${formatDate(user.lastSeen)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-500">
              {user.isOnline ? 'Online' : `Last seen ${formatDate(user.lastSeen)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMessages}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isLoadingMessages ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUser?.id
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
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
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
                {showAvatar && !isOwn && (
                  <div className="flex items-center space-x-2 mb-1">
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
                        className="max-w-full h-auto rounded-lg max-h-64"
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

                {/* Read receipt */}
                {isOwn && index === messages.length - 1 && (
                  <div className={cn(
                    "text-xs text-gray-400 mt-1",
                    isOwn ? "text-right pr-4" : "text-left pl-4"
                  )}>
                    {message.isRead ? 'Read' : 'Delivered'}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* File upload */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          {/* Emoji */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${user.username}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className={cn(
              "p-3 bg-primary-500 text-white rounded-lg transition-all",
              "hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}