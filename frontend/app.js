// ============ THEME MANAGEMENT ============
class ThemeManager {
  constructor() {
    this.isDark = localStorage.getItem("theme") === "dark"
    this.init()
  }

  init() {
    this.applyTheme()
    this.setupListeners()
  }

  applyTheme() {
    const html = document.documentElement
    if (this.isDark) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    this.updateIcons()
  }

  updateIcons() {
    const icons = document.querySelectorAll('[id*="themeIcon"]')
    icons.forEach((icon) => {
      icon.textContent = this.isDark ? "☀️" : "🌙"
    })
  }

  setupListeners() {
    const buttons = document.querySelectorAll('[id*="themeToggle"]')
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.toggle())
    })
  }

  toggle() {
    this.isDark = !this.isDark
    localStorage.setItem("theme", this.isDark ? "dark" : "light")
    this.applyTheme()
  }
}

// ============ AUTH MANAGEMENT ============
class AuthManager {
  constructor() {
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    this.isSignupMode = false
    this.setupListeners()
    this.checkAuth()
  }

  setupListeners() {
    document.getElementById("authForm").addEventListener("submit", (e) => this.handleSubmit(e))
    document.getElementById("toggleAuth").addEventListener("click", () => this.toggleMode())
  }

  toggleMode() {
    this.isSignupMode = !this.isSignupMode
    const title = document.getElementById("authTitle")
    const submitBtn = document.getElementById("submitBtn")
    const toggleBtn = document.getElementById("toggleAuth")

    if (this.isSignupMode) {
      title.textContent = "Sign Up"
      submitBtn.textContent = "Create Account"
      toggleBtn.textContent = "Already have an account?"
    } else {
      title.textContent = "Login"
      submitBtn.textContent = "Login"
      toggleBtn.textContent = "Create new account"
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    const email = document.getElementById("authEmail").value
    const password = document.getElementById("authPassword").value

    if (email && password.length >= 6) {
      this.isLoggedIn = true
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)
      this.showApp()
    } else {
      alert("Please enter valid email and password (min 6 characters)")
    }
  }

  checkAuth() {
    if (this.isLoggedIn) {
      this.showApp()
    } else {
      this.showLogin()
    }
  }

  showLogin() {
    document.getElementById("loginModal").classList.remove("hidden")
    document.getElementById("mainApp").classList.add("hidden")
  }

  showApp() {
    document.getElementById("loginModal").classList.add("hidden")
    document.getElementById("mainApp").classList.remove("hidden")
  }

  logout() {
    this.isLoggedIn = false
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    this.showLogin()
  }
}

