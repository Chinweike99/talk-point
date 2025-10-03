'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Image as ImageIcon, Smile, MessageCircle } from 'lucide-react'
import { socketService } from '@/lib/socket'
import { useChat } from '@/contexts/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { messageAPI } from '@/lib/api'

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentRoom, setActiveView } = useChat()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    setIsLoading(true)

    try {
      if (currentRoom) {
        // Room message
        socketService.emit('send_room_message', {
          roomId: currentRoom.id,
          content: message.trim()
        })
      } else {
        // This would be for direct messages - you'd need to track the current conversation
        // For now, we'll focus on room messages
        console.log('Direct messages not implemented yet')
      }
      
      setMessage('')
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
    formData.append('content', '')
    formData.append('roomId', currentRoom.id)

    try {
      await messageAPI.sendMessage(formData)
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  if (!currentRoom && setActiveView) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
        <p className="text-gray-500">Choose a room or start a conversation</p>
        <button
          onClick={() => setActiveView('rooms')}
          className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Browse Rooms
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-gray-200 p-4 bg-white"
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${currentRoom?.name || '...'}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "p-3 bg-primary-500 text-white rounded-lg transition-all",
            "hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  )
}