// UI rendering module
class UIRenderer {
  static renderLoginModal() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-blue-500/10 via-white to-teal-500/10 dark:from-blue-900/20 dark:via-slate-900 dark:to-teal-900/20 flex items-center justify-center p-4 relative">
        <button onclick="window.toggleTheme()" class="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-colors" aria-label="Toggle theme" data-theme-btn>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
          Dark Mode
        </button>

        <div class="w-full max-w-md p-8 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">ESG Analyst</h1>
            <p class="text-slate-600 dark:text-slate-400">AI-Powered Financial & ESG Analysis</p>
          </div>

          <form id="authForm" class="space-y-4">
            <div id="errorContainer"></div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email Address</label>
              <input type="email" id="email" placeholder="you@example.com" class="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Password</label>
              <input type="password" id="password" placeholder="••••••••" class="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div id="confirmPasswordContainer" style="display: none;">
              <label class="block text-sm font-medium text-slate-900 dark:text-white mb-2">Confirm Password</label>
              <input type="password" id="confirmPassword" placeholder="••••••••" class="w-full px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <button type="submit" id="submitBtn" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">Sign In</button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              <span id="authToggleText">Don't have an account?</span>
              <button onclick="window.toggleAuthMode()" class="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium">
                <span id="authToggleBtn">Sign Up</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  static renderDashboard() {
    return `
      <div class="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        ${UIRenderer.renderSidebar()}
        ${UIRenderer.renderChatInterface()}
      </div>
    `;
  }

  static renderSidebar() {
    const isDark = window.isDarkMode();
    return `
      <div class="w-64 bg-slate-800 dark:bg-slate-950 text-white border-r border-slate-700 dark:border-slate-800 flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-slate-700 dark:border-slate-800">
          <h1 class="text-xl font-bold text-amber-500">ESG Analyst</h1>
          <p class="text-xs text-slate-400 mt-1">AI-Powered Analysis</p>
        </div>

        <!-- New Chat Button -->
        <div class="p-4">
          <button onclick="window.newChat()" class="w-full px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Chat
          </button>
        </div>

        <!-- Chat History -->
        <div class="flex-1 overflow-y-auto px-4 py-2">
          <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Previous Chats
          </h3>
          <div class="space-y-2" id="chatHistoryContainer"></div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-700 dark:border-slate-800 p-4 space-y-3">
          <button onclick="window.toggleTheme()" data-theme-btn class="w-full px-3 py-2 text-left text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <span id="themeLabel">Dark Mode</span>
          </button>

          <button onclick="window.logout()" class="w-full px-3 py-2 text-left text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    `;
  }

  static renderChatInterface() {
    return `
      <div class="flex-1 flex flex-col bg-white dark:bg-slate-900">
        <!-- Messages Container -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4" id="messagesContainer">
          <div class="h-full flex flex-col items-center justify-center space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Welcome to ESG Analyst</h2>
              <p class="text-slate-600 dark:text-slate-400">Get comprehensive ESG and financial analysis with AI-powered insights</p>
            </div>
            <div id="suggestionsContainer"></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <div class="flex gap-3">
            <input type="text" id="messageInput" placeholder="Ask about ESG metrics, financial analysis, sustainability reports..." class="flex-1 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="window.sendMessage()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static renderSuggestions() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <div onclick="window.sendMessage('Generate a comprehensive ESG report analyzing environmental, social, and governance factors for sustainable business practices.')" class="p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg">
          <svg class="w-6 h-6 text-amber-500 group-hover:text-blue-600 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 3-3 3 3m-3 6l-3-3-3 3-3-3-3 3"></path>
          </svg>
          <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Get ESG Report</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate a comprehensive ESG assessment</p>
        </div>

        <div onclick="window.sendMessage('Provide a detailed financial analysis including key metrics, profitability trends, liquidity analysis, and financial health indicators.')" class="p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg">
          <svg class="w-6 h-6 text-amber-500 group-hover:text-blue-600 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Financial Analysis</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Analyze financial metrics and performance</p>
        </div>

        <div onclick="window.sendMessage('Analyze sustainability opportunities, carbon footprint reduction strategies, and ESG compliance initiatives.')" class="p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg">
          <svg class="w-6 h-6 text-amber-500 group-hover:text-blue-600 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Sustainability Insights</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore sustainability opportunities</p>
        </div>
      </div>
    `;
  }

  static renderMessage(message) {
    const isUser = message.type === 'user';
    return `
      <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xl rounded-lg p-4 ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'}">
          <p class="text-sm whitespace-pre-wrap">${escapeHtml(message.content)}</p>
        </div>
      </div>
    `;
  }

  static renderLoading() {
    return `
      <div class="flex justify-start">
        <div class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-4 flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm">Analyzing...</span>
        </div>
      </div>
    `;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
