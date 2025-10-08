'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Bell, LogOut, User, Shield, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { useEnhancedChat } from '@/contexts/EnhancedChatContext'

export const EnhancedHeader: React.FC = () => {
  const { user, logout, isAdmin } = useAuth()
  const { 
    isSidebarOpen, 
    setSidebarOpen, 
    unreadCount, 
    setAdminPanelOpen,
    setActiveView 
  } = useEnhancedChat()

  const handleAdminClick = () => {
    setAdminPanelOpen(true)
    setActiveView('admin')
  }

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900">talk-point</h1>
        
        {isAdmin && (
          <button
            onClick={handleAdminClick}
            className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full hover:bg-purple-200 transition-colors flex items-center space-x-1"
          >
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          {/* Notification dropdown would go here */}
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="h-5 w-5" />
        </button>

        {/* User profile */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.username}</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </motion.header>
  )
}