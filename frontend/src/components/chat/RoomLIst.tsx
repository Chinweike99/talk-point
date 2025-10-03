  // src/components/chat/RoomList.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Lock, Plus, MessageCircle } from 'lucide-react'
import { Room } from '@/types'
import { roomsAPI } from '@/lib/api'
import { useChat } from '@/contexts/ChatContext'
import { socketService } from '@/lib/socket'
import { cn, formatDate } from '@/lib/utils'
import { CreateRoomModal } from './modals/CreateRoomModal'
// import { CreateRoomModal } from './modals/CreateRoomModal'

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { currentRoom, setCurrentRoom, setActiveView } = useChat()

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const response = await roomsAPI.getRooms()
      setRooms(response.data)
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async (room: Room) => {
    try {
      if (!room.members.some(member => member.userId === currentRoom?.id)) {
        await roomsAPI.joinRoom(room.id)
      }
      setCurrentRoom(room)
      socketService.emit('join_room', room.id)
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleCreateRoom = () => {
    setShowCreateModal(true)
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
      {/* Create Room Button */}
      <motion.button
        onClick={handleCreateRoom}
        className="w-full mb-4 bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="h-4 w-4" />
        <span>Create Room</span>
      </motion.button>

      {/* Rooms List */}
      <div className="space-y-2">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleJoinRoom(room)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all hover:bg-gray-50 border-2",
                currentRoom?.id === room.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-transparent bg-white"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {room.name}
                    </h3>
                    {!room.isPublic && (
                      <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate mb-2">
                    {room.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{room._count?.members || room.members.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{room._count?.messages || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        ))}

        {rooms.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No rooms available</p>
            <button
              onClick={handleCreateRoom}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create the first room
            </button>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}