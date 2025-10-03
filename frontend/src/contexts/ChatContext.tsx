"use client";

import { Message, Notification, Room, User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { socketService } from "@/lib/socket";

interface ChatContextType {
    rooms: Room[]
    currentRoom: Room | null;
    setCurrentRoom: (room: Room | null) => void
    joinedRooms: Room[]

    // Messages
    messages: Message[];
    addMessage: (message: Message) => void;
    clearMessages:  ()=> void;

    // Users
    onlineUsers: Set<string>;

    // Notifications
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;

    // UI State
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeView: 'rooms' | 'direct' | 'users';
    setActiveView: (view: 'rooms' | 'direct' | 'users') => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode}> =({children}) => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [joinedRooms, setJoinedRooms] = useState<Room[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const [activeView, setActiveView] = useState<'rooms' | 'direct' | 'users'>('rooms');

    useEffect(() => {
        if(!user) return;

        // Socekt event listeners
        const handleRoomMessage = (message: Message) => {
            if(message.roomId === currentRoom?.id){
                addMessage(message)
            }
        };

        const handleDirectMessage = (message: Message) =>{
            if(message.receiverId === user.id || message.senderId === user.id){
                addMessage(message)
            }
        }

        const handleUserJoined = (data: {user: User; roomId: string;}) => {
            setOnlineUsers(prev => new Set(prev).add(data.user.id))
        }

        const handleUserLeft = (data: {user: User; roomId: string}) =>{
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.user.id);
                return newSet;
            })
        }

        socketService.on('room_message', handleRoomMessage);
        socketService.on('direct_message', handleDirectMessage);
        socketService.on('user_joined', handleUserJoined);
        socketService.on('user_left', handleUserLeft);

        return () => {
            socketService.off('room_message', handleRoomMessage)
            socketService.off('direct_message', handleDirectMessage)
            socketService.off('user_joined', handleUserJoined)
            socketService.off('user_left', handleUserLeft)
        }
    }, [user, currentRoom])

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message])
    };

    const clearMessages = () => {
        setMessages([])
    }

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [...prev, notification])
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(notif => notif.id === id?{...notif, isRead: true} : notif))
    }

    const unreadCount = notifications.filter(notif => !notif.isRead).length

    return (
        <ChatContext.Provider value={{
            rooms,
            currentRoom,
            setCurrentRoom,
            joinedRooms,
            messages,
            addMessage,
            clearMessages,
            onlineUsers,
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            isSidebarOpen,
            setSidebarOpen,
            activeView,
            setActiveView

        }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if(context === undefined){
        throw new Error("UseChat must be used within a ChatProvider")
    };
    return context;
}



