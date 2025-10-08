export type User = {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  isOnline: boolean
  lastSeen: string
  createdAt: string
}

export type Room = {
  id: string
  name: string
  description?: string
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  creator: User
  members: RoomMember[]
  _count?: {
    members: number
    messages: number
  }
}

export type RoomMember = {
  id: string
  userId: string
  roomId: string
  role: 'MEMBER' | 'ADMIN'
  user: User
}

export type Message = {
  id: string
  content: string
  imageUrl?: string
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM'
  senderId: string
  receiverId?: string
  roomId?: string
  isRead: boolean
  createdAt: string
  sender: User
  receiver?: User
  room?: Room
}

export type Notification = {
  id: string
  userId: string
  type: string
  data: any
  isRead: boolean
  createdAt: string
}

export type Conversation = {
  user: User
  lastMessage: Message
  unreadCount: number
}

// Socket events
export type SocketEvents = {
  // Connection
  connect: () => void
  disconnect: () => void
  
  // Rooms
  join_room: (roomId: string) => void
  leave_room: (roomId: string) => void
  user_joined: (data: { user: User; roomId: string; timestamp: string }) => void
  user_left: (data: { user: User; roomId: string; timestamp: string }) => void
  
  // Messages
  send_room_message: (data: { roomId: string; content: string }) => void
  send_direct_message: (data: { receiverId: string; content: string }) => void
  room_message: (message: Message) => void
  direct_message: (message: Message) => void
  
  // Typing indicators
  typing_start: (data: { roomId?: string; receiverId?: string }) => void
  typing_stop: (data: { roomId?: string; receiverId?: string }) => void
  user_typing: (data: { user: User; roomId?: string; isDirect?: boolean }) => void
  user_stop_typing: (data: { user: User; roomId?: string; isDirect?: boolean }) => void
  
  // Reactions
  add_reaction: (data: { messageId: string; emoji: string }) => void
  remove_reaction: (data: { messageId: string; emoji: string }) => void
  reaction_added: (data: any) => void
  reaction_removed: (data: any) => void
  
  // Notifications
  notification: (data: Notification) => void;
  mark_notification_read: (notificationId: string) => void
  notification_marked_read: (data: { notificationId: string }) => void
  
  // Errors
  error: (data: { message: string }) => void
}