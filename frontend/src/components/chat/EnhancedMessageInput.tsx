// src/components/chat/EnhancedMessageInput.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react'
import { messageAPI } from '@/lib/api'
import { socketService } from '@/lib/socket'
import { useChat } from '@/contexts/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export const EnhancedMessageInput: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { currentRoom, setActiveView } = useChat()
  const { user } = useAuth()

  useEffect(() => {
    const handleUserTyping = (data: { user: any; roomId?: string; isDirect?: boolean }) => {
      if (data.roomId === currentRoom?.id) {
        setTypingUsers(prev => new Set(prev).add(data.user.id))
      }
    }

    const handleUserStopTyping = (data: { user: any; roomId?: string; isDirect?: boolean }) => {
      if (data.roomId === currentRoom?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.user.id)
          return newSet
        })
      }
    }

    socketService.on('user_typing', handleUserTyping)
    socketService.on('user_stop_typing', handleUserStopTyping)

    return () => {
      socketService.off('user_typing', handleUserTyping)
      socketService.off('user_stop_typing', handleUserStopTyping)
    }
  }, [currentRoom])

  const handleTyping = () => {
    if (!isTyping && currentRoom) {
      setIsTyping(true)
      socketService.emit('typing_start', { roomId: currentRoom.id })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (currentRoom) {
        socketService.emit('typing_stop', { roomId: currentRoom.id })
      }
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !currentRoom) return

    setIsLoading(true)

    try {
      socketService.emit('send_room_message', {
        roomId: currentRoom.id,
        content: message.trim()
      })
      
      setMessage('')
      setIsTyping(false)
      if (currentRoom) {
        socketService.emit('typing_stop', { roomId: currentRoom.id })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentRoom) return

    const formData = new FormData()
    formData.append('image', file)
    formData.append('content', 'Shared an image')
    formData.append('roomId', currentRoom.id)

    try {
      await messageAPI.sendMessage(formData)
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  if (!currentRoom) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Paperclip className="h-8 w-8 text-primary-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
        <p className="text-gray-500 mb-4">Choose a room or start a conversation to begin messaging</p>
        <button
          onClick={() => setActiveView?.('rooms')}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Browse Rooms
        </button>
      </div>
    )
  }

  const typingUsersArray = Array.from(typingUsers)
  const typingMessage = typingUsersArray.length > 0 
    ? `${typingUsersArray.length} user${typingUsersArray.length > 1 ? 's' : ''} typing...`
    : ''

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-gray-200 bg-white"
    >
      {/* Typing Indicator */}
      <AnimatePresence>
        {typingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-2"
          >
            <div className="text-sm text-gray-500 italic">
              {typingMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-3">
          {/* Action Buttons */}
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Upload image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleChange}
              placeholder={`Message #${currentRoom.name}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={cn(
              "p-3 bg-primary-500 text-white rounded-lg transition-all flex-shrink-0",
              "hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transform hover:scale-105 active:scale-95"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Character Count */}
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </div>
          {message.length > 0 && (
            <div className={cn(
              "text-xs",
              message.length > 1000 ? "text-red-500" : "text-gray-400"
            )}>
              {message.length}/1000
            </div>
          )}
        </div>
      </form>
    </motion.div>
  )
}