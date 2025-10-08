'use client'

import { usersAPI } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()

useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('chat-token')
        const userData = localStorage.getItem('chat-user')
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          socketService.connect(token)
          
          // Verify token is still valid
          try {
            await usersAPI.getMyProfile()
          } catch (error) {
            console.error('Token validation failed:', error)
            localStorage.removeItem('chat-token')
            localStorage.removeItem('chat-user')
            setUser(null)
             router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('chat-token')
        localStorage.removeItem('chat-user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router])


  const login = (userData: User, token: string) => {
    localStorage.setItem("chat-token", token);
    localStorage.setItem("chat-user", JSON.stringify(userData));
    Cookies.set('chat-token', token, { expires: 7 })
    setUser(userData);
    setIsLoading(false); 
    socketService.connect(token);
     
    router.push('/chat')
    setTimeout(() => {
      router.push('/chat')
    }, 100)
  };

  const logout = () => {
    localStorage.removeItem("chat-token");
    localStorage.removeItem("chat-user");
    setUser(null);
    socketService.disconnect();
    router.push('/login')
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
