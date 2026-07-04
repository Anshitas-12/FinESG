'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ChatInterface } from '@/components/chat-interface'
import { LoginModal } from '@/components/login-modal'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [currentChatId, setCurrentChatId] = useState(null)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = localStorage.getItem('theme') === 'dark'
    setIsDark(isDarkMode)
    
    // Check if user was previously authenticated
    const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (wasAuthenticated) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
  }

  const handleLogout = async () => {
    // Call backend to clear the auth cookie
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout error:', e)
    }
    
    setIsAuthenticated(false)
    setSelectedChat(null)
    setCurrentChatId(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    if (chat) {
      setCurrentChatId(chat.id)
    } else {
      setCurrentChatId(null)
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) return null

  if (!isAuthenticated) {
    return <LoginModal onAuthenticate={handleAuthenticate} isDark={isDark} onThemeToggle={toggleTheme} />
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        onDarkModeChange={toggleTheme} 
        isDark={isDark} 
        onLogout={handleLogout}
        onChatSelect={handleChatSelect}
        currentChatId={currentChatId}
        isAuthenticated={isAuthenticated}
      />
      <ChatInterface selectedChat={selectedChat} onChatLoad={handleChatSelect} />
    </div>
  )
}
