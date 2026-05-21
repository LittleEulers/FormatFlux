const STORAGE_KEY = 'formatflux_users';
const SESSION_KEY = 'formatflux_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function setUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

function wireLogout(buttonId = 'logoutBtn') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}

window.FormatFluxAuth = {
  getUsers,
  setUsers,
  setSession,
  getSession,
  clearSession,
  requireAuth,
  wireLogout,
};
