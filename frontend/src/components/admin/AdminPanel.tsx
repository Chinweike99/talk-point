// 'use client'

// import React, { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { Users, MessageCircle, BarChart3, Shield, Trash2 } from 'lucide-react'
// import { User, Message, Room } from '@/types'
// import { usersAPI, adminAPI } from '@/lib/api'
// import { useAuth } from '@/contexts/AuthContext'
// import { cn } from '@/lib/utils'

// export const AdminPanel: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages'>('overview')
//   const [stats, setStats] = useState<any>(null)
//   const [users, setUsers] = useState<User[]>([])
//   const [recentMessages, setRecentMessages] = useState<Message[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     loadAdminData()
//   }, [])

//   const loadAdminData = async () => {
//     try {
//       const [statsResponse, usersResponse] = await Promise.all([
//         adminAPI.getStatistics(),
//         usersAPI.getUsers()
//       ])
      
//       setStats(statsResponse.data)
//       setUsers(usersResponse.data)
//     } catch (error) {
//       console.error('Failed to load admin data:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleBanUser = async (userId: string) => {
//     if (!confirm('Are you sure you want to ban this user?')) return
    
//     try {
//       await adminAPI.banUser(userId)
//       setUsers(prev => prev.filter(user => user.id !== userId))
//     } catch (error) {
//       console.error('Failed to ban user:', error)
//     }
//   }

//   const handleDeleteMessage = async (messageId: string) => {
//     if (!confirm('Are you sure you want to delete this message?')) return
    
