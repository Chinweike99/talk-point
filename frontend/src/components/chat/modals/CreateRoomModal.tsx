'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Lock, Globe } from 'lucide-react'
import { roomsAPI } from '@/lib/api'
import { useChat } from '@/contexts/ChatContext'
import { cn } from '@/lib/utils'

interface CreateRoomModalProps {
  onClose: () => void
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await roomsAPI.createRoom(formData)
      onClose()
      // Room will be refreshed in RoomList component
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Room</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Room Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe what this room is about..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all",
              formData.isPublic 
                ? "border-primary-500 bg-primary-50" 
                : "border-gray-200 hover:border-gray-300"
            )} onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="font-medium text-gray-900">Public Room</div>
                  <div className="text-sm text-gray-500">Anyone can join</div>
                </div>
              </div>
            </div>

            <div className={cn(
              "flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all",
              !formData.isPublic 
                ? "border-primary-500 bg-primary-50" 
                : "border-gray-200 hover:border-gray-300"
            )} onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}>
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-primary-500" />
                <div>
                  <div className="font-medium text-gray-900">Private Room</div>
                  <div className="text-sm text-gray-500">Invite only</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className={cn(
                "flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg transition-all",
                "hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}