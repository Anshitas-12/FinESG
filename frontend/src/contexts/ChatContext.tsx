import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: FileAttachment[];
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  isLoading: boolean;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, files?: FileAttachment[]) => Promise<void>;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// API configuration - use localhost for cookie auth
const API_BASE = 'http://localhost:8080';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const { logout } = useAuth();

  // Helper to handle unauthorized/forbidden responses automatically
  const fetchWithAuth = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      if (response.status === 401 || response.status === 403) {
        console.warn('Session expired or unauthorized. Logging out.');
        await logout();
        throw new Error('Session expired. Please log in again.');
      }
      return response;
    } catch (err) {
      // If it's already our thrown error, rethrow it
      if (err instanceof Error && err.message.includes('Session expired')) {
        throw err;
      }
      // Otherwise, standard network error
      throw err;
    }
  }, [logout]);

  // Load conversations from database on mount
  React.useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoadingChats(true);
      const response = await fetchWithAuth(`${API_BASE}/api/conversations`, {
        credentials: 'include',
      });

      if (response.ok) {
        const conversations = await response.json();
        // Merge conversations list with existing cache to preserve message history
        setChats(prevChats => {
          return conversations.map((conv: any) => {
            const existingChat = prevChats.find(c => c.id === conv.id.toString());
            return {
              id: conv.id.toString(),
              title: conv.title || 'New ESG Analysis',
              messages: existingChat ? existingChat.messages : [], // Preserve loaded messages!
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
            };
          });
        });
      } else {
        console.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/conversations`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to create new conversation');
        return;
      }

      const conv = await response.json();
      const newChat: Chat = {
        id: conv.id.toString(),
        title: conv.title || 'New ESG Analysis',
        messages: [],
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  }, [fetchWithAuth]);

  const selectChat = useCallback(async (chatId: string) => {
    setCurrentChatId(chatId);

    // Load messages for this conversation
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/chat/${chatId}/messages`, {
        credentials: 'include',
      });

      if (response.ok) {
        const messages = await response.json();
        // Update chat with messages
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: messages.map((msg: any) => ({
                id: msg.id.toString(),
                role: msg.role,
                content: msg.content,
                files: msg.fileName ? [{
                  id: msg.id.toString(),
                  name: msg.fileName,
                  size: 0,
                  type: 'application/pdf',
                  file: new File([], msg.fileName)
                }] : undefined,
                timestamp: new Date(msg.createdAt),
              })),
            };
          }
          return chat;
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [fetchWithAuth]);

  const sendMessage = useCallback(async (content: string, files?: FileAttachment[]) => {
    setIsLoading(true);
    let activeConversationId = currentChatId;
    const tempUserMsgId = `temp-user-${Date.now()}`;

    try {
      // If there's no active conversation yet, create one first
      if (!activeConversationId) {
        const convResponse = await fetchWithAuth(`${API_BASE}/api/conversations`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!convResponse.ok) {
          throw new Error('Failed to create conversation');
        }
        const conv = await convResponse.json();
        activeConversationId = conv.id.toString();
        setCurrentChatId(activeConversationId);

        const newChat: Chat = {
          id: activeConversationId,
          title: conv.title || 'New ESG Analysis',
          messages: [],
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        };
        setChats(prev => [newChat, ...prev]);
      }

      // Construct optimistic user message
      const optimisticUserMsg: Message = {
        id: tempUserMsgId,
        role: 'user',
        content: content,
        files: files,
        timestamp: new Date(),
      };

      // Append user message immediately in state
      setChats(prev => prev.map(chat => {
        if (chat.id === activeConversationId) {
          return {
            ...chat,
            messages: [...chat.messages, optimisticUserMsg],
          };
        }
        return chat;
      }));

      // Prepare request based on whether we have files
      let response;
      if (files && files.length > 0) {
        // File upload
        const formData = new FormData();
        formData.append('file', files[0].file);
        formData.append('conversationId', activeConversationId as string);

        response = await fetchWithAuth(`${API_BASE}/api/chat/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
      } else {
        // Text message
        response = await fetchWithAuth(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationId: parseInt(activeConversationId as string),
          }),
          credentials: 'include',
        });
      }

      if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const finalConversationId = data.conversationId.toString();

      // Reload conversations list (keeps cached messages because of updated loadConversations)
      await loadConversations();

      // Load messages for the active conversation from server to sync state
      await selectChat(finalConversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the optimistic user message from state and append the error bubble
      setChats(prev => prev.map(chat => {
        if (chat.id === activeConversationId) {
          const filteredMessages = chat.messages.filter(m => m.id !== tempUserMsgId);
          return {
            ...chat,
            messages: [
              ...filteredMessages,
              {
                id: `msg-${Date.now()}-error`,
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
                timestamp: new Date(),
              },
            ],
          };
        }
        return chat;
      }));
      
      // Rethrow to let MessageInput restore the user input
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, loadConversations, selectChat, fetchWithAuth]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/conversations/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove chat from frontend
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
        }
      } else {
        console.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentChatId, fetchWithAuth]);

  return (
    <ChatContext.Provider value={{
      chats,
      currentChatId,
      currentChat,
      isLoading,
      createNewChat,
      selectChat,
      sendMessage,
      deleteChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};