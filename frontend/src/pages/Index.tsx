import React, { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ThemeToggle from '@/components/ThemeToggle';
import LoginModal from '@/components/LoginModal';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LoginModal />
      </ThemeProvider>
    );
  }

  // Show full app when authenticated
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Sidebar - only visible when authenticated */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 relative">
            {/* Header with Theme Toggle */}
            <header className="absolute top-4 right-4 z-30">
              <ThemeToggle />
            </header>

            {/* Chat Window */}
            <ChatWindow />
          </main>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
