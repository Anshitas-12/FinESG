// Chat management module - Connected to Backend API
const CHAT_API_BASE = 'http://localhost:8080';

class ChatManager {
  constructor() {
    this.messages = [];
    this.chatHistory = [
      { id: '1', title: 'ESG Analysis - Q4 2024', date: 'Today' },
      { id: '2', title: 'Financial Metrics Review', date: 'Yesterday' },
      { id: '3', title: 'Sustainability Report', date: '2 days ago' },
    ];
  }

  addMessage(type, content) {
    const message = {
      id: Date.now().toString(),
      type: type, // 'user' or 'assistant'
      content: content,
    };
    this.messages.push(message);
    return message;
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }

  getChatHistory() {
    return this.chatHistory;
  }

  async getLLMResponse(userMessage) {
    try {
      const response = await fetch(`${CHAT_API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies for auth
        body: JSON.stringify({ text: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        // Return the model's output, properly formatted
        return data.output_text || 'No response from model.';
      } else if (response.status === 401) {
        // Session expired, redirect to login
        authManager.isAuthenticated = false;
        localStorage.setItem('authenticated', 'false');
        window.location.reload();
        return 'Session expired. Please login again.';
      } else {
        const error = await response.json();
        return `Error: ${error.detail || 'Failed to get response'}`;
      }
    } catch (error) {
      console.error('API error:', error);
      return 'Connection error. Please check if the server is running.';
    }
  }

  async loadHistory() {
    try {
      const response = await fetch(`${CHAT_API_BASE}/history`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const history = await response.json();
        // Convert backend history to frontend format
        this.chatHistory = history.map((item, index) => ({
          id: item.id.toString(),
          title: item.input_text.substring(0, 30) + (item.input_text.length > 30 ? '...' : ''),
          date: new Date(item.timestamp).toLocaleDateString(),
        }));
        return this.chatHistory;
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
    return this.chatHistory;
  }
}

const chatManager = new ChatManager();
