const API_URL = 'https://api.teeny.babymonks.com/teeny/create';
const BASE_URL = 'https://teeny.babymonks.com';

const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const customKeyInput = document.getElementById('custom-key-input');
const toggleCustom = document.getElementById('toggle-custom');
const customKeyWrapper = document.getElementById('custom-key-wrapper');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const submitSpinner = document.getElementById('submit-spinner');
const resultEl = document.getElementById('result');
const resultLink = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const errorEl = document.getElementById('error');
const errorText = document.getElementById('error-text');
const themeToggle = document.getElementById('theme-toggle');

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitText.classList.toggle('hidden', loading);
  submitSpinner.classList.toggle('hidden', !loading);
}

function showResult(url) {
  resultLink.textContent = url;
  resultLink.href = url;
  resultEl.classList.remove('hidden');
  copyBtn.classList.remove('copied');
  copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  errorEl.classList.add('hidden');
}

function showError(msg) {
  errorText.textContent = msg;
  errorEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
}

function hideAllResults() {
  resultEl.classList.add('hidden');
  errorEl.classList.add('hidden');
}

toggleCustom.addEventListener('click', () => {
  const hidden = customKeyWrapper.classList.toggle('hidden');
  toggleCustom.textContent = hidden ? '+ Custom key (optional)' : '- Custom key (optional)';
  if (!hidden) customKeyInput.focus();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAllResults();

  const url = urlInput.value.trim();
  if (!url) return;

  const customKey = customKeyInput.value.trim();
  setLoading(true);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, customKey }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      showError(data?.message || data?.error || `Request failed (${res.status})`);
      return;
    }

    const data = await res.json();
    const teenyUrl = data.teenyUrl || data.shortUrl || data.url || data.key;
    if (!teenyUrl) {
      showError('Unexpected response format. Please try again.');
      return;
    }

    const shortUrl = `${BASE_URL}/${teenyUrl}`;
    showResult(shortUrl);
  } catch (err) {
    showError('Network error. Check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }, 2000);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copyBtn.classList.add('copied');
  }
}

copyBtn.addEventListener('click', () => {
  copyToClipboard(resultLink.textContent);
});

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const saved = localStorage.getItem('theme');
if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  applyTheme(true);
}

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});
