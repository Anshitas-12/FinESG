'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Plus, History, LogOut, Loader } from 'lucide-react'

const API_BASE = 'http://localhost:8080'

export function Sidebar({ onDarkModeChange, isDark, onLogout, onChatSelect, currentChatId, isAuthenticated }) {
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch chat history from backend - only after authentication
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setChatHistory([])
      setIsLoading(false)
      return
    }

    const fetchChatHistory = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE}/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for auth
        })

        if (response.ok) {
          const data = await response.json()
          // Transform API response to sidebar format
          const formattedChats = data.map((chat, index) => ({
            id: chat.id,
            title: chat.input_text.substring(0, 50) + (chat.input_text.length > 50 ? '...' : ''),
            date: new Date(chat.timestamp).toLocaleDateString(),
            fullInput: chat.input_text,
            output: chat.output_text,
          }))
          setChatHistory(formattedChats)
        } else if (response.status !== 401) {
          console.error('Failed to fetch chat history')
        }
      } catch (error) {
        console.error('Error fetching chat history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch on mount
    fetchChatHistory()

    // Set up interval to refresh chat history every 5 seconds
    const interval = setInterval(fetchChatHistory, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    onDarkModeChange(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleNewChat = () => {
    // Start a new chat session without clearing history
    window.dispatchEvent(new CustomEvent('newChat'))
    if (onChatSelect) {
      onChatSelect(null)
    }
  }

  const handleChatClick = (chat) => {
    // Load previous chat into the interface
    if (onChatSelect) {
      onChatSelect(chat)
    }
  }

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary">ESG Analyst</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">AI-Powered Analysis</p>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
          <History className="w-3 h-3 inline mr-2" />
          Chat History
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="w-4 h-4 animate-spin text-sidebar-foreground/50" />
          </div>
        ) : chatHistory.length === 0 ? (
          <p className="text-xs text-sidebar-foreground/40 py-4">No chats yet. Start a new conversation!</p>
        ) : (
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentChatId === chat.id
                    ? 'bg-sidebar-accent/40 text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/20'
                }`}
              >
                <p className="font-medium text-sidebar-foreground truncate">{chat.title}</p>
                <p className="text-xs text-sidebar-foreground/50">{chat.date}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
          onClick={toggleDarkMode}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/10"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
