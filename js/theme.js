const THEME_KEY = 'navify-theme';

function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.body.classList.toggle('theme-light', t === 'light');
  document.body.classList.toggle('theme-dark', t === 'dark');
  
  // Update meta theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', t === 'light' ? '#ffffff' : '#0a1a36');
  }
  
  // Update CSS variables for theme
  const root = document.documentElement;
  if (t === 'light') {
    root.style.setProperty('--bg', '#f5f5f5');
    root.style.setProperty('--text', '#1a1a1a');
    root.style.setProperty('--muted', '#666666');
    root.style.setProperty('--border', '#e0e0e0');
  } else {
    root.style.setProperty('--bg', '#0a1a36');
    root.style.setProperty('--text', '#ffffff');
    root.style.setProperty('--muted', '#a0a0a0');
    root.style.setProperty('--border', '#1a3a56');
  }
}

function labelForTheme(theme) {
  return theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
}

function toggleTheme() {
  const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  
  const toggle = document.querySelector('.toggle');
  if (toggle) {
    toggle.textContent = labelForTheme(next);
  }
  
  console.log('Theme switched to:', next);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
  const toggle = document.querySelector('.toggle');
  if (toggle) {
    toggle.textContent = labelForTheme(saved);
    toggle.addEventListener('click', toggleTheme);
  }
});