// ============ CHAT MANAGEMENT ============
class ChatManager {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem("chatMessages")) || []
    this.uploadedFiles = []
    this.setupListeners()
    this.displayMessages()
  }

  setupListeners() {
    document.getElementById("sendBtn").addEventListener("click", () => this.sendMessage())
    document.getElementById("chatInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage()
    })

    document.getElementById("uploadPdfBtn").addEventListener("click", () => {
      document.getElementById("pdfInput").click()
    })

    document.getElementById("pdfInput").addEventListener("change", (e) => {
      this.handlePdfUpload(e)
    })

    const dragDropZone = document.getElementById("dragDropZone")
    dragDropZone.addEventListener("dragover", (e) => this.handleDragOver(e))
    dragDropZone.addEventListener("dragleave", (e) => this.handleDragLeave(e))
    dragDropZone.addEventListener("drop", (e) => this.handleDrop(e))

    document.querySelectorAll(".suggestion-card").forEach((card) => {
      card.addEventListener("click", () => {
        const suggestion = card.getAttribute("data-suggestion")
        document.getElementById("chatInput").value = suggestion
        this.sendMessage()
      })
    })

    document.getElementById("newChatBtn").addEventListener("click", () => this.clearChat())
  }

  handlePdfUpload(e) {
    const files = e.target.files
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
        })
      }
      this.displayUploadedFiles()
    }
  }

  handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    const dragDropZone = document.getElementById("dragDropZone")
    dragDropZone.style.backgroundColor = "#fef3c7"
    dragDropZone.style.borderColor = "#f59e0b"
    dragDropZone.style.borderWidth = "2px"
  }

  handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    const dragDropZone = document.getElementById("dragDropZone")
    dragDropZone.style.backgroundColor = ""
    dragDropZone.style.borderColor = ""
    dragDropZone.style.borderWidth = ""
  }

  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const dragDropZone = document.getElementById("dragDropZone")
    dragDropZone.style.backgroundColor = ""
    dragDropZone.style.borderColor = ""
    dragDropZone.style.borderWidth = ""

    const files = e.dataTransfer.files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
        })
      }
    }
    this.displayUploadedFiles()
  }

  displayUploadedFiles() {
    const container = document.getElementById("uploadedFiles")
    container.innerHTML = ""

    this.uploadedFiles.forEach((file, index) => {
      const tag = document.createElement("div")
      tag.className = "bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm flex items-center gap-2"
      tag.innerHTML = `
                📄 ${file.name}
                <button type="button" class="ml-1 hover:opacity-70" onclick="chatManager.removeFile(${index})">✕</button>
            `
      container.appendChild(tag)
    })
  }

  removeFile(index) {
    this.uploadedFiles.splice(index, 1)
    this.displayUploadedFiles()
  }

  sendMessage() {
    const input = document.getElementById("chatInput")
    const message = input.value.trim()

    if (!message && this.uploadedFiles.length === 0) return

    let fullMessage = message
    if (this.uploadedFiles.length > 0) {
      fullMessage += "\n\n[Uploaded PDFs: " + this.uploadedFiles.map((f) => f.name).join(", ") + "]"
    }

    // Add user message
    this.messages.push({ type: "user", text: fullMessage })
    input.value = ""
    this.displayMessages()

    // Simulate LLM response
    setTimeout(() => {
      const response = this.generateResponse(message)
      this.messages.push({ type: "assistant", text: response })
      this.displayMessages()
    }, 800)

    // Clear uploaded files after sending
    this.uploadedFiles = []
    this.displayUploadedFiles()
    localStorage.setItem("chatMessages", JSON.stringify(this.messages))
  }

  generateResponse(message) {
    const responses = {
      esg: "Based on your query, here's a comprehensive ESG analysis:\n\n• Environmental Score: 7.5/10\n• Social Score: 8.2/10\n• Governance Score: 7.8/10\n\nKey areas for improvement: Carbon footprint reduction and board diversity.",
      financial:
        "Financial Analysis Report:\n\n• Revenue Growth: 12.5% YoY\n• Profit Margin: 18.3%\n• Debt-to-Equity: 0.45\n• ROE: 14.2%\n\nThe company shows strong financial health with sustainable growth.",
      sustainability:
        "Sustainability Performance:\n\n• Renewable Energy: 45% of total energy\n• Waste Reduction: 22% decrease\n• Water Conservation: 18% reduction\n• Carbon Neutral Target: 2035\n\nExcellent progress toward sustainability goals.",
    }

    const key = message.toLowerCase()
    if (key.includes("esg")) return responses.esg
    if (key.includes("financial")) return responses.financial
    if (key.includes("sustainability")) return responses.sustainability

    return "Thank you for your inquiry. Our analysis system is processing your request. Please ask about ESG reports, financial analysis, or sustainability metrics for more detailed insights."
  }

  displayMessages() {
    const container = document.getElementById("messagesContainer")
    const suggestions = document.getElementById("suggestionsContainer")

    // Hide suggestions when messages exist
    suggestions.style.display = this.messages.length > 0 ? "none" : "block"

    container.innerHTML = ""
    this.messages.forEach((msg) => {
      const div = document.createElement("div")
      div.className = `flex ${msg.type === "user" ? "justify-end" : "justify-start"}`

      const bubble = document.createElement("div")
      bubble.className = `max-w-md px-4 py-2 rounded-lg ${
        msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
      }`
      bubble.textContent = msg.text

      div.appendChild(bubble)
      container.appendChild(div)
    })

    container.scrollTop = container.scrollHeight
  }

  clearChat() {
    this.messages = []
    localStorage.removeItem("chatMessages")
    this.displayMessages()
  }
}

// ============ APP INITIALIZATION ============
let chatManager

document.addEventListener("DOMContentLoaded", () => {
  const themeManager = new ThemeManager()
  const authManager = new AuthManager()
  chatManager = new ChatManager()

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", () => {
    authManager.logout()
  })
})
