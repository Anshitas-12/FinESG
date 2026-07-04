// Theme management - Light/Dark mode
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  
  if (theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
})();

window.toggleTheme = function() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
  
  // Update icon in the UI
  const themeIcon = document.querySelector('[data-theme-icon]');
  if (themeIcon) {
    updateThemeIcon();
  }
};

window.isDarkMode = function() {
  return document.documentElement.classList.contains('dark');
};

function updateThemeIcon() {
  const isDark = window.isDarkMode();
  const themeBtn = document.querySelector('[data-theme-btn]');
  if (themeBtn) {
    if (isDark) {
      themeBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707.707M6.343 6.343l-.707-.707m12.728 0l-.707.707m-12.02 12.02l.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Light Mode
      `;
    } else {
      themeBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
        Dark Mode
      `;
    }
  }
}
