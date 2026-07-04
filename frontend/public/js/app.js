// Main application logic
let isSignUpMode = false;
let isMessageLoading = false;

window.addEventListener('DOMContentLoaded', function() {
  renderApp();
  setupEventListeners();
});

function renderApp() {
  const app = document.getElementById('app');
  
  if (authManager.isLoggedIn()) {
    app.innerHTML = UIRenderer.renderDashboard();
    renderChatHistory();
    renderSuggestions();
    setupChatListeners();
    updateThemeIcon();
  } else {
    app.innerHTML = UIRenderer.renderLoginModal();
    setupAuthListeners();
    updateThemeIcon();
  }
}

function setupAuthListeners() {
  const form = document.getElementById('authForm');
  if (form) {
    form.addEventListener('submit', handleAuthSubmit);
  }

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) {
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') handleAuthSubmit(e);
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') handleAuthSubmit(e);
    });
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorContainer = document.getElementById('errorContainer');
  const submitBtn = document.getElementById('submitBtn');

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait...';

  let result;
  if (isSignUpMode) {
    result = await authManager.signup(email, password, confirmPassword);
  } else {
    result = await authManager.login(email, password);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';

  if (result.success) {
    renderApp();
  } else {
    errorContainer.innerHTML = `
      <div class="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2">
        <svg class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-sm text-red-600 dark:text-red-400">${result.error}</p>
      </div>
    `;
  }
}

window.toggleAuthMode = function() {
  isSignUpMode = !isSignUpMode;
  const form = document.getElementById('authForm');
  const submitBtn = document.getElementById('submitBtn');
  const confirmPasswordContainer = document.getElementById('confirmPasswordContainer');
  const authToggleText = document.getElementById('authToggleText');
  const authToggleBtn = document.getElementById('authToggleBtn');

  if (isSignUpMode) {
    confirmPasswordContainer.style.display = 'block';
    submitBtn.textContent = 'Sign Up';
    authToggleText.textContent = 'Already have an account?';
    authToggleBtn.textContent = 'Sign In';
  } else {
    confirmPasswordContainer.style.display = 'none';
    submitBtn.textContent = 'Sign In';
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent = 'Sign Up';
  }

  document.getElementById('errorContainer').innerHTML = '';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('confirmPassword').value = '';
};

function renderChatHistory() {
  const container = document.getElementById('chatHistoryContainer');
  if (container) {
    const history = chatManager.getChatHistory();
    container.innerHTML = history.map(chat => `
      <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
        <p class="font-medium text-white truncate">${chat.title}</p>
        <p class="text-xs text-slate-400">${chat.date}</p>
      </button>
    `).join('');
  }
}

function renderSuggestions() {
  const container = document.getElementById('suggestionsContainer');
  if (container) {
    container.innerHTML = UIRenderer.renderSuggestions();
  }
}

function setupChatListeners() {
  const input = document.getElementById('messageInput');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.sendMessage();
      }
    });
  }
}

window.sendMessage = async function(customMessage) {
  if (isMessageLoading) return;

  const input = document.getElementById('messageInput');
  const message = customMessage || input.value;

  if (!message.trim()) return;

  isMessageLoading = true;
  input.disabled = true;

  // Add user message
  chatManager.addMessage('user', message);
  input.value = '';

  renderMessages();

  // Get LLM response
  const response = await chatManager.getLLMResponse(message);
  chatManager.addMessage('assistant', response);

  renderMessages();
  isMessageLoading = false;
  input.disabled = false;
  input.focus();
};

function renderMessages() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    const messages = chatManager.getMessages();
    if (messages.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center space-y-6">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Welcome to ESG Analyst</h2>
            <p class="text-slate-600 dark:text-slate-400">Get comprehensive ESG and financial analysis with AI-powered insights</p>
          </div>
          <div id="suggestionsContainer2">${UIRenderer.renderSuggestions()}</div>
        </div>
      `;
    } else {
      let html = messages.map(msg => UIRenderer.renderMessage(msg)).join('');
      if (isMessageLoading) {
        html += UIRenderer.renderLoading();
      }
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    }
  }
}

window.newChat = function() {
  chatManager.clearMessages();
  renderMessages();
  document.getElementById('messageInput').focus();
};

window.logout = async function() {
  await authManager.logout();
  renderApp();
};

function setupEventListeners() {
  // Any global event listeners
}
