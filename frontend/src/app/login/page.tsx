'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/chat')
    }
  }, [user, isLoading, router])

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="text-center mb-8 absolute top-8 left-1/2 transform -translate-x-1/2">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">talk-point</h1>
        <p className="text-gray-600">Real-time messaging with Socket.io and RabbitMQ</p>
      </div>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <LoginForm key="login" onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm key="register" onToggleMode={() => setIsLogin(true)} />
        )}
      </AnimatePresence>
    </div>
  )
}