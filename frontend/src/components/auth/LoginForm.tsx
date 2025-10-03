"use client";

import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
    onToggleMode: () => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({onToggleMode}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth();

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.login(email, password);
            login(response.data.user, response.data.token)
        } catch (error: any) {
            setError(error.response?.data?.error || 'Login failed')
        }finally{
            setIsLoading(false)
        }

    }
return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back to talk-point</h2>
        <p className="text-gray-600 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-primary-500 text-red-500 py-3 px-4 rounded-lg font-medium transition-all",
              "hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}