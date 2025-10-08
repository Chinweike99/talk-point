import { Conversation, Message, Notification, Room, User } from "@/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { socketService } from "@/lib/socket";
import { messageAPI, notificationsAPI } from "@/lib/api";



interface EnhancedChatContextType {
    rooms: Room[]
    currentRoom: Room | null
    setCurrentRoom: (room: Room | null) => void
    joinedRooms: Room[]
    refetchRooms: () => Promise<void>

    //Messages
    messages: Message[]
    addMessage: (message:Message) => void;
    clearMessages: () => void;
    loadMoreMessages: ()=> Promise<void>;
    hasMoreMessages: boolean;

    // Users
    onlineUsers: Set<string>
    typingUsers: Set<string>

    // Notifications
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => Promise<void>
    loadNotifications: () => Promise<void>;

      // Conversations
    conversations: Conversation[]
    currentConversation: User | null
    setCurrentConversation: (user: User | null) => void
    
    // UI State
    isSidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    activeView: 'rooms' | 'direct' | 'users' | 'admin'
    setActiveView: (view: 'rooms' | 'direct' | 'users' | 'admin') => void
    
    // Admin
    isAdminPanelOpen: boolean
    setAdminPanelOpen: (open: boolean) => void
}


const EnhancedChatContext = createContext<EnhancedChatContextType | undefined>(undefined);

export const EnhancedChatProvider: React.FC<{ children: React.ReactNode}> = ({children})=> {
  const { user, isAdmin } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'rooms' | 'direct' | 'users' | 'admin'>('rooms')
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false)
  const [messagePage, setMessagePage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

    useEffect(() => {
        if(user){
            loadNotifications();
            loadConversations();
        }
    }, [user]);

    // Socket event listeners
    useEffect(() => {
        if(!user) return;

        const handleRoomMessage = (message: Message) => {
            if(message.roomId === currentRoom?.id){
                addMessage(message);
            }
            // Show notifications if not in current room
            else if(message.roomId){
                addNotification({
                    id: `msg-${message.id}`,
                    userId: user.id,
                    type: 'ROOM_TYPE',
                    data: {
                        roomId: message.roomId,
                        roomName: message.room?.name,
                        senderName: message.sender.username,
                        message: message.content
                    },
                    isRead: false,
                    createdAt: new Date().toISOString()
                })
            }
        }

        const handleDirectMessage = (message: Message) => {
            if(message.receiverId === user.id || message.senderId === user.id){
                addMessage(message);
                loadConversations();
            }
        }

        const handleUserJoined = (data: {user: User; roomId: string}) => {
            setOnlineUsers(prev => new Set(prev).add(data.user.id))
        }

        const handleUserLeft = (data: {user: User; roomId: string}) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.user.id);
                return newSet;
            })
        };

        const handleUserTyping = (data: {user: User; roomId?: string; isDirect?: boolean}) => {
            if(data.roomId === currentRoom?.id){
                setTypingUsers(prev => new Set(prev).add(data.user.id));
            }
        }

        const handleUserStopTyping = (data: {user: User; roomId?:string; isDirect?: boolean})=>{
            if(data.roomId === currentRoom?.id){
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.user.id);
                    return newSet
                })
            }
        }

        const handleNotification = (data: any) => {
            addNotification(data)
        };

        // Register event Listeners
        socketService.on('room_message', handleRoomMessage);
        socketService.on('direct_message', handleDirectMessage);
        socketService.on('user_joined', handleUserJoined);
        socketService.on('user_left', handleUserLeft)
        socketService.on('user_typing', handleUserTyping)
        socketService.on('user_stop_typing', handleUserStopTyping)
        socketService.on('notification', handleNotification)

        return () => {
            // Cleanup event listeners
            socketService.off('room_message', handleRoomMessage)
            socketService.off('direct_message', handleDirectMessage)
            socketService.off('user_joined', handleUserJoined)
            socketService.off('user_left', handleUserLeft)
            socketService.off('user_typing', handleUserTyping)
            socketService.off('user_stop_typing', handleUserStopTyping)
            socketService.off('notification', handleNotification)
            }
        }, [user, currentRoom])

        const addMessage = useCallback((message: Message) => {
            setMessages(prev => [...prev, message])
        }, []);

        const clearMessages = useCallback(() => {
            setMessages([]);
            setMessagePage(1);
            setHasMoreMessages(true)
        }, [])

        const loadMoreMessages = async() => {
            if(!currentRoom || !hasMoreMessages) return

            try {
                const nextPage = messagePage + 1;
                const response = await messageAPI.getDirectMessages(currentRoom.id, nextPage, 50);

                const newMessages = response.data.messages;

                if(newMessages.length > 0){
                    setMessages(prev => [...newMessages, ...prev]);
                    setMessagePage(nextPage)
                }else {
                    setHasMoreMessages(false)
                }

            } catch (error) {
                console.error('Failed to load more messages', error)
            }
        };

          const refetchRooms = async () => {
            try {
            // This would reload rooms from API
            console.log('Refetching rooms...')
            } catch (error) {
            console.error('Failed to refetch rooms:', error)
            }
        }

        const addNotification = useCallback((notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
        }, []);

        const markAsRead = useCallback((id: string) => {
            setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, isRead: true } : notif
            )
            )
            // Also mark as read on server
            notificationsAPI.markAsRead(id).catch(console.error)
        }, []);

        const markAllAsRead = async () => {
            try {
            await notificationsAPI.markAllAsRead()
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
            } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
            }
        }
const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications()
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversation()
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const unreadCount = notifications.filter(notif => !notif.isRead).length

  return (
    <EnhancedChatContext.Provider value={{
      rooms,
      currentRoom,
      setCurrentRoom,
      joinedRooms: rooms.filter(room => room.members.some(member => member.userId === user?.id)),
      refetchRooms,
      messages,
      addMessage,
      clearMessages,
      loadMoreMessages,
      hasMoreMessages,
      onlineUsers,
      typingUsers,
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      loadNotifications,
      conversations,
      currentConversation,
      setCurrentConversation,
      isSidebarOpen,
      setSidebarOpen,
      activeView,
      setActiveView,
      isAdminPanelOpen: isAdmin && isAdminPanelOpen,
      setAdminPanelOpen: isAdmin ? setAdminPanelOpen : () => {}
    }}>
      {children}
    </EnhancedChatContext.Provider>
  )
}

export const useEnhancedChat = () => {
  const context = useContext(EnhancedChatContext)
  if (context === undefined) {
    throw new Error('useEnhancedChat must be used within an EnhancedChatProvider')
  }
  return context
}


