'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader } from 'lucide-react'
import { SuggestionCards } from './suggestion-cards'

const API_BASE = 'http://localhost:8080'

export function ChatInterface({ selectedChat, onChatLoad }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load selected chat history
  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      // Load the selected chat into the interface
      const chatMessages = [
        {
          id: `${selectedChat.id}-input`,
          type: 'user',
          content: selectedChat.fullInput,
        },
        {
          id: `${selectedChat.id}-output`,
          type: 'assistant',
          content: selectedChat.output,
        },
      ]
      setMessages(chatMessages)
      setInput('')
    }
  }, [selectedChat])

  // Listen for new chat event from sidebar
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([])
      setInput('')
    }
    window.addEventListener('newChat', handleNewChat)
    return () => window.removeEventListener('newChat', handleNewChat)
  }, [])

  const handleSendMessage = async (message) => {
    if (!message.trim()) return
    if (isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the backend /predict endpoint
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
        credentials: 'include', // Include cookies for auth
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.output_text || 'No response from model.',
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Trigger sidebar refresh to show new chat
        window.dispatchEvent(new CustomEvent('chatUpdated'))
      } else {
        let errorMsg = 'Failed to get response from server'
        try {
          const errorData = await response.json()
          errorMsg = errorData.detail || errorMsg
        } catch (e) {}
        
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Error: ${errorMsg}`,
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('API error:', error)
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Connection error. Please check if the backend server is running on port 8080.',
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome to ESG Analyst</h2>
              <p className="text-muted-foreground">
                Get comprehensive ESG and financial analysis with AI-powered insights
              </p>
            </div>
            <SuggestionCards onSuggestionClick={handleSuggestionClick} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-card-foreground border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground border border-border rounded-lg p-4 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">Analyzing... (this may take a while)</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-6">
        <div className="flex gap-3">
          <Input
            placeholder="Ask about ESG metrics, financial analysis, sustainability reports..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(input)
              }
            }}
            className="flex-1 bg-input text-foreground border-border placeholder-muted-foreground"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