//     try {
//       await adminAPI.deleteMessage(messageId)
//       setRecentMessages(prev => prev.filter(msg => msg.id !== messageId))
//     } catch (error) {
//       console.error('Failed to delete message:', error)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="p-6">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//           <div className="grid grid-cols-4 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-24 bg-gray-200 rounded"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={cn(
//               "px-4 py-2 rounded-lg font-medium transition-colors",
//               activeTab === 'overview'
//                 ? "bg-primary-500 text-white"
//                 : "text-gray-600 hover:bg-gray-100"
//             )}
//           >
//             Overview
//           </button>
//           <button
//             onClick={() => setActiveTab('users')}
//             className={cn(
//               "px-4 py-2 rounded-lg font-medium transition-colors",
//               activeTab === 'users'
//                 ? "bg-primary-500 text-white"
//                 : "text-gray-600 hover:bg-gray-100"
//             )}
//           >
//             Users
//           </button>
//           <button
//             onClick={() => setActiveTab('messages')}
//             className={cn(
//               "px-4 py-2 rounded-lg font-medium transition-colors",
//               activeTab === 'messages'
//                 ? "bg-primary-500 text-white"
//                 : "text-gray-600 hover:bg-gray-100"
//             )}
//           >
//             Messages
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       {activeTab === 'overview' && stats && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-6"
//         >
//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <Users className="h-8 w-8 text-primary-500" />
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
//                   <div className="text-sm text-gray-500">Total Users</div>
//                 </div>
//               </div>
//               <div className="mt-2 text-sm text-green-600">
//                 {stats.onlineUsers} online
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <MessageCircle className="h-8 w-8 text-green-500" />
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
//                   <div className="text-sm text-gray-500">Total Messages</div>
//                 </div>
//               </div>
//               <div className="mt-2 text-sm text-blue-600">
//                 {stats.recentMessages24h} last 24h
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <BarChart3 className="h-8 w-8 text-blue-500" />
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
//                   <div className="text-sm text-gray-500">Total Rooms</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <div className="flex items-center space-x-3">
//                 <Shield className="h-8 w-8 text-purple-500" />
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{stats.activeRooms.length}</div>
//                   <div className="text-sm text-gray-500">Active Rooms</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Active Rooms */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Active Rooms</h3>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {stats.activeRooms.map((room: any) => (
//                   <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div>
//                       <div className="font-medium text-gray-900">{room.name}</div>
//                       <div className="text-sm text-gray-500">
//                         {room.memberCount} members • {room.recentMessageCount} recent messages
//                       </div>
//                     </div>
//                     <div className="text-sm text-green-600 font-medium">
//                       Active
//                     </div>
//                   </div>
//                 ))}
//                 {stats.activeRooms.length === 0 && (
//                   <div className="text-center py-8 text-gray-500">
//                     No active rooms in the last hour
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {activeTab === 'users' && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-xl shadow-sm border border-gray-200"
//         >
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
//           </div>
//           <div className="p-6">
//             <div className="space-y-4">
//               {users.map((user) => (
//                 <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center space-x-4">
//                     <div className={cn(
//                       "w-10 h-10 rounded-full flex items-center justify-center",
//                       user.isOnline ? "bg-green-100" : "bg-gray-100"
//                     )}>
//                       <Users className={cn(
//                         "h-5 w-5",
//                         user.isOnline ? "text-green-600" : "text-gray-400"
//                       )} />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">{user.username}</div>
//                       <div className="text-sm text-gray-500">{user.email}</div>
//                       <div className="text-xs text-gray-400">
//                         {user.role} • {user.isOnline ? 'Online' : 'Offline'}
//                       </div>
//                     </div>
//                   </div>
//                   {user.role !== 'ADMIN' && (
//                     <button
//                       onClick={() => handleBanUser(user.id)}
//                       className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
//                     >
//                       <Trash2 className="h-3 w-3" />
//                       <span>Ban</span>
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   )
// }




// src/components/admin/AdminPanel.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, BarChart3, Shield, Trash2, Ban } from 'lucide-react'
import { User, Message } from '@/types'
import { usersAPI, adminAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages'>('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        adminAPI.getStatistics(),
        usersAPI.getUsers()
      ])
      
      setStats(statsResponse.data)
      setUsers(usersResponse.data)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return
    
    try {
      await adminAPI.banUser(userId)
      setUsers(prev => prev.filter(user => user.id !== userId))
      // Show success message
      alert('User banned successfully')
    } catch (error: any) {
      console.error('Failed to ban user:', error)
      alert(error.response?.data?.error || 'Failed to ban user')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      await adminAPI.deleteMessage(messageId)
      setRecentMessages(prev => prev.filter(msg => msg.id !== messageId))
      // Show success message
      alert('Message deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete message:', error)
      alert(error.response?.data?.error || 'Failed to delete message')
    }
  }

  const handlePurgeUserMessages = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to purge all messages from ${username}? This action cannot be undone.`)) return
    
    try {
      await adminAPI.purgeUserMessages(userId)
      // Show success message
      alert(`All messages from ${username} have been purged`)
    } catch (error: any) {
      console.error('Failed to purge user messages:', error)
      alert(error.response?.data?.error || 'Failed to purge user messages')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === 'overview'
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === 'users'
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === 'messages'
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Messages
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-green-600">
                {stats.onlineUsers} online
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
                  <div className="text-sm text-gray-500">Total Messages</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-blue-600">
                {stats.recentMessages24h} last 24h
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
                  <div className="text-sm text-gray-500">Total Rooms</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeRooms?.length || 0}</div>
                  <div className="text-sm text-gray-500">Active Rooms</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Rooms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Rooms</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.activeRooms?.map((room: any) => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{room.name}</div>
                      <div className="text-sm text-gray-500">
                        {room.memberCount} members • {room.recentMessageCount} recent messages
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Active
                    </div>
                  </div>
                ))}
                {(!stats.activeRooms || stats.activeRooms.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No active rooms in the last hour
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage users and their permissions
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      user.isOnline ? "bg-green-100" : "bg-gray-100"
                    )}>
                      <Users className={cn(
                        "h-6 w-6",
                        user.isOnline ? "text-green-600" : "text-gray-400"
                      )} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          user.isOnline ? "bg-green-500" : "bg-gray-400"
                        )}></span>
                        <span>{user.role} • {user.isOnline ? 'Online' : `Last seen ${new Date(user.lastSeen).toLocaleDateString()}`}</span>
                      </div>
                    </div>
                  </div>
                  {user.role !== 'ADMIN' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
                        title="Ban User"
                      >
                        <Ban className="h-3 w-3" />
                        <span>Ban</span>
                      </button>
                      <button
                        onClick={() => handlePurgeUserMessages(user.id, user.username)}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors flex items-center space-x-1"
                        title="Purge All Messages"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Purge Messages</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'messages' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Message Management</h3>
            <p className="text-sm text-gray-500 mt-1">
              Moderate and manage messages across the platform
            </p>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>Message management features coming soon</p>
              <p className="text-sm mt-1">You can delete individual messages from the chat interface</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}