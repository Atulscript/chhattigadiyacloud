/**
 * Chhattisgadhiya Cloud — CG Cloud Dashboard Client Engine
 * Full GitHub-backed Content Management for Pages, Team, Blog, and Permissions.
 */

const GITHUB_REPO_OWNER = 'Atulscript';
const GITHUB_REPO_NAME = 'chhattigadiyacloud';
const CONTENT_FILE_PATH = 'src/data/site-content.json';
const BRANCH_NAME = 'main';

// Global Studio State
const state = {
  token: localStorage.getItem('cgcloud_gh_token') || '',
  user: null,
  adminSession: JSON.parse(sessionStorage.getItem('cgcloud_admin_session') || localStorage.getItem('cgcloud_admin_session') || 'null'),
  fileSha: '',
  content: null,
  originalContentJson: '',
  isDirty: false,
  activeTab: 'dashboard',
  activeSubPage: 'homepage',
  editingPostIndex: null
};

// Native Web Crypto SHA-256 calculation
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// UTF-8 Safe Base64 helpers for bilingual Hindi / English content
function utf8ToBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

// Confirmation Modal System (Replaces crude window.confirm)
let pendingConfirmCallback = null;

function showConfirmModal(title, message, onConfirm, confirmText = 'Confirm', isDanger = true) {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  const btn = document.getElementById('confirm-modal-btn');
  if (!modal) {
    if (window.confirm(message)) onConfirm();
    return;
  }
  if (titleEl) titleEl.textContent = title || 'Confirm Action';
  if (msgEl) msgEl.textContent = message || 'Are you sure you want to proceed?';
  if (btn) {
    btn.textContent = confirmText;
    btn.style.background = isDanger ? 'var(--studio-red)' : 'var(--studio-primary)';
  }
  pendingConfirmCallback = onConfirm;
  modal.classList.add('active');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.remove('active');
  pendingConfirmCallback = null;
}
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('cgcloud_studio_theme') || 'light';
  applyTheme(saved);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cgcloud_studio_theme', theme);
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  const metaTheme = document.getElementById('meta-theme-color');
  if (metaTheme) {
    metaTheme.content = theme === 'dark' ? '#0E1015' : '#C83200';
  }
}

// Initialize Studio
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupNavigation();
  setupEventListeners();
  setupAdminAuth();

  // Load content (locally or from GitHub)
  await loadInitialContent();

  // Check admin session security gate
  const isAuthenticated = checkAdminAuthentication();

  // If token exists, verify with GitHub
  if (state.token) {
    await verifyGitHubAuth(state.token, false);
  } else {
    updateAuthUI(null);
  }

  if (isAuthenticated) {
    renderActiveTab();
  }
});

function applySidebarPermissions() {
  const session = state.adminSession;
  if (!session) return;
  const isSuperAdmin = session.role === 'admin';
  const allowed = session.permissions || (isSuperAdmin ? ['dashboard', 'pages', 'team', 'blog', 'users', 'settings'] : ['dashboard', 'blog']);

  document.querySelectorAll('#studio-nav-list .studio-nav-item').forEach(item => {
    const section = item.dataset.section;
    if (!section) return;
    if (isSuperAdmin || allowed.includes(section)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function checkAdminAuthentication() {
  const loginOverlay = document.getElementById('studio-login-screen');
  const studioLayout = document.getElementById('studio-layout');
  const adminUserEl = document.getElementById('sidebar-admin-user');
  const topbarUserWrap = document.getElementById('topbar-user-wrap');
  const topbarAdminName = document.getElementById('topbar-admin-name');
  const topbarAdminAvatar = document.getElementById('topbar-admin-avatar');

  if (state.adminSession && state.adminSession.username) {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (studioLayout) studioLayout.style.display = 'flex';
    if (adminUserEl) adminUserEl.textContent = `👤 ${state.adminSession.username}`;
    if (topbarUserWrap) topbarUserWrap.style.display = 'inline-flex';
    if (topbarAdminName) topbarAdminName.textContent = state.adminSession.displayName || state.adminSession.username;
    if (topbarAdminAvatar) topbarAdminAvatar.textContent = (state.adminSession.username || 'A')[0].toUpperCase();

    // Apply RBAC nav item filtering
    applySidebarPermissions();

    return true;
  } else {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (studioLayout) studioLayout.style.display = 'none';
    if (topbarUserWrap) topbarUserWrap.style.display = 'none';
    return false;
  }
}

function setupAdminAuth() {
  const loginForm = document.getElementById('studio-login-form');
  const errorBox = document.getElementById('login-error-box');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username').value.trim();
      const passwordInput = document.getElementById('login-password').value;
      const rememberInput = document.getElementById('login-remember').checked;
      const submitBtn = document.getElementById('login-submit-btn');

      if (!usernameInput || !passwordInput) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying credentials...';
      if (errorBox) errorBox.classList.remove('visible');

      const passHash = await sha256(passwordInput);

      // Authenticate against admin users configured in site-content.json (with fallback default)
      const usersList = (state.content && state.content.adminAuth && state.content.adminAuth.users) || [
        {
          username: "admin",
          displayName: "Super Administrator",
          role: "admin",
          permissions: ["dashboard", "pages", "team", "blog", "users", "settings"],
          passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
        }
      ];

      const foundUser = usersList.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.passwordHash === passHash);

      if (foundUser) {
        const session = {
          username: foundUser.username,
          displayName: foundUser.displayName || foundUser.username,
          role: foundUser.role || 'admin',
          permissions: foundUser.permissions || (foundUser.role === 'admin' ? ['dashboard', 'pages', 'team', 'blog', 'users', 'settings'] : ['dashboard', 'blog']),
          timestamp: Date.now()
        };
        state.adminSession = session;
        if (rememberInput) {
          localStorage.setItem('cgcloud_admin_session', JSON.stringify(session));
        } else {
          sessionStorage.setItem('cgcloud_admin_session', JSON.stringify(session));
        }

        checkAdminAuthentication();
        showToast(`Welcome back, ${session.displayName}!`, 'success');
        renderActiveTab();
      } else {
        if (errorBox) {
          errorBox.textContent = 'Invalid username or password. Please verify and try again.';
          errorBox.classList.add('visible');
        }
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to CG Cloud Dashboard';
    });
  }

  // Logout handler (both topbar button and sidebar button)
  const handleLogout = () => {
    showConfirmModal(
      'Sign Out of CG Cloud Dashboard',
      'Are you sure you want to sign out of CG Cloud Dashboard?',
      () => {
        localStorage.removeItem('cgcloud_admin_session');
        sessionStorage.removeItem('cgcloud_admin_session');
        state.adminSession = null;
        checkAdminAuthentication();
        showToast('Signed out of admin session.', 'info');
      },
      'Sign Out',
      false
    );
  };

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const topbarLogoutBtn = document.getElementById('topbar-logout-btn');
  if (topbarLogoutBtn) topbarLogoutBtn.addEventListener('click', handleLogout);
}

// Setup sidebar tab navigation
function setupNavigation() {
  const navBtns = document.querySelectorAll('.studio-nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (!tab) return;
      switchTab(tab);
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('studio-sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function switchTab(tabId) {
  // Check RBAC permission for non-super-admin users
  const session = state.adminSession;
  if (session && session.role !== 'admin') {
    const allowed = session.permissions || ['dashboard', 'blog'];
    if (!allowed.includes(tabId)) {
      showToast(`⚠️ Access Restricted: You do not have permission to access "${tabId}".`, 'error');
      return;
    }
  }

  state.activeTab = tabId;
  document.querySelectorAll('.studio-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.studio-panel').forEach(p => p.classList.remove('active'));
  
  const targetPanel = document.getElementById(`panel-${tabId}`);
  if (targetPanel) targetPanel.classList.add('active');

  const titleEl = document.getElementById('breadcrumb-title');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard',
      team: 'About & Team Management',
      blog: 'Blog Posts Manager',
      pages: 'All Pages Content',
      users: 'Users & Access Permissions',
      settings: 'Settings, GitHub Auth & Backup'
    };
    titleEl.textContent = titles[tabId] || 'CG Cloud Dashboard';
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('studio-sidebar');
  if (sidebar) sidebar.classList.remove('open');

  renderActiveTab();
}

// Event listeners for global actions
function setupEventListeners() {
  // Login modal triggers
  const loginBtn = document.getElementById('login-trigger-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => showAuthModal());
  }

  // Auth form submit
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('gh-token-input');
      if (input && input.value.trim()) {
        await verifyGitHubAuth(input.value.trim(), true);
      }
    });
  }

  // Sign out
  const signoutBtn = document.getElementById('signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
      localStorage.removeItem('cgcloud_gh_token');
      state.token = '';
      state.user = null;
      updateAuthUI(null);
      showToast('Signed out of GitHub.', 'info');
      renderActiveTab();
    });
  }

  // Publish to GitHub button
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      await publishContentToGitHub();
    });
  }

  // Discard changes
  const discardBtn = document.getElementById('discard-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      showConfirmModal(
        'Discard Unsaved Changes',
        'Are you sure you want to discard all unsaved changes and reload from source?',
        () => {
          state.content = JSON.parse(state.originalContentJson);
          markDirty(false);
          renderActiveTab();
          showToast('Unsaved changes discarded.', 'info');
        },
        'Discard Changes',
        true
      );
    });
  }

  // Confirmation modal action button
  const confirmActionBtn = document.getElementById('confirm-modal-btn');
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener('click', () => {
      const cb = pendingConfirmCallback;
      closeConfirmModal();
      if (typeof cb === 'function') cb();
    });
  }

  // Close modals on Escape key or backdrop click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (typeof closePostModal === 'function') closePostModal();
      if (typeof closeUserModal === 'function') closeUserModal();
      if (typeof closeTeamModal === 'function') closeTeamModal();
      closeConfirmModal();
    }
  });

  ['user-modal', 'team-modal', 'confirm-modal', 'post-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          if (id === 'user-modal' && typeof closeUserModal === 'function') closeUserModal();
          else if (id === 'team-modal' && typeof closeTeamModal === 'function') closeTeamModal();
          else if (id === 'confirm-modal') closeConfirmModal();
          else if (id === 'post-modal' && typeof closePostModal === 'function') closePostModal();
        }
      });
    }
  });
}

// Load content: from GitHub if token present, or local ../src/data/site-content.json
async function loadInitialContent() {
  try {
    if (state.token) {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${CONTENT_FILE_PATH}?ref=${BRANCH_NAME}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        state.fileSha = data.sha;
        const decoded = base64ToUtf8(data.content.replace(/\s/g, ''));
        state.content = JSON.parse(decoded);
        state.originalContentJson = JSON.stringify(state.content);
        markDirty(false);
        console.log('Loaded content directly from GitHub repository.');
        return;
      }
    }

    // Fallback: Local static fetch
    const localRes = await fetch('../src/data/site-content.json');
    if (localRes.ok) {
      state.content = await localRes.json();
      state.originalContentJson = JSON.stringify(state.content);
      markDirty(false);
      console.log('Loaded content from local static site-content.json.');
    }
  } catch (err) {
    console.error('Error loading content:', err);
    showToast('Failed to load content dictionary.', 'error');
  }
}

// Verify GitHub Auth & Collaborator Permissions
async function verifyGitHubAuth(token, showFeedback = false) {
  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying with GitHub...';
  }

  try {
    // 1. Get authenticated user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userRes.ok) {
      throw new Error('Invalid GitHub token or insufficient scopes.');
    }

    const userData = await userRes.json();

    // 2. Check repository collaborator permission
    let role = 'reader';
    if (userData.login.toLowerCase() === GITHUB_REPO_OWNER.toLowerCase()) {
      role = 'admin';
    } else {
      const permRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/collaborators/${userData.login}/permission`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (permRes.ok) {
        const permData = await permRes.json();
        role = permData.permission || 'reader'; // admin, write, read
      }
    }

    state.token = token;
    state.user = {
      login: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      role: role
    };

    localStorage.setItem('cgcloud_gh_token', token);
    updateAuthUI(state.user);
    closeAuthModal();

    if (showFeedback) {
      showToast(`Connected as @${userData.login} (${role.toUpperCase()})`, 'success');
    }

    // Refresh content from GitHub to get latest SHA
    await loadInitialContent();
    renderActiveTab();

  } catch (err) {
    console.error('Auth verification failed:', err);
    if (showFeedback) {
      alert('GitHub connection error: ' + err.message + '\n\nPlease ensure your Personal Access Token has "repo" scope.');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Connect GitHub Account';
    }
  }
}

function updateAuthUI(user) {
  const authContainer = document.getElementById('user-auth-badge-wrap');
  const publishBtn = document.getElementById('publish-btn');
  const repoPill = document.getElementById('sidebar-repo-pill');

  if (user) {
    if (authContainer) {
      authContainer.innerHTML = `
        <div class="user-profile-badge">
          <img src="${user.avatar}" alt="${user.login}" class="user-avatar">
          <span>@${user.login}</span>
          <span class="user-role-tag">${user.role}</span>
          <button type="button" id="signout-btn" class="icon-btn" title="Sign out" style="border:none; padding:2px;">✕</button>
        </div>
      `;
      document.getElementById('signout-btn').addEventListener('click', () => {
        localStorage.removeItem('cgcloud_gh_token');
        state.token = '';
        state.user = null;
        updateAuthUI(null);
        showToast('Signed out.', 'info');
        renderActiveTab();
      });
    }

    if (publishBtn) {
      const canPublish = user.role === 'admin' || user.role === 'write';
      publishBtn.disabled = !canPublish || !state.isDirty;
      publishBtn.title = canPublish ? 'Publish changes to live site' : 'You need write permissions to publish';
    }

    if (repoPill) {
      repoPill.innerHTML = `🟢 ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME} (${BRANCH_NAME})`;
    }
  } else {
    if (authContainer) {
      authContainer.innerHTML = `
        <button type="button" id="login-trigger-btn" class="btn-studio btn-studio-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span>Connect GitHub</span>
        </button>
      `;
      document.getElementById('login-trigger-btn').addEventListener('click', showAuthModal);
    }

    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.title = 'Connect GitHub in Settings to publish changes';
    }

    if (repoPill) {
      repoPill.innerHTML = `⚪ Local Preview Mode`;
    }
  }
}

// Mark content dirty or clean
function markDirty(dirty = true) {
  state.isDirty = dirty;
  const badge = document.getElementById('dirty-badge');
  const discardBtn = document.getElementById('discard-btn');
  const publishBtn = document.getElementById('publish-btn');

  if (badge) badge.classList.toggle('visible', dirty);
  if (discardBtn) discardBtn.style.display = dirty ? 'inline-flex' : 'none';
  if (publishBtn && state.user && (state.user.role === 'admin' || state.user.role === 'write')) {
    publishBtn.disabled = !dirty;
  }
}

// Commit & Publish to GitHub
async function publishContentToGitHub() {
  if (!state.token) {
    showAuthModal();
    return;
  }

  const publishBtn = document.getElementById('publish-btn');
  const originalText = publishBtn.innerHTML;
  publishBtn.disabled = true;
  publishBtn.innerHTML = `<span>Publishing...</span>`;

  try {
    // 1. Fetch latest SHA if missing
    if (!state.fileSha) {
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${CONTENT_FILE_PATH}?ref=${BRANCH_NAME}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const d = await getRes.json();
        state.fileSha = d.sha;
      }
    }

    // 2. Prepare payload
    const jsonString = JSON.stringify(state.content, null, 2);
    const contentBase64 = utf8ToBase64(jsonString);
    const commitMsg = `cms: update content via Studio by @${state.user ? state.user.login : 'admin'}`;

    const bodyData = {
      message: commitMsg,
      content: contentBase64,
      branch: BRANCH_NAME
    };
    if (state.fileSha) {
      bodyData.sha = state.fileSha;
    }

    // 3. Commit to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${CONTENT_FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(bodyData)
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || 'Publish failed');
    }

    const resultData = await putRes.json();
    state.fileSha = resultData.content.sha;
    state.originalContentJson = JSON.stringify(state.content);
    markDirty(false);

    showToast('Changes published! Deploying live (~30s)...', 'success');

    // Trigger workflow run tracking
    pollDeployment();

  } catch (err) {
    console.error('Publish error:', err);
    alert('Failed to publish changes: ' + err.message);
  } finally {
    publishBtn.disabled = !state.isDirty;
    publishBtn.innerHTML = originalText;
  }
}

// Poll GitHub Actions workflow status
async function pollDeployment() {
  const statusPill = document.getElementById('deployment-status-pill');
  if (!statusPill) return;

  statusPill.style.display = 'inline-flex';
  statusPill.innerHTML = `⏳ GitHub Actions: Building live site...`;

  let attempts = 0;
  const timer = setInterval(async () => {
    attempts++;
    if (attempts > 12) {
      clearInterval(timer);
      statusPill.innerHTML = `✅ Published! Refresh live site in 1 min.`;
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/runs?per_page=1`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const latest = data.workflow_runs && data.workflow_runs[0];
        if (latest) {
          if (latest.status === 'completed' && latest.conclusion === 'success') {
            clearInterval(timer);
            statusPill.innerHTML = `🚀 Live on GitHub Pages! <a href="https://${GITHUB_REPO_OWNER.toLowerCase()}.github.io/${GITHUB_REPO_NAME}/" target="_blank" style="color:inherit;text-decoration:underline;margin-left:4px;">Visit Site ↗</a>`;
          }
        }
      }
    } catch (e) {}
  }, 4000);
}

// Modals
function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

// Toast
function showToast(msg, type = 'success') {
  const toast = document.getElementById('studio-toast');
  if (!toast) return;
  toast.className = `studio-toast ${type} show`;
  toast.textContent = msg;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// Tab View Dispatcher
function renderActiveTab() {
  if (!state.content) return;

  switch (state.activeTab) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'team':
      renderTeamAndAbout();
      break;
    case 'blog':
      renderBlogManager();
      break;
    case 'pages':
      renderPagesManager();
      break;
    case 'users':
      renderUsersManager();
      break;
    case 'settings':
      renderSettingsManager();
      break;
  }
}

// ==========================================
// 1. DASHBOARD OVERVIEW
// ==========================================
function renderDashboard() {
  const container = document.getElementById('panel-dashboard');
  if (!container || !state.content) return;

  const totalPlays = (state.content.productions || []).length;
  const totalPosts = (state.content.blog && state.content.blog.posts || []).length;
  const totalTeam = (state.content.about && state.content.about.team || []).length;
  const totalIssues = (state.content.magazine && state.content.magazine.previousIssues || []).length + 1;

  container.innerHTML = `
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">🚀 Welcome to CG Cloud Dashboard</h2>
          <div class="studio-card-desc">Comprehensive content management for your bilingual culture & theatre portal.</div>
        </div>
        <div id="deployment-status-pill" style="display:none; padding:0.35rem 0.85rem; background:var(--studio-green-light); color:var(--studio-green); border-radius:var(--radius-pill); font-size:0.8rem; font-weight:700;"></div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-top:1rem;">
        <div style="background:var(--studio-surface-subtle); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--studio-border-subtle);">
          <div style="font-size:2rem; font-weight:800; color:var(--studio-primary);">${totalTeam}</div>
          <div style="font-size:0.82rem; font-weight:700; color:var(--studio-text-secondary);">Team Members</div>
          <button type="button" class="btn-studio btn-studio-secondary" style="margin-top:0.75rem; font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="switchTab('team')">Manage Team →</button>
        </div>

        <div style="background:var(--studio-surface-subtle); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--studio-border-subtle);">
          <div style="font-size:2rem; font-weight:800; color:var(--studio-blue);">${totalPosts}</div>
          <div style="font-size:0.82rem; font-weight:700; color:var(--studio-text-secondary);">Blog Articles</div>
          <button type="button" class="btn-studio btn-studio-secondary" style="margin-top:0.75rem; font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="switchTab('blog')">Manage Posts →</button>
        </div>

        <div style="background:var(--studio-surface-subtle); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--studio-border-subtle);">
          <div style="font-size:2rem; font-weight:800; color:var(--studio-green);">${totalPlays}</div>
          <div style="font-size:0.82rem; font-weight:700; color:var(--studio-text-secondary);">Repertoire Plays</div>
          <button type="button" class="btn-studio btn-studio-secondary" style="margin-top:0.75rem; font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="switchTab('pages')">Edit Repertoire →</button>
        </div>

        <div style="background:var(--studio-surface-subtle); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--studio-border-subtle);">
          <div style="font-size:2rem; font-weight:800; color:var(--studio-amber);">${totalIssues}</div>
          <div style="font-size:0.82rem; font-weight:700; color:var(--studio-text-secondary);">Magazine Issues</div>
          <button type="button" class="btn-studio btn-studio-secondary" style="margin-top:0.75rem; font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="switchTab('pages')">Edit Journal →</button>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts Card -->
    <div class="studio-card">
      <h3 class="studio-card-title" style="margin-bottom:0.75rem;">⚡ Quick Actions</h3>
      <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
        <button type="button" class="btn-studio btn-studio-primary" onclick="openCreatePostModal()">+ Create New Blog Post</button>
        <button type="button" class="btn-studio btn-studio-secondary" onclick="openCreateTeamModal()">+ Add Team Member</button>
        <a href="https://${GITHUB_REPO_OWNER.toLowerCase()}.github.io/${GITHUB_REPO_NAME}/" target="_blank" class="btn-studio btn-studio-secondary">View Live Website ↗</a>
      </div>
    </div>
  `;
}

// ==========================================
// 2. TEAM & ABOUT MANAGEMENT (User's Priority)
// ==========================================
function renderTeamAndAbout() {
  const container = document.getElementById('panel-team');
  if (!container || !state.content) return;

  const about = state.content.about || {};
  const team = about.team || [];

  const teamCardsHtml = team.map((member, index) => {
    const avatarVal = member.image || member.avatar || '';
    return `
      <div class="team-card-editor" data-index="${index}">
        <div class="team-card-header">
          <span class="team-card-badge">Member #${index + 1}</span>
          <div class="team-card-actions">
            <button type="button" class="icon-btn" onclick="openEditTeamModal(${index})" title="Edit in Modal">✏️</button>
            ${index > 0 ? `<button type="button" class="icon-btn" onclick="moveTeamMember(${index}, -1)" title="Move Up">↑</button>` : ''}
            ${index < team.length - 1 ? `<button type="button" class="icon-btn" onclick="moveTeamMember(${index}, 1)" title="Move Down">↓</button>` : ''}
            <button type="button" class="icon-btn danger" onclick="removeTeamMember(${index})" title="Delete Member">✕</button>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; padding:0.6rem 0.75rem; background:var(--studio-surface-subtle); border-radius:var(--radius-sm); border:1px solid var(--studio-border-subtle);">
          <div style="width:44px; height:44px; border-radius:50%; overflow:hidden; background:var(--studio-border-subtle); display:flex; align-items:center; justify-content:center; font-size:1.3rem; border:1.5px solid var(--studio-primary); flex-shrink:0;">
            ${avatarVal ? `<img src="${escapeHtml(avatarVal)}" alt="${escapeHtml(member.name || '')}" style="width:100%; height:100%; object-fit:cover;">` : '👤'}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:0.78rem; font-weight:700; color:var(--studio-text);">Profile Photo</div>
            <div style="font-size:0.72rem; color:var(--studio-text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${avatarVal ? 'Custom avatar set' : 'Default icon'}</div>
          </div>
          <button type="button" class="btn-studio btn-studio-secondary" style="font-size:0.72rem; padding:0.25rem 0.5rem;" onclick="openEditTeamModal(${index})">Change Photo</button>
        </div>

        <div class="form-group">
          <label class="form-label">Full Name (English)</label>
          <input type="text" class="form-control" value="${escapeHtml(member.name || '')}" onchange="updateTeamField(${index}, 'name', this.value)">
        </div>

        <div class="bilingual-tabs-wrap">
          <div class="bilingual-header">
            <span class="bilingual-title">Role / Designation</span>
          </div>
          <div class="bilingual-grid">
            <div>
              <span class="bilingual-col-tag bilingual-tag-en">English</span>
              <input type="text" class="form-control" value="${escapeHtml(member.role && member.role.en || '')}" onchange="updateTeamBilingualField(${index}, 'role', 'en', this.value)">
            </div>
            <div>
              <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
              <input type="text" class="form-control" value="${escapeHtml(member.role && member.role.hi || '')}" onchange="updateTeamBilingualField(${index}, 'role', 'hi', this.value)">
            </div>
          </div>
        </div>

        <div class="bilingual-tabs-wrap">
          <div class="bilingual-header">
            <span class="bilingual-title">Biography / Profile Summary</span>
          </div>
          <div class="bilingual-grid">
            <div>
              <span class="bilingual-col-tag bilingual-tag-en">English</span>
              <textarea class="form-control" onchange="updateTeamBilingualField(${index}, 'bio', 'en', this.value)">${escapeHtml(member.bio && member.bio.en || '')}</textarea>
            </div>
            <div>
              <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
              <textarea class="form-control" onchange="updateTeamBilingualField(${index}, 'bio', 'hi', this.value)">${escapeHtml(member.bio && member.bio.hi || '')}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Team Members Section -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">👥 Team Members (${team.length})</h2>
          <div class="studio-card-desc">Manage leadership, artists, playwrights, and coordinators shown on the About page.</div>
        </div>
        <button type="button" class="btn-studio btn-studio-primary" onclick="openCreateTeamModal()">+ Add Member</button>
      </div>

      <div class="team-grid">
        ${teamCardsHtml}
      </div>
    </div>

    <!-- About Mission & Institutional Statements -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">🏛️ Institutional Vision & Mission</h2>
          <div class="studio-card-desc">Bilingual mission, vision, history, and cultural differentiators.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'about-page-banner',
        label: 'About Page Header Creative Banner',
        hint: 'Header billboard creative banner displayed at the top of the About Us page.',
        currentSrc: about.bannerImage || '/src/assets/images/hero-art.svg',
        onChangeFnStr: 'updateAboutBanner'
      })}

      <div style="margin-top:1.25rem;">
        ${renderMediaPickerHtml({
          id: 'about-cultural-art',
          label: 'Cultural Connection & Roots Artwork',
          hint: 'Artistic vignette displayed alongside the living traditions & folk roots section.',
          currentSrc: about.culturalArt || '/src/assets/images/fest-stage-crowd.svg',
          onChangeFnStr: 'updateAboutCulturalArt'
        })}
      </div>

      <div class="bilingual-tabs-wrap" style="margin-top:1.5rem;">
        <div class="bilingual-header"><span class="bilingual-title">Mission Statement</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <textarea class="form-control" onchange="updateAboutField('mission', 'en', this.value)">${escapeHtml(about.mission && about.mission.en || '')}</textarea>
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <textarea class="form-control" onchange="updateAboutField('mission', 'hi', this.value)">${escapeHtml(about.mission && about.mission.hi || '')}</textarea>
          </div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Vision Statement</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <textarea class="form-control" onchange="updateAboutField('vision', 'en', this.value)">${escapeHtml(about.vision && about.vision.en || '')}</textarea>
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <textarea class="form-control" onchange="updateAboutField('vision', 'hi', this.value)">${escapeHtml(about.vision && about.vision.hi || '')}</textarea>
          </div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Cultural Connection & Roots</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <textarea class="form-control" onchange="updateAboutField('culturalConnection', 'en', this.value)">${escapeHtml(about.culturalConnection && about.culturalConnection.en || '')}</textarea>
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <textarea class="form-control" onchange="updateAboutField('culturalConnection', 'hi', this.value)">${escapeHtml(about.culturalConnection && about.culturalConnection.hi || '')}</textarea>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Team Member CRUD handlers
window.updateTeamField = function(index, key, value) {
  state.content.about.team[index][key] = value;
  markDirty(true);
};

window.updateTeamBilingualField = function(index, key, lang, value) {
  if (!state.content.about.team[index][key]) {
    state.content.about.team[index][key] = { en: '', hi: '' };
  }
  state.content.about.team[index][key][lang] = value;
  markDirty(true);
};

window.moveTeamMember = function(index, delta) {
  const team = state.content.about.team;
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= team.length) return;
  const temp = team[index];
  team[index] = team[newIndex];
  team[newIndex] = temp;
  markDirty(true);
  renderTeamAndAbout();
};

window.removeTeamMember = function(index) {
  const member = state.content.about.team[index];
  showConfirmModal(
    'Remove Team Member',
    `Are you sure you want to remove "${member.name || 'this team member'}" from the team?`,
    () => {
      state.content.about.team.splice(index, 1);
      markDirty(true);
      renderTeamAndAbout();
      showToast('Team member removed.', 'info');
    },
    'Remove Member',
    true
  );
};

window.openCreateTeamModal = function() {
  const modal = document.getElementById('team-modal');
  if (!modal) return;
  document.getElementById('team-modal-title').textContent = '👤 Add Team Member';
  document.getElementById('team-edit-index').value = '-1';
  document.getElementById('team-name-input').value = '';
  document.getElementById('team-avatar-input').value = '';
  updateTeamModalThumb('');
  document.getElementById('team-role-en').value = '';
  document.getElementById('team-role-hi').value = '';
  document.getElementById('team-bio-en').value = '';
  document.getElementById('team-bio-hi').value = '';
  modal.classList.add('active');
  document.getElementById('team-name-input').focus();
};

window.openEditTeamModal = function(index) {
  const modal = document.getElementById('team-modal');
  if (!modal || !state.content.about || !state.content.about.team) return;
  const member = state.content.about.team[index];
  if (!member) return;

  document.getElementById('team-modal-title').textContent = `✏️ Edit Member: ${member.name || 'Team Member'}`;
  document.getElementById('team-edit-index').value = String(index);
  document.getElementById('team-name-input').value = member.name || '';
  const avatarVal = member.image || member.avatar || '';
  document.getElementById('team-avatar-input').value = avatarVal;
  updateTeamModalThumb(avatarVal);
  document.getElementById('team-role-en').value = (member.role && member.role.en) || '';
  document.getElementById('team-role-hi').value = (member.role && member.role.hi) || '';
  document.getElementById('team-bio-en').value = (member.bio && member.bio.en) || '';
  document.getElementById('team-bio-hi').value = (member.bio && member.bio.hi) || '';
  modal.classList.add('active');
  document.getElementById('team-name-input').focus();
};

window.updateTeamModalThumb = function(val) {
  const thumb = document.getElementById('team-modal-thumb');
  if (!thumb) return;
  if (val && val.trim()) {
    thumb.innerHTML = `<img src="${escapeHtml(val.trim())}" alt="Avatar" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.parentElement.innerHTML='👤';">`;
  } else {
    thumb.innerHTML = '👤';
  }
};

window.handleTeamAvatarUpload = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    const input = document.getElementById('team-avatar-input');
    if (input) input.value = dataUrl;
    updateTeamModalThumb(dataUrl);
  };
  reader.readAsDataURL(file);
};

window.closeTeamModal = function() {
  const modal = document.getElementById('team-modal');
  if (modal) modal.classList.remove('active');
};

window.saveTeamMemberFromModal = function() {
  const index = parseInt(document.getElementById('team-edit-index').value, 10);
  const name = document.getElementById('team-name-input').value.trim();
  const avatar = document.getElementById('team-avatar-input') ? document.getElementById('team-avatar-input').value.trim() : '';
  const roleEn = document.getElementById('team-role-en').value.trim();
  const roleHi = document.getElementById('team-role-hi').value.trim();
  const bioEn = document.getElementById('team-bio-en').value.trim();
  const bioHi = document.getElementById('team-bio-hi').value.trim();

  if (!name) {
    alert('Please enter a team member name.');
    document.getElementById('team-name-input').focus();
    return;
  }

  if (!state.content.about) state.content.about = {};
  if (!state.content.about.team) state.content.about.team = [];

  const memberData = {
    name: name,
    image: avatar,
    role: { en: roleEn, hi: roleHi },
    bio: { en: bioEn, hi: bioHi }
  };

  if (index === -1) {
    state.content.about.team.push(memberData);
    showToast(`Added "${name}" to team. Click "Publish" to save permanently.`, 'success');
  } else {
    state.content.about.team[index] = memberData;
    showToast(`Updated "${name}". Click "Publish" to save permanently.`, 'success');
  }

  markDirty(true);
  closeTeamModal();
  renderTeamAndAbout();
};

window.addNewTeamMember = function() {
  openCreateTeamModal();
};

window.updateAboutField = function(field, lang, value) {
  if (!state.content.about[field]) state.content.about[field] = { en: '', hi: '' };
  state.content.about[field][lang] = value;
  markDirty(true);
};

// ==========================================
// 3. BLOG POSTS MANAGER
// ==========================================
function renderBlogManager() {
  const container = document.getElementById('panel-blog');
  if (!container || !state.content) return;

  const blog = state.content.blog || {};
  const posts = blog.posts || [];

  const rowsHtml = posts.map((post, index) => {
    return `
      <tr>
        <td class="post-title-cell">
          <div>${escapeHtml(post.title && post.title.en || 'Untitled')}</div>
          <div style="color:var(--studio-amber); font-size:0.8rem;">${escapeHtml(post.title && post.title.hi || '')}</div>
          <div class="post-slug-sub">/${escapeHtml(post.slug || '')}</div>
        </td>
        <td><span class="category-tag">${escapeHtml(post.category || 'General')}</span></td>
        <td style="color:var(--studio-text-secondary); font-size:0.84rem;">${escapeHtml(post.author || 'Editorial')}</td>
        <td style="color:var(--studio-text-muted); font-size:0.84rem;">${escapeHtml(post.date || '')}</td>
        <td>
          <button type="button" class="btn-studio btn-studio-secondary" style="font-size:0.75rem; padding:0.25rem 0.6rem;" onclick="openEditPostModal(${index})">Edit</button>
          <button type="button" class="icon-btn danger" style="margin-left:0.25rem;" onclick="deletePost(${index})" title="Delete post">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">📝 Blog Articles (${posts.length})</h2>
          <div class="studio-card-desc">Publish essays, festival reflections, youth camp recaps, and announcements.</div>
        </div>
        <button type="button" class="btn-studio btn-studio-primary" onclick="openCreatePostModal()">+ New Blog Post</button>
      </div>

      <div class="blog-table-card">
        <table class="studio-table">
          <thead>
            <tr>
              <th>Title & Hindi Translation</th>
              <th>Category</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--studio-text-muted);">No blog posts found. Click "+ New Blog Post" to publish one.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openCreatePostModal = function() {
  state.editingPostIndex = -1; // New
  const today = new Date().toISOString().split('T')[0];
  showPostEditorModal({
    id: `post-${Date.now()}`,
    slug: '',
    date: today,
    author: state.user ? state.user.name : 'Suresh Thakur',
    category: 'Editorial',
    title: { en: '', hi: '' },
    excerpt: { en: '', hi: '' },
    content: { en: '', hi: '' }
  });
};

window.openEditPostModal = function(index) {
  state.editingPostIndex = index;
  const post = state.content.blog.posts[index];
  showPostEditorModal(post);
};

window.deletePost = function(index) {
  const post = state.content.blog.posts[index];
  const title = (post.title && post.title.en) || (post.title && post.title.hi) || 'this article';
  showConfirmModal(
    'Delete Blog Article',
    `Are you sure you want to delete "${title}"? This post will be permanently removed.`,
    () => {
      state.content.blog.posts.splice(index, 1);
      markDirty(true);
      renderBlogManager();
      showToast('Post deleted.', 'info');
    },
    'Delete Post',
    true
  );
};

function showPostEditorModal(post) {
  const modal = document.getElementById('post-modal');
  if (!modal) return;

  document.getElementById('post-edit-author').value = post.author || '';
  document.getElementById('post-edit-date').value = post.date || '';
  document.getElementById('post-edit-category').value = post.category || 'Editorial';
  document.getElementById('post-edit-slug').value = post.slug || '';

  document.getElementById('post-edit-title-en').value = post.title && post.title.en || '';
  document.getElementById('post-edit-title-hi').value = post.title && post.title.hi || '';

  document.getElementById('post-edit-excerpt-en').value = post.excerpt && post.excerpt.en || '';
  document.getElementById('post-edit-excerpt-hi').value = post.excerpt && post.excerpt.hi || '';

  document.getElementById('post-edit-content-en').value = post.content && post.content.en || '';
  document.getElementById('post-edit-content-hi').value = post.content && post.content.hi || '';

  const coverImg = post.coverImage || post.image || '';
  const imgInput = document.getElementById('post-edit-image');
  if (imgInput) imgInput.value = coverImg;
  updatePostModalThumb(coverImg);

  modal.classList.add('active');

  // Reset editor mode to 'write' and refresh live previews
  if (typeof switchEditorMode === 'function') {
    switchEditorMode('write');
  }
  if (typeof updateLivePreview === 'function') {
    updateLivePreview('en');
    updateLivePreview('hi');
  }
}

window.updatePostModalThumb = function(val) {
  const thumb = document.getElementById('post-modal-thumb');
  if (!thumb) return;
  if (val && val.trim()) {
    thumb.innerHTML = `<img src="${escapeHtml(val.trim())}" alt="Banner" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'media-preview-empty\\'>Invalid URL</span>';">`;
  } else {
    thumb.innerHTML = `<span class="media-preview-empty">No Banner Image</span>`;
  }
};

window.clearPostModalImage = function() {
  const input = document.getElementById('post-edit-image');
  if (input) input.value = '';
  updatePostModalThumb('');
};

window.setPostModalPreset = function(path) {
  const input = document.getElementById('post-edit-image');
  if (input) {
    input.value = path;
    updatePostModalThumb(path);
  }
};

window.handlePostImageUpload = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    const input = document.getElementById('post-edit-image');
    if (input) input.value = dataUrl;
    updatePostModalThumb(dataUrl);
  };
  reader.readAsDataURL(file);
};

window.closePostModal = function() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.remove('active');
  state.editingPostIndex = null;
};

window.savePostFromModal = function() {
  const enTitle = document.getElementById('post-edit-title-en').value.trim();
  const hiTitle = document.getElementById('post-edit-title-hi').value.trim();

  if (!enTitle) {
    alert('Please provide an English title.');
    return;
  }

  let slug = document.getElementById('post-edit-slug').value.trim();
  if (!slug) {
    slug = enTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const coverImg = document.getElementById('post-edit-image') ? document.getElementById('post-edit-image').value.trim() : '';

  const postObj = {
    id: slug,
    slug: slug,
    date: document.getElementById('post-edit-date').value,
    author: document.getElementById('post-edit-author').value.trim(),
    category: document.getElementById('post-edit-category').value.trim(),
    coverImage: coverImg,
    title: { en: enTitle, hi: hiTitle || enTitle },
    excerpt: {
      en: document.getElementById('post-edit-excerpt-en').value.trim(),
      hi: document.getElementById('post-edit-excerpt-hi').value.trim()
    },
    content: {
      en: document.getElementById('post-edit-content-en').value.trim(),
      hi: document.getElementById('post-edit-content-hi').value.trim()
    }
  };

  if (!state.content.blog) state.content.blog = { posts: [] };
  if (!state.content.blog.posts) state.content.blog.posts = [];

  if (state.editingPostIndex === -1 || state.editingPostIndex === null) {
    state.content.blog.posts.unshift(postObj); // prepend
    showToast('New post created.', 'success');
  } else {
    state.content.blog.posts[state.editingPostIndex] = postObj;
    showToast('Post updated.', 'success');
  }

  markDirty(true);
  closePostModal();
  renderBlogManager();
};

// ==========================================
// BLOG RICH FORMATTING & LIVE PREVIEW ENGINE
// ==========================================
function parseMarkdownToHtml(md) {
  if (!md) return '<p style="color:var(--studio-text-muted); font-style:italic;">(No content written yet)</p>';

  let html = escapeHtml(md);

  // Headings H1, H2, H3
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Bullet Lists
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Numbered Lists
  html = html.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<ol') || para.startsWith('<blockquote')) {
      return para;
    }
    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

window.insertFormat = function(lang, type) {
  const textarea = document.getElementById(`post-edit-content-${lang}`);
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let replacement = '';

  switch (type) {
    case 'h1':
      replacement = `\n# ${selectedText || 'Heading 1'}\n`;
      break;
    case 'h2':
      replacement = `\n## ${selectedText || 'Heading 2'}\n`;
      break;
    case 'h3':
      replacement = `\n### ${selectedText || 'Heading 3'}\n`;
      break;
    case 'bold':
      replacement = `**${selectedText || 'bold text'}**`;
      break;
    case 'italic':
      replacement = `*${selectedText || 'italic text'}*`;
      break;
    case 'quote':
      replacement = `\n> ${selectedText || 'Blockquote quote'}\n`;
      break;
    case 'ul':
      replacement = `\n- ${selectedText || 'List item'}\n`;
      break;
    case 'ol':
      replacement = `\n1. ${selectedText || 'Numbered item'}\n`;
      break;
    case 'link':
      replacement = `[${selectedText || 'Link Title'}](https://example.com)`;
      break;
    case 'code':
      replacement = `\`${selectedText || 'code'}\``;
      break;
    default:
      return;
  }

  textarea.focus();
  if (typeof textarea.setRangeText === 'function') {
    textarea.setRangeText(replacement, start, end, 'select');
  } else {
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  }

  updateLivePreview(lang);
  markDirty(true);
};

window.switchEditorMode = function(mode) {
  const writeBtn = document.getElementById('btn-mode-write');
  const prevBtn = document.getElementById('btn-mode-preview');
  const enText = document.getElementById('post-edit-content-en');
  const hiText = document.getElementById('post-edit-content-hi');
  const enPrev = document.getElementById('post-preview-en');
  const hiPrev = document.getElementById('post-preview-hi');
  const enToolbar = document.getElementById('toolbar-en');
  const hiToolbar = document.getElementById('toolbar-hi');

  if (mode === 'preview') {
    if (writeBtn) writeBtn.classList.remove('active');
    if (prevBtn) prevBtn.classList.add('active');

    if (enText) enText.style.display = 'none';
    if (hiText) hiText.style.display = 'none';
    if (enToolbar) enToolbar.style.display = 'none';
    if (hiToolbar) hiToolbar.style.display = 'none';

    if (enPrev) enPrev.style.display = 'block';
    if (hiPrev) hiPrev.style.display = 'block';

    updateLivePreview('en');
    updateLivePreview('hi');
  } else {
    if (writeBtn) writeBtn.classList.add('active');
    if (prevBtn) prevBtn.classList.remove('active');

    if (enText) enText.style.display = 'block';
    if (hiText) hiText.style.display = 'block';
    if (enToolbar) enToolbar.style.display = 'inline-flex';
    if (hiToolbar) hiToolbar.style.display = 'inline-flex';

    if (enPrev) enPrev.style.display = 'none';
    if (hiPrev) hiPrev.style.display = 'none';
  }
};

window.updateLivePreview = function(lang) {
  const textEl = document.getElementById(`post-edit-content-${lang}`);
  const prevEl = document.getElementById(`post-preview-${lang}`);
  if (!textEl || !prevEl) return;
  prevEl.innerHTML = parseMarkdownToHtml(textEl.value);
};

// ==========================================
// CENTRAL MEDIA, CARD BANNER & ICON CONTROLS
// ==========================================
const CREATIVE_PRESETS = [
  { name: 'Hero Art', path: '/src/assets/images/hero-art.svg' },
  { name: 'Jashrang Fest', path: '/src/assets/images/festival-jashrang.svg' },
  { name: 'Kavita Utsav', path: '/src/assets/images/festival-kavita.svg' },
  { name: 'Ullas Camp', path: '/src/assets/images/camp-ullas.svg' },
  { name: 'Play: Vasu', path: '/src/assets/images/play-vasu.svg' },
  { name: 'Play: Vincent', path: '/src/assets/images/play-vincent.svg' },
  { name: 'Play: Gabar', path: '/src/assets/images/play-gabar.svg' },
  { name: 'Play: Raja', path: '/src/assets/images/play-raja.svg' },
  { name: 'Mag: Issue 14', path: '/src/assets/images/mag-issue-14-cover.svg' },
  { name: 'Mag: Issue 13', path: '/src/assets/images/mag-issue-13.svg' },
  { name: 'Stage Crowd', path: '/src/assets/images/fest-stage-crowd.svg' },
  { name: 'Folk Circle', path: '/src/assets/images/fest-folk-circle.svg' },
  { name: 'Kavi Baithak', path: '/src/assets/images/fest-kavi-recital.svg' },
  { name: 'Art Frieze', path: '/src/assets/images/footer-art-frieze.svg' }
];

const EMOJI_PRESETS = ['🎭', '🎪', '📖', '🎨', '⛺', '✨', '📜', '🪔', '👑', '🎬', '👥', '📍', '🎟️', '📝', '⚡', '🏛️'];

const PLAY_ARTWORK_DEFAULT = {
  'kahani-vasu-ki': '/src/assets/images/play-vasu.svg',
  'vincent-a-flashback': '/src/assets/images/play-vincent.svg',
  'gabar-ghichor': '/src/assets/images/play-gabar.svg',
  'raja-ravi-verma': '/src/assets/images/play-raja.svg'
};

function handleImageUploadDirect(event, callback) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > 2.5 * 1024 * 1024) {
    alert('File size exceeds 2.5MB. Please choose a smaller image or SVG.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (typeof callback === 'function') callback(dataUrl);
  };
  reader.readAsDataURL(file);
}
window.handleImageUploadDirect = handleImageUploadDirect;

function renderMediaPickerHtml({ id, label, currentSrc, onChangeFnStr, iconVal, onIconFnStr, presets = CREATIVE_PRESETS }) {
  const callOnChange = typeof onChangeFnStr === 'function' ? onChangeFnStr : (arg) => `${onChangeFnStr}(${arg})`;
  const callOnIcon = typeof onIconFnStr === 'function' ? onIconFnStr : (arg) => `${onIconFnStr}(${arg})`;

  const previewContent = currentSrc && currentSrc.trim()
    ? `<img src="${escapeHtml(currentSrc.trim())}" alt="Preview" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'media-preview-empty\\'>Invalid Image</span>';">`
    : `<span class="media-preview-empty">No Image Set</span>`;

  return `
    <div class="media-field-card" id="media-card-${escapeHtml(id)}">
      <div class="media-field-header">
        <span class="media-field-label">🖼️ ${escapeHtml(label || 'Card Banner / Creative Image')}</span>
        ${currentSrc ? `<button type="button" class="btn-studio btn-studio-secondary" style="font-size:0.72rem; padding:0.15rem 0.5rem; color:var(--studio-red);" onclick="${callOnChange("''")};">Clear Image</button>` : ''}
      </div>

      <div class="media-field-body">
        <div class="media-preview-thumb" id="thumb-${escapeHtml(id)}">
          ${previewContent}
        </div>

        <div class="media-inputs-wrap">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input type="text" class="form-control" style="font-size:0.84rem;" value="${escapeHtml(currentSrc || '')}" placeholder="Image URL, /src/assets/images/... or Data URL" onchange="${callOnChange('this.value')}">
            <label class="btn-studio btn-studio-secondary" style="margin-bottom:0; cursor:pointer; font-size:0.8rem; padding:0.42rem 0.75rem; white-space:nowrap;">
              📁 Upload
              <input type="file" accept="image/*" style="display:none;" onchange="handleImageUploadDirect(event, (data) => { ${callOnChange('data')}; })">
            </label>
          </div>

          <div style="margin-top:0.4rem;">
            <div style="font-size:0.72rem; font-weight:700; color:var(--studio-text-secondary); margin-bottom:0.25rem;">Quick Creative Presets:</div>
            <div class="media-preset-row">
              ${presets.map(p => `
                <button type="button" class="media-preset-btn" onclick="${callOnChange(`'${escapeHtml(p.path)}'`)}">${escapeHtml(p.name)}</button>
              `).join('')}
            </div>
          </div>

          ${iconVal !== undefined && iconVal !== null ? `
            <div style="margin-top:0.75rem; padding-top:0.6rem; border-top:1px dashed var(--studio-border-subtle);">
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div style="font-size:0.75rem; font-weight:700; color:var(--studio-text);">Creative Icon / Badge:</div>
                <input type="text" style="width:50px; text-align:center; font-size:1.05rem; padding:0.2rem;" class="form-control" value="${escapeHtml(iconVal || '🎭')}" onchange="${callOnIcon('this.value')}">
                <div class="emoji-picker-row">
                  ${EMOJI_PRESETS.map(em => `
                    <button type="button" class="emoji-btn" onclick="${callOnIcon(`'${em}'`)}">${em}</button>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Global media setters
window.updateHpHeroBanner = function(val) {
  if (!state.content.homepage) state.content.homepage = {};
  if (!state.content.homepage.hero) state.content.homepage.hero = {};
  state.content.homepage.hero.bannerImage = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Hero creative banner updated.', 'success');
};

window.updateHpHeroBadgeIcon = function(badgeKey, icon) {
  if (!state.content.homepage) state.content.homepage = {};
  if (!state.content.homepage.hero) state.content.homepage.hero = {};
  if (!state.content.homepage.hero[badgeKey]) state.content.homepage.hero[badgeKey] = {};
  state.content.homepage.hero[badgeKey].icon = icon;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Hero badge icon updated.', 'success');
};

window.updateHpVisualHighlightBanner = function(val) {
  if (!state.content.homepage) state.content.homepage = {};
  if (!state.content.homepage.visualHighlight) state.content.homepage.visualHighlight = {};
  state.content.homepage.visualHighlight.image = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Visual highlight banner updated.', 'success');
};

window.updateTraditionIcon = function(index, icon) {
  if (state.content.homepage && state.content.homepage.traditions && state.content.homepage.traditions[index]) {
    state.content.homepage.traditions[index].icon = icon;
    markDirty(true);
    renderCurrentSubPage();
    showToast('Tradition icon updated.', 'success');
  }
};

window.updateTraditionBanner = function(index, val) {
  if (state.content.homepage && state.content.homepage.traditions && state.content.homepage.traditions[index]) {
    state.content.homepage.traditions[index].image = val;
    markDirty(true);
    renderCurrentSubPage();
    showToast('Tradition banner updated.', 'success');
  }
};

window.updateProductionsPageBanner = function(val) {
  state.content.productionsPageBanner = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Productions page header banner updated.', 'success');
};

window.updateProdMedia = function(index, val) {
  if (state.content.productions && state.content.productions[index]) {
    state.content.productions[index].image = val;
    state.content.productions[index].poster = val;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated poster for production #${index + 1}.`, 'success');
  }
};

window.updateProdIcon = function(index, icon) {
  if (state.content.productions && state.content.productions[index]) {
    state.content.productions[index].icon = icon;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated icon for production #${index + 1}.`, 'success');
  }
};

window.updateEventsPageBanner = function(val) {
  state.content.eventsPageBanner = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Events page header banner updated.', 'success');
};

window.updateEventMedia = function(index, val) {
  if (state.content.events && state.content.events[index]) {
    state.content.events[index].bannerImage = val;
    state.content.events[index].image = val;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated creative banner for festival #${index + 1}.`, 'success');
  }
};

window.updateEventIcon = function(index, icon) {
  if (state.content.events && state.content.events[index]) {
    state.content.events[index].icon = icon;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated icon for festival #${index + 1}.`, 'success');
  }
};

window.updateWorkshopsPageBanner = function(val) {
  state.content.workshopsPageBanner = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Workshops page header banner updated.', 'success');
};

window.updateWorkshopMedia = function(index, val) {
  if (state.content.workshops && state.content.workshops[index]) {
    state.content.workshops[index].bannerImage = val;
    state.content.workshops[index].image = val;
  }
  if (state.content.workshops && state.content.workshops.upcomingBatch) {
    state.content.workshops.upcomingBatch.bannerImage = val;
    state.content.workshops.upcomingBatch.image = val;
  }
  markDirty(true);
  renderCurrentSubPage();
  showToast(`Updated banner for workshop #${index + 1}.`, 'success');
};

window.updateWorkshopIcon = function(index, icon) {
  if (state.content.workshops && state.content.workshops[index]) {
    state.content.workshops[index].icon = icon;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated icon for workshop #${index + 1}.`, 'success');
  }
};

window.updateMagazinePageBanner = function(val) {
  state.content.magazinePageBanner = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Magazine page header banner updated.', 'success');
};

window.updateMagazineCurrentCover = function(val) {
  if (!state.content.magazine) state.content.magazine = {};
  if (!state.content.magazine.currentIssue) state.content.magazine.currentIssue = {};
  state.content.magazine.currentIssue.coverImg = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Current issue cover art updated.', 'success');
};

window.updateMagazineArchiveCover = function(index, val) {
  if (state.content.magazine && state.content.magazine.previousIssues && state.content.magazine.previousIssues[index]) {
    state.content.magazine.previousIssues[index].coverImg = val;
    markDirty(true);
    renderCurrentSubPage();
    showToast(`Updated cover for archival issue #${index + 1}.`, 'success');
  }
};

window.updateBrandCrestBanner = function(val) {
  if (!state.content.brand) state.content.brand = {};
  state.content.brand.crestImage = val;
  state.content.brand.bannerImage = val;
  markDirty(true);
  renderCurrentSubPage();
  showToast('Brand crest / banner updated.', 'success');
};

window.updateAboutBanner = function(val) {
  if (!state.content.about) state.content.about = {};
  state.content.about.bannerImage = val;
  markDirty(true);
  renderTeamAndAbout();
  showToast('About page banner updated.', 'success');
};

window.updateAboutCulturalArt = function(val) {
  if (!state.content.about) state.content.about = {};
  state.content.about.culturalArt = val;
  markDirty(true);
  renderTeamAndAbout();
  showToast('Cultural roots artwork updated.', 'success');
};

// ==========================================
// 4. ALL PAGES CONTENT MANAGER (Homepage & All Subpages)
// ==========================================
function renderPagesManager() {
  const container = document.getElementById('panel-pages');
  if (!container || !state.content) return;

  const currentSub = state.activeSubPage || 'homepage';

  container.innerHTML = `
    <!-- Sub-page Navigation Tabs -->
    <div class="pages-subnav-bar">
      <button type="button" class="pages-subnav-btn ${currentSub === 'homepage' ? 'active' : ''}" onclick="switchSubPage('homepage')">
        🏠 Homepage
      </button>
      <button type="button" class="pages-subnav-btn ${currentSub === 'productions' ? 'active' : ''}" onclick="switchSubPage('productions')">
        🎭 Productions (${(state.content.productions || []).length})
      </button>
      <button type="button" class="pages-subnav-btn ${currentSub === 'events' ? 'active' : ''}" onclick="switchSubPage('events')">
        🎪 Events & Festivals
      </button>
      <button type="button" class="pages-subnav-btn ${currentSub === 'workshops' ? 'active' : ''}" onclick="switchSubPage('workshops')">
        ⛺ Workshops & Camps
      </button>
      <button type="button" class="pages-subnav-btn ${currentSub === 'magazine' ? 'active' : ''}" onclick="switchSubPage('magazine')">
        📖 Magazine
      </button>
      <button type="button" class="pages-subnav-btn ${currentSub === 'brand' ? 'active' : ''}" onclick="switchSubPage('brand')">
        📞 Brand & Contacts
      </button>
    </div>

    <!-- Active Subpage Content Host -->
    <div id="subpage-content-host"></div>
  `;

  renderCurrentSubPage();
}

window.switchSubPage = function(subId) {
  state.activeSubPage = subId;
  document.querySelectorAll('.pages-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(subId));
  });
  renderCurrentSubPage();
};

function renderCurrentSubPage() {
  const host = document.getElementById('subpage-content-host');
  if (!host || !state.content) return;

  switch (state.activeSubPage) {
    case 'homepage':
      renderHomepageEditor(host);
      break;
    case 'productions':
      renderProductionsPageEditor(host);
      break;
    case 'events':
      renderEventsPageEditor(host);
      break;
    case 'workshops':
      renderWorkshopsPageEditor(host);
      break;
    case 'magazine':
      renderMagazinePageEditor(host);
      break;
    case 'brand':
      renderBrandPageEditor(host);
      break;
    default:
      renderHomepageEditor(host);
      break;
  }
}

// ----------------------------------------------------
// 4.1 HOMEPAGE COMPLETE VISUAL CONTENT EDITOR
// ----------------------------------------------------
function renderHomepageEditor(host) {
  if (!state.content.homepage) state.content.homepage = {};
  const hp = state.content.homepage;
  const hero = hp.hero || {};
  const featuredTiles = hp.featuredTiles || [];
  const impactStats = hp.impactStats || [];
  const traditions = hp.traditions || [];
  const criticsPraise = hp.criticsPraise || [];
  const vh = hp.visualHighlight || {};

  host.innerHTML = `
    <!-- 1. Hero & Rebus Section -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">👑 Homepage Hero & Rebus Lockup</div>
          <div class="section-group-desc">Edit the top billboard eyebrow, iconic Rebus words ("Think Art Think Chhattisgadhiya Cloud"), and statement.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'hp-hero-banner',
        label: 'Hero Billboard Art / Creative Canvas',
        hint: 'High-resolution SVG artwork or uploaded image shown in the circular hero art frame on the homepage.',
        currentSrc: hero.bannerImage || '/src/assets/images/hero-art.svg',
        onChangeFnStr: 'updateHpHeroBanner'
      })}

      <div class="bilingual-tabs-wrap" style="margin-top:1.25rem;">
        <div class="bilingual-header"><span class="bilingual-title">Hero Eyebrow Tagline</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <input type="text" class="form-control" value="${escapeHtml(hero.eyebrow && hero.eyebrow.en || '')}" onchange="updateHpField('hero.eyebrow.en', this.value)">
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <input type="text" class="form-control" value="${escapeHtml(hero.eyebrow && hero.eyebrow.hi || '')}" onchange="updateHpField('hero.eyebrow.hi', this.value)">
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
        <div class="form-group">
          <label class="form-label">Rebus Line 1 (Word 1 - English)</label>
          <input type="text" class="form-control" value="${escapeHtml(hero.rebusWord1 && hero.rebusWord1.en || 'Think')}" onchange="updateHpField('hero.rebusWord1.en', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Rebus Line 1 (Word 1 - हिन्दी)</label>
          <input type="text" class="form-control" value="${escapeHtml(hero.rebusWord1 && hero.rebusWord1.hi || 'थिंक')}" onchange="updateHpField('hero.rebusWord1.hi', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Art Mark Text (English)</label>
          <input type="text" class="form-control" value="${escapeHtml(hero.rebusMark && hero.rebusMark.en || 'Art')}" onchange="updateHpField('hero.rebusMark.en', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">कला चिह्न पाठ (हिन्दी)</label>
          <input type="text" class="form-control" value="${escapeHtml(hero.rebusMark && hero.rebusMark.hi || 'कला')}" onchange="updateHpField('hero.rebusMark.hi', this.value)">
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Rebus Line 2 (Brand Phrase)</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <input type="text" class="form-control" value="${escapeHtml(hero.rebusWord2 && hero.rebusWord2.en || 'Think Chhattisgadhiya Cloud')}" onchange="updateHpField('hero.rebusWord2.en', this.value)">
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <input type="text" class="form-control" value="${escapeHtml(hero.rebusWord2 && hero.rebusWord2.hi || 'थिंक छत्तीसगढ़िया क्लाउड')}" onchange="updateHpField('hero.rebusWord2.hi', this.value)">
          </div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Hero Mission Statement</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <textarea class="form-control" onchange="updateHpField('hero.statement.en', this.value)">${escapeHtml(hero.statement && hero.statement.en || '')}</textarea>
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <textarea class="form-control" onchange="updateHpField('hero.statement.hi', this.value)">${escapeHtml(hero.statement && hero.statement.hi || '')}</textarea>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-top:1rem;">
        <div class="tile-editor-box">
          <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.5rem;">Primary CTA Button</div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Text (EN)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.primaryCta && hero.primaryCta.text && hero.primaryCta.text.en || '')}" onchange="updateHpField('hero.primaryCta.text.en', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Text (HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.primaryCta && hero.primaryCta.text && hero.primaryCta.text.hi || '')}" onchange="updateHpField('hero.primaryCta.text.hi', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Link URL</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.primaryCta && hero.primaryCta.link || '/whats-on/')}" onchange="updateHpField('hero.primaryCta.link', this.value)">
          </div>
        </div>

        <div class="tile-editor-box">
          <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.5rem;">Secondary CTA Button</div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Text (EN)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.secondaryCta && hero.secondaryCta.text && hero.secondaryCta.text.en || '')}" onchange="updateHpField('hero.secondaryCta.text.en', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Text (HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.secondaryCta && hero.secondaryCta.text && hero.secondaryCta.text.hi || '')}" onchange="updateHpField('hero.secondaryCta.text.hi', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Link URL</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.secondaryCta && hero.secondaryCta.link || '/magazine/')}" onchange="updateHpField('hero.secondaryCta.link', this.value)">
          </div>
        </div>

        <div class="tile-editor-box">
          <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.5rem;">Top Floating Badge</div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem; margin:0;">Icon:</label>
            <input type="text" class="form-control" style="width:45px; text-align:center; font-size:1.1rem; padding:0.2rem;" value="${escapeHtml(hero.badgeTop && hero.badgeTop.icon || '🎭')}" onchange="updateHpHeroBadgeIcon('badgeTop', this.value)">
            <div class="emoji-picker-row">
              ${EMOJI_PRESETS.slice(0, 5).map(em => `<button type="button" class="emoji-btn" onclick="updateHpHeroBadgeIcon('badgeTop', '${em}')">${em}</button>`).join('')}
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Title (EN / HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.badgeTop && hero.badgeTop.title && hero.badgeTop.title.en || '')}" onchange="updateHpField('hero.badgeTop.title.en', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Sub (EN / HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.badgeTop && hero.badgeTop.sub && hero.badgeTop.sub.en || '')}" onchange="updateHpField('hero.badgeTop.sub.en', this.value)">
          </div>
        </div>

        <div class="tile-editor-box">
          <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.5rem;">Bottom Floating Badge</div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem; margin:0;">Icon:</label>
            <input type="text" class="form-control" style="width:45px; text-align:center; font-size:1.1rem; padding:0.2rem;" value="${escapeHtml(hero.badgeBottom && hero.badgeBottom.icon || '🏛️')}" onchange="updateHpHeroBadgeIcon('badgeBottom', this.value)">
            <div class="emoji-picker-row">
              ${EMOJI_PRESETS.slice(0, 5).map(em => `<button type="button" class="emoji-btn" onclick="updateHpHeroBadgeIcon('badgeBottom', '${em}')">${em}</button>`).join('')}
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label class="form-label" style="font-size:0.75rem;">Title (EN / HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.badgeBottom && hero.badgeBottom.title && hero.badgeBottom.title.en || '')}" onchange="updateHpField('hero.badgeBottom.title.en', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Sub (EN / HI)</label>
            <input type="text" class="form-control" value="${escapeHtml(hero.badgeBottom && hero.badgeBottom.sub && hero.badgeBottom.sub.en || '')}" onchange="updateHpField('hero.badgeBottom.sub.en', this.value)">
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Featured 4 Cards Grid Section -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🗂️ 4 Featured Highlight Tiles</div>
          <div class="section-group-desc">The 4 primary entry cards shown below the hero (Stage Productions, National Festivals, Ullas Camp, Monthly Magazine).</div>
        </div>
      </div>

      <div class="tiles-editor-grid">
        ${featuredTiles.map((tile, i) => `
          <div class="tile-editor-box">
            <span class="tile-editor-badge">Tile #${i + 1}: ${escapeHtml(tile.id || tile.theme || '')}</span>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Pill Tag (EN / HI)</label>
              <input type="text" class="form-control" value="${escapeHtml(tile.tag && tile.tag.en || '')}" onchange="updateTileField(${i}, 'tag', 'en', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Title (EN)</label>
              <input type="text" class="form-control" value="${escapeHtml(tile.title && tile.title.en || '')}" onchange="updateTileField(${i}, 'title', 'en', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Title (HI)</label>
              <input type="text" class="form-control" value="${escapeHtml(tile.title && tile.title.hi || '')}" onchange="updateTileField(${i}, 'title', 'hi', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Description (EN)</label>
              <textarea class="form-control" style="font-size:0.8rem; min-height:60px;" onchange="updateTileField(${i}, 'desc', 'en', this.value)">${escapeHtml(tile.desc && tile.desc.en || '')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Description (HI)</label>
              <textarea class="form-control" style="font-size:0.8rem; min-height:60px;" onchange="updateTileField(${i}, 'desc', 'hi', this.value)">${escapeHtml(tile.desc && tile.desc.hi || '')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.75rem;">Target Href</label>
              <input type="text" class="form-control" value="${escapeHtml(tile.href || '')}" onchange="updateTileRawField(${i}, 'href', this.value)">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. Impact Statistics Strip -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">📊 4 Impact Counters Strip</div>
          <div class="section-group-desc">Key institutional metrics shown across the counter strip on the homepage.</div>
        </div>
      </div>

      <div class="stats-editor-grid">
        ${impactStats.map((stat, i) => `
          <div class="stat-editor-card">
            <div style="font-weight:800; font-size:0.82rem; color:var(--studio-primary); margin-bottom:0.5rem;">Stat #${i + 1}</div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Number / Metric</label>
              <input type="text" class="form-control" style="font-weight:800; font-size:1.1rem;" value="${escapeHtml(stat.number || '')}" onchange="updateStatField(${i}, 'number', null, this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Label (EN)</label>
              <input type="text" class="form-control" value="${escapeHtml(stat.label && stat.label.en || '')}" onchange="updateStatField(${i}, 'label', 'en', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Label (HI)</label>
              <input type="text" class="form-control" value="${escapeHtml(stat.label && stat.label.hi || '')}" onchange="updateStatField(${i}, 'label', 'hi', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.75rem;">Subtitle Note (EN)</label>
              <input type="text" class="form-control" value="${escapeHtml(stat.sub && stat.sub.en || '')}" onchange="updateStatField(${i}, 'sub', 'en', this.value)">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 4. Living Traditions Triad -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🎭 Living Heritage Triad (3 Pillars)</div>
          <div class="section-group-desc">The 3 aesthetic traditions (Nacha & Gammat, Panthi & Karma, Dhokra & Scenography).</div>
        </div>
      </div>

      <div class="traditions-editor-grid">
        ${traditions.map((trad, i) => `
          <div class="tradition-editor-card">
            <div style="font-weight:800; font-size:0.95rem; margin-bottom:0.75rem; color:var(--studio-primary);">Pillar #${i + 1}</div>

            ${renderMediaPickerHtml({
              id: `trad-banner-${i}`,
              label: `Tradition Card Artwork Banner`,
              hint: 'Visual illustration or photograph for this folk tradition card.',
              currentSrc: trad.image || (i === 0 ? '/src/assets/images/play-vasu.svg' : (i === 1 ? '/src/assets/images/fest-stage-crowd.svg' : '/src/assets/images/play-gabar.svg')),
              onChangeFnStr: (v) => `updateTraditionBanner(${i}, ${v})`,
              iconVal: trad.icon || '🎭',
              onIconFnStr: (ic) => `updateTraditionIcon(${i}, ${ic})`
            })}

            <div class="form-group" style="margin-top:0.75rem; margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Title (EN)</label>
              <input type="text" class="form-control" value="${escapeHtml(trad.title && trad.title.en || '')}" onchange="updateTraditionField(${i}, 'title', 'en', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Title (HI)</label>
              <input type="text" class="form-control" value="${escapeHtml(trad.title && trad.title.hi || '')}" onchange="updateTraditionField(${i}, 'title', 'hi', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Subtitle (EN)</label>
              <input type="text" class="form-control" value="${escapeHtml(trad.subtitle && trad.subtitle.en || '')}" onchange="updateTraditionField(${i}, 'subtitle', 'en', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.75rem;">Description (EN)</label>
              <textarea class="form-control" style="font-size:0.8rem; min-height:70px;" onchange="updateTraditionField(${i}, 'desc', 'en', this.value)">${escapeHtml(trad.desc && trad.desc.en || '')}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 5. Critics Reviews & Press Praise -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">💬 Critics Praise & Press Quotes (3 Reviews)</div>
          <div class="section-group-desc">Reviews from national theatre festivals and cultural chronicles.</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
        ${criticsPraise.map((critic, i) => `
          <div class="tile-editor-box">
            <div style="font-weight:800; font-size:0.85rem; color:var(--studio-amber); margin-bottom:0.5rem;">Review #${i + 1}</div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Quote Text</label>
              <textarea class="form-control" style="font-size:0.8rem; min-height:75px;" onchange="updateCriticField(${i}, 'quote', this.value)">${escapeHtml(critic.quote || '')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label" style="font-size:0.75rem;">Publication / Journal</label>
              <input type="text" class="form-control" value="${escapeHtml(critic.publication || '')}" onchange="updateCriticField(${i}, 'publication', this.value)">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.75rem;">Context / Play Tag</label>
              <input type="text" class="form-control" value="${escapeHtml(critic.tag || '')}" onchange="updateCriticField(${i}, 'tag', this.value)">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 6. Visual Highlight Band -->
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🌟 Homepage Visual Highlight Band</div>
          <div class="section-group-desc">The callout banner placed right above the footer ("Living Theatre from Central India").</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'hp-vh-banner',
        label: 'Visual Highlight Band Creative Banner',
        hint: 'Featured artwork or photograph displayed across the full-width highlight banner.',
        currentSrc: vh.image || '/src/assets/images/fest-stage-crowd.svg',
        onChangeFnStr: 'updateHpVisualHighlightBanner'
      })}

      <div class="bilingual-tabs-wrap" style="margin-top:1.25rem;">
        <div class="bilingual-header"><span class="bilingual-title">Banner Headline</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <input type="text" class="form-control" value="${escapeHtml(vh.title && vh.title.en || '')}" onchange="updateHpField('visualHighlight.title.en', this.value)">
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <input type="text" class="form-control" value="${escapeHtml(vh.title && vh.title.hi || '')}" onchange="updateHpField('visualHighlight.title.hi', this.value)">
          </div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Banner Description</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <textarea class="form-control" onchange="updateHpField('visualHighlight.desc.en', this.value)">${escapeHtml(vh.desc && vh.desc.en || '')}</textarea>
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <textarea class="form-control" onchange="updateHpField('visualHighlight.desc.hi', this.value)">${escapeHtml(vh.desc && vh.desc.hi || '')}</textarea>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1rem;">
        <div class="form-group">
          <label class="form-label">Button Text (EN)</label>
          <input type="text" class="form-control" value="${escapeHtml(vh.btnText && vh.btnText.en || '')}" onchange="updateHpField('visualHighlight.btnText.en', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Button Text (HI)</label>
          <input type="text" class="form-control" value="${escapeHtml(vh.btnText && vh.btnText.hi || '')}" onchange="updateHpField('visualHighlight.btnText.hi', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Button Destination URL</label>
          <input type="text" class="form-control" value="${escapeHtml(vh.btnHref || '/about/')}" onchange="updateHpField('visualHighlight.btnHref', this.value)">
        </div>
      </div>
    </div>
  `;
}

// Deep field helper for homepage object
window.updateHpField = function(path, value) {
  if (!state.content.homepage) state.content.homepage = {};
  const parts = path.split('.');
  let curr = state.content.homepage;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {};
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = value;
  markDirty(true);
};

window.updateTileField = function(index, field, lang, value) {
  const tile = state.content.homepage.featuredTiles[index];
  if (!tile[field]) tile[field] = {};
  tile[field][lang] = value;
  markDirty(true);
};

window.updateTileRawField = function(index, field, value) {
  state.content.homepage.featuredTiles[index][field] = value;
  markDirty(true);
};

window.updateStatField = function(index, field, lang, value) {
  const stat = state.content.homepage.impactStats[index];
  if (lang) {
    if (!stat[field]) stat[field] = {};
    stat[field][lang] = value;
  } else {
    stat[field] = value;
  }
  markDirty(true);
};

window.updateTraditionField = function(index, field, lang, value) {
  const trad = state.content.homepage.traditions[index];
  if (!trad[field]) trad[field] = {};
  trad[field][lang] = value;
  markDirty(true);
};

window.updateTraditionRawField = function(index, field, value) {
  state.content.homepage.traditions[index][field] = value;
  markDirty(true);
};

window.updateCriticField = function(index, field, value) {
  state.content.homepage.criticsPraise[index][field] = value;
  markDirty(true);
};

// ----------------------------------------------------
// 4.2 PRODUCTIONS PAGE VISUAL CONTENT EDITOR
// ----------------------------------------------------
function renderProductionsPageEditor(host) {
  const prods = state.content.productions || [];

  host.innerHTML = `
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🎭 Repertoire Productions (${prods.length})</div>
          <div class="section-group-desc">Manage touring plays, genres, directors, cast rosters, and bilingual synopses.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'productions-page-banner',
        label: 'Productions Page Header Creative Banner',
        hint: 'Billboard creative banner displayed at the top of the Productions catalogue.',
        currentSrc: state.content.productionsPageBanner || '/src/assets/images/hero-art.svg',
        onChangeFnStr: 'updateProductionsPageBanner'
      })}

      <div style="display:flex; flex-direction:column; gap:1.5rem; margin-top:1.5rem;">
        ${prods.map((p, i) => `
          <div class="tile-editor-box" style="background:#ffffff; border:1px solid var(--studio-border);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
              <span class="tile-editor-badge" style="margin-bottom:0;">Production #${i + 1}: ${escapeHtml(p.id)}</span>
              <span style="font-size:0.8rem; font-weight:700; color:var(--studio-text-secondary);">${escapeHtml(p.year || '')} &bull; ${escapeHtml(p.duration || '')}</span>
            </div>

            ${renderMediaPickerHtml({
              id: `prod-media-${i}`,
              label: `Play Poster & Card Creative Banner (${escapeHtml(p.id)})`,
              hint: 'Theatrical poster art, play card creative banner, and genre icon for this touring show.',
              currentSrc: p.image || p.poster || (PLAY_ARTWORK_DEFAULT && PLAY_ARTWORK_DEFAULT[p.id]) || '/src/assets/images/hero-art.svg',
              onChangeFnStr: (v) => `updateProdMedia(${i}, ${v})`,
              iconVal: p.icon || '🎭',
              onIconFnStr: (ic) => `updateProdIcon(${i}, ${ic})`
            })}

            <div class="bilingual-tabs-wrap" style="margin-top:1rem;">
              <div class="bilingual-header"><span class="bilingual-title">Production Title</span></div>
              <div class="bilingual-grid">
                <div>
                  <span class="bilingual-col-tag bilingual-tag-en">English</span>
                  <input type="text" class="form-control" value="${escapeHtml(p.title && p.title.en || '')}" onchange="updateProdBilingualField(${i}, 'title', 'en', this.value)">
                </div>
                <div>
                  <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
                  <input type="text" class="form-control" value="${escapeHtml(p.title && p.title.hi || '')}" onchange="updateProdBilingualField(${i}, 'title', 'hi', this.value)">
                </div>
              </div>
            </div>

            <div class="bilingual-tabs-wrap">
              <div class="bilingual-header"><span class="bilingual-title">Genre & Subtitle</span></div>
              <div class="bilingual-grid">
                <div>
                  <span class="bilingual-col-tag bilingual-tag-en">English</span>
                  <input type="text" class="form-control" value="${escapeHtml(p.genre && p.genre.en || '')}" onchange="updateProdBilingualField(${i}, 'genre', 'en', this.value)">
                </div>
                <div>
                  <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
                  <input type="text" class="form-control" value="${escapeHtml(p.genre && p.genre.hi || '')}" onchange="updateProdBilingualField(${i}, 'genre', 'hi', this.value)">
                </div>
              </div>
            </div>

            <div class="bilingual-tabs-wrap">
              <div class="bilingual-header"><span class="bilingual-title">Full Play Synopsis</span></div>
              <div class="bilingual-grid">
                <div>
                  <span class="bilingual-col-tag bilingual-tag-en">English</span>
                  <textarea class="form-control" style="min-height:75px;" onchange="updateProdBilingualField(${i}, 'synopsis', 'en', this.value)">${escapeHtml(p.synopsis && p.synopsis.en || '')}</textarea>
                </div>
                <div>
                  <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
                  <textarea class="form-control" style="min-height:75px;" onchange="updateProdBilingualField(${i}, 'synopsis', 'hi', this.value)">${escapeHtml(p.synopsis && p.synopsis.hi || '')}</textarea>
                </div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:0.75rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.75rem;">Director Name</label>
                <input type="text" class="form-control" value="${escapeHtml(p.director || '')}" onchange="updateProdRawField(${i}, 'director', this.value)">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.75rem;">Cast Ensemble (Comma-separated)</label>
                <input type="text" class="form-control" value="${escapeHtml((p.cast || []).join(', '))}" onchange="updateProdCast(${i}, this.value)">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.updateProdBilingualField = function(i, field, lang, val) {
  if (!state.content.productions[i][field]) state.content.productions[i][field] = {};
  state.content.productions[i][field][lang] = val;
  markDirty(true);
};

window.updateProdRawField = function(i, field, val) {
  state.content.productions[i][field] = val;
  markDirty(true);
};

window.updateProdCast = function(i, val) {
  state.content.productions[i].cast = val.split(',').map(s => s.trim()).filter(Boolean);
  markDirty(true);
};

// ----------------------------------------------------
// 4.3 EVENTS, WORKSHOPS, MAGAZINE, BRAND SUB-EDITORS
// ----------------------------------------------------
function renderEventsPageEditor(host) {
  const events = state.content.events || [];
  host.innerHTML = `
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🎪 Events & National Festivals (${events.length})</div>
          <div class="section-group-desc">Jashrang National Theatre Festival & Jaspur Kavita Utsav archives.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'events-page-banner',
        label: 'Events & Festivals Page Header Creative Banner',
        hint: 'Header billboard creative banner for national festivals and poetry summits.',
        currentSrc: state.content.eventsPageBanner || '/src/assets/images/festival-jashrang.svg',
        onChangeFnStr: 'updateEventsPageBanner'
      })}

      <div style="display:flex; flex-direction:column; gap:1.25rem; margin-top:1.5rem;">
        ${events.map((ev, i) => `
          <div class="tile-editor-box">
            <span class="tile-editor-badge">Festival #${i + 1}: ${escapeHtml(ev.id)}</span>

            ${renderMediaPickerHtml({
              id: `event-media-${i}`,
              label: `Festival Spotlight Banner & Art (${escapeHtml(ev.id)})`,
              hint: 'Festival card creative banner and stage artwork.',
              currentSrc: ev.bannerImage || ev.image || (i === 0 ? '/src/assets/images/festival-jashrang.svg' : '/src/assets/images/festival-kavita.svg'),
              onChangeFnStr: (v) => `updateEventMedia(${i}, ${v})`,
              iconVal: ev.icon || (i === 0 ? '🎪' : '📜'),
              onIconFnStr: (ic) => `updateEventIcon(${i}, ${ic})`
            })}

            <div class="bilingual-tabs-wrap" style="margin-top:1rem;">
              <div class="bilingual-header"><span class="bilingual-title">Festival Name</span></div>
              <div class="bilingual-grid">
                <div><span class="bilingual-col-tag bilingual-tag-en">English</span><input type="text" class="form-control" value="${escapeHtml(ev.name && ev.name.en || '')}" onchange="state.content.events[${i}].name.en = this.value; markDirty(true);"></div>
                <div><span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span><input type="text" class="form-control" value="${escapeHtml(ev.name && ev.name.hi || '')}" onchange="state.content.events[${i}].name.hi = this.value; markDirty(true);"></div>
              </div>
            </div>
            <div class="bilingual-tabs-wrap">
              <div class="bilingual-header"><span class="bilingual-title">Description</span></div>
              <div class="bilingual-grid">
                <div><span class="bilingual-col-tag bilingual-tag-en">English</span><textarea class="form-control" onchange="state.content.events[${i}].description.en = this.value; markDirty(true);">${escapeHtml(ev.description && ev.description.en || '')}</textarea></div>
                <div><span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span><textarea class="form-control" onchange="state.content.events[${i}].description.hi = this.value; markDirty(true);">${escapeHtml(ev.description && ev.description.hi || '')}</textarea></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWorkshopsPageEditor(host) {
  const camps = state.content.workshops || [];
  host.innerHTML = `
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">⛺ Workshops & Youth Residencies (${camps.length})</div>
          <div class="section-group-desc">Ullas Summer Camp and theatre arts training modules.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'workshops-page-banner',
        label: 'Workshops & Residencies Header Creative Banner',
        hint: 'Header billboard creative banner for Ullas youth camp and training modules.',
        currentSrc: state.content.workshopsPageBanner || '/src/assets/images/camp-ullas.svg',
        onChangeFnStr: 'updateWorkshopsPageBanner'
      })}

      <div style="display:flex; flex-direction:column; gap:1.25rem; margin-top:1.5rem;">
        ${camps.map((w, i) => `
          <div class="tile-editor-box">
            <span class="tile-editor-badge">Residency #${i + 1}: ${escapeHtml(w.id)}</span>

            ${renderMediaPickerHtml({
              id: `workshop-media-${i}`,
              label: `Residency Spotlight Banner & Art (${escapeHtml(w.id)})`,
              hint: 'Creative banner and workshop activity artwork.',
              currentSrc: w.bannerImage || w.image || '/src/assets/images/camp-ullas.svg',
              onChangeFnStr: (v) => `updateWorkshopMedia(${i}, ${v})`,
              iconVal: w.icon || '⛺',
              onIconFnStr: (ic) => `updateWorkshopIcon(${i}, ${ic})`
            })}

            <div class="bilingual-tabs-wrap" style="margin-top:1rem;">
              <div class="bilingual-header"><span class="bilingual-title">Title</span></div>
              <div class="bilingual-grid">
                <div><span class="bilingual-col-tag bilingual-tag-en">English</span><input type="text" class="form-control" value="${escapeHtml(w.title && w.title.en || '')}" onchange="state.content.workshops[${i}].title.en = this.value; markDirty(true);"></div>
                <div><span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span><input type="text" class="form-control" value="${escapeHtml(w.title && w.title.hi || '')}" onchange="state.content.workshops[${i}].title.hi = this.value; markDirty(true);"></div>
              </div>
            </div>
            <div class="bilingual-tabs-wrap">
              <div class="bilingual-header"><span class="bilingual-title">Overview</span></div>
              <div class="bilingual-grid">
                <div><span class="bilingual-col-tag bilingual-tag-en">English</span><textarea class="form-control" onchange="state.content.workshops[${i}].description.en = this.value; markDirty(true);">${escapeHtml(w.description && w.description.en || '')}</textarea></div>
                <div><span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span><textarea class="form-control" onchange="state.content.workshops[${i}].description.hi = this.value; markDirty(true);">${escapeHtml(w.description && w.description.hi || '')}</textarea></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMagazinePageEditor(host) {
  const mag = state.content.magazine || {};
  const current = mag.currentIssue || {};
  const previousIssues = mag.previousIssues || [];

  host.innerHTML = `
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">📖 Monthly Magazine: Current Issue (Issue 14)</div>
          <div class="section-group-desc">Critical cultural essays, in-browser reader contents, and release metadata.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'mag-page-banner',
        label: 'Magazine Page Header Creative Banner',
        hint: 'Header billboard creative banner for monthly cultural journal.',
        currentSrc: state.content.magazinePageBanner || '/src/assets/images/mag-issue-14-cover.svg',
        onChangeFnStr: 'updateMagazinePageBanner'
      })}

      <div style="margin-top:1.25rem;">
        ${renderMediaPickerHtml({
          id: 'mag-current-cover',
          label: 'Current Issue Front Cover Artwork (Issue 14)',
          hint: 'Front cover graphic or illustration for the latest issue.',
          currentSrc: current.coverImg || '/src/assets/images/mag-issue-14-cover.svg',
          onChangeFnStr: 'updateMagazineCurrentCover'
        })}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1.25rem; margin-bottom:1rem;">
        <div class="form-group">
          <label class="form-label">Issue Number</label>
          <input type="number" class="form-control" value="${escapeHtml(current.issueNumber || 14)}" onchange="state.content.magazine.currentIssue.issueNumber = parseInt(this.value); markDirty(true);">
        </div>
        <div class="form-group">
          <label class="form-label">Publication Month / Date</label>
          <input type="text" class="form-control" value="${escapeHtml(current.publishDate || '')}" onchange="state.content.magazine.currentIssue.publishDate = this.value; markDirty(true);">
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Current Issue Title / Theme</span></div>
        <div class="bilingual-grid">
          <div><span class="bilingual-col-tag bilingual-tag-en">English</span><input type="text" class="form-control" value="${escapeHtml(current.title && current.title.en || '')}" onchange="state.content.magazine.currentIssue.title.en = this.value; markDirty(true);"></div>
          <div><span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span><input type="text" class="form-control" value="${escapeHtml(current.title && current.title.hi || '')}" onchange="state.content.magazine.currentIssue.title.hi = this.value; markDirty(true);"></div>
        </div>
      </div>
    </div>

    ${previousIssues.length > 0 ? `
      <div class="section-group-card" style="margin-top:1.5rem;">
        <div class="section-group-header">
          <div>
            <div class="section-group-title">📚 Archival Previous Issues (${previousIssues.length})</div>
            <div class="section-group-desc">Cover images and issue metadata for previously published editions.</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          ${previousIssues.map((issue, idx) => `
            <div class="tile-editor-box">
              <span class="tile-editor-badge">Archive Issue #${issue.issueNumber || (idx + 1)}</span>
              ${renderMediaPickerHtml({
                id: `mag-archive-cover-${idx}`,
                label: `Issue #${issue.issueNumber || (idx + 1)} Cover Graphic`,
                hint: 'Cover art for archival issue.',
                currentSrc: issue.coverImg || '/src/assets/images/mag-issue-13.svg',
                onChangeFnStr: (v) => `updateMagazineArchiveCover(${idx}, ${v})`
              })}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function renderBrandPageEditor(host) {
  const contact = state.content.contact || {};
  const orgName = state.content.orgName || {};
  const tagline = state.content.tagline || {};

  host.innerHTML = `
    <div class="section-group-card">
      <div class="section-group-header">
        <div>
          <div class="section-group-title">🌐 Brand & Organization Profile</div>
          <div class="section-group-desc">Core institutional names, Rebus slogan, official emails, and phones.</div>
        </div>
      </div>

      ${renderMediaPickerHtml({
        id: 'brand-crest-banner',
        label: 'Brand Crest / Mascot Billboard Graphic',
        hint: 'Official crest, emblem, or billboard graphic for Chhattisgadhiya Cloud.',
        currentSrc: (state.content.brand && (state.content.brand.crestImage || state.content.brand.bannerImage)) || '/src/assets/images/hero-art.svg',
        onChangeFnStr: 'updateBrandCrestBanner'
      })}

      <div class="bilingual-tabs-wrap" style="margin-top:1.25rem;">
        <div class="bilingual-header"><span class="bilingual-title">Organization Name</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <input type="text" class="form-control" value="${escapeHtml(orgName.en || '')}" onchange="state.content.orgName.en = this.value; markDirty(true);">
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <input type="text" class="form-control" value="${escapeHtml(orgName.hi || '')}" onchange="state.content.orgName.hi = this.value; markDirty(true);">
          </div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Global Motto / Tagline</span></div>
        <div class="bilingual-grid">
          <div>
            <span class="bilingual-col-tag bilingual-tag-en">English</span>
            <input type="text" class="form-control" value="${escapeHtml(tagline.en || '')}" onchange="state.content.tagline.en = this.value; markDirty(true);">
          </div>
          <div>
            <span class="bilingual-col-tag bilingual-tag-hi">हिन्दी</span>
            <input type="text" class="form-control" value="${escapeHtml(tagline.hi || '')}" onchange="state.content.tagline.hi = this.value; markDirty(true);">
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-top:1rem;">
        <div class="form-group">
          <label class="form-label">General Contact Email</label>
          <input type="email" class="form-control" value="${escapeHtml(contact.email || '')}" onchange="state.content.contact.email = this.value; markDirty(true);">
        </div>
        <div class="form-group">
          <label class="form-label">Stage Bookings Email</label>
          <input type="email" class="form-control" value="${escapeHtml(contact.bookingEmail || '')}" onchange="state.content.contact.bookingEmail = this.value; markDirty(true);">
        </div>
        <div class="form-group">
          <label class="form-label">Official Phone Helpline</label>
          <input type="text" class="form-control" value="${escapeHtml(contact.phone || '')}" onchange="state.content.contact.phone = this.value; markDirty(true);">
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. USERS & ACCESS MANAGEMENT (Proper Admin Credentials & Security)
// ==========================================
// ==========================================
// 5. USERS & ACCESS MANAGEMENT (Proper Admin Credentials & RBAC)
// ==========================================
function renderUsersManager() {
  const container = document.getElementById('panel-users');
  if (!container || !state.content) return;

  const currentAdmin = state.adminSession || { username: 'admin', displayName: 'Super Administrator', role: 'admin' };
  const adminUsers = (state.content.adminAuth && state.content.adminAuth.users) || [
    { username: 'admin', displayName: 'Super Administrator', role: 'admin', permissions: ["dashboard", "pages", "team", "blog", "users", "settings"], passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' }
  ];

  const allSections = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pages', label: 'Page Content' },
    { id: 'team', label: 'About & Team' },
    { id: 'blog', label: 'Blog Articles' },
    { id: 'users', label: 'Users & Access' },
    { id: 'settings', label: 'Settings & Backup' }
  ];

  container.innerHTML = `
    <!-- Current Active Admin Profile Card -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">🔐 Current Admin Session</h2>
          <div class="studio-card-desc">Your active authenticated CG Cloud Dashboard administrator account.</div>
        </div>
        <span style="padding:0.35rem 0.85rem; background:var(--studio-green-light); color:var(--studio-green); border-radius:var(--radius-pill); font-size:0.8rem; font-weight:800;">● Active Session</span>
      </div>

      <div style="display:flex; align-items:center; gap:1rem; padding:1rem; background:var(--studio-surface-subtle); border-radius:var(--radius-md);">
        <div style="width:44px; height:44px; border-radius:50%; background:var(--studio-primary); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.2rem;">
          ${(currentAdmin.username || 'A')[0].toUpperCase()}
        </div>
        <div>
          <div style="font-weight:800; font-size:1.05rem;">${escapeHtml(currentAdmin.displayName || currentAdmin.username)}</div>
          <div style="font-size:0.82rem; color:var(--studio-text-secondary);">
            Username: <code>${escapeHtml(currentAdmin.username)}</code> &bull; Role: <span class="user-role-tag">${escapeHtml(currentAdmin.role.toUpperCase())}</span>
          </div>
        </div>
      </div>

      <!-- Change Password Box -->
      <div class="change-password-box">
        <h3 style="font-size:1rem; font-weight:800; margin-bottom:0.35rem;">🔑 Change Admin Password</h3>
        <p style="font-size:0.82rem; color:var(--studio-text-secondary); margin-bottom:1rem;">
          Update your login password. The new password hash will be committed to your repository content security policy.
        </p>

        <form id="change-pwd-form" onsubmit="handleChangePassword(event)">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1rem;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Current Password</label>
              <input type="password" id="current-pwd-input" class="form-control" placeholder="••••••••" required>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">New Password (min 6 chars)</label>
              <input type="password" id="new-pwd-input" class="form-control" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Confirm New Password</label>
              <input type="password" id="confirm-pwd-input" class="form-control" placeholder="••••••••" minlength="6" required>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="submit" class="btn-studio btn-studio-primary" id="change-pwd-btn">Update Password</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Admin Accounts & Access Control (RBAC) -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">👥 Studio User Management & Section Permissions (${adminUsers.length})</h2>
          <div class="studio-card-desc">Assign granular section permissions specifying which parts of the Studio each user can access.</div>
        </div>
        <button type="button" class="btn-studio btn-studio-primary" onclick="openCreateUserModal()">+ Add User Account</button>
      </div>

      <div class="blog-table-card">
        <table class="studio-table">
          <thead>
            <tr>
              <th>User Account</th>
              <th>Role</th>
              <th style="min-width:280px;">Allowed Studio Sections (RBAC)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${adminUsers.map((u, idx) => {
              const isSuper = u.role === 'admin';
              const userPerms = u.permissions || (isSuper ? ['dashboard', 'pages', 'team', 'blog', 'users', 'settings'] : ['dashboard', 'blog']);
              
              return `
              <tr>
                <td>
                  <div style="font-weight:800; color:var(--studio-text);"><code>${escapeHtml(u.username)}</code></div>
                  <div style="font-size:0.8rem; color:var(--studio-text-secondary);">${escapeHtml(u.displayName || u.username)}</div>
                </td>
                <td>
                  <span class="user-role-tag">${escapeHtml(u.role.toUpperCase())}</span>
                </td>
                <td>
                  ${isSuper ? `
                    <span class="perm-pill active" style="background:var(--studio-green-light); color:var(--studio-green); font-weight:800;">
                      🛡️ All Sections (Full Super Admin Access)
                    </span>
                  ` : `
                    <div class="perm-badge-group">
                      ${userPerms.map(p => `<span class="perm-pill active">${escapeHtml(p)}</span>`).join('')}
                    </div>
                    
                    <!-- Granular Section Toggles -->
                    <div class="rbac-checkboxes">
                      ${allSections.map(sec => `
                        <label class="rbac-check-item">
                          <input type="checkbox" ${userPerms.includes(sec.id) ? 'checked' : ''} onchange="toggleUserPermission('${escapeHtml(u.username)}', '${sec.id}', this.checked)">
                          <span>${sec.label}</span>
                        </label>
                      `).join('')}
                    </div>
                  `}
                </td>
                <td style="white-space:nowrap;">
                  <button type="button" class="icon-btn" onclick="openEditUserModal(${idx})" title="Edit User">✏️</button>
                  ${adminUsers.length > 1 && u.username !== currentAdmin.username ? `
                    <button type="button" class="icon-btn danger" onclick="deleteAdminUser(${idx})" title="Delete user">✕</button>
                  ` : `<span style="font-size:0.75rem; color:var(--studio-text-muted); margin-left:0.25rem;">(Self)</span>`}
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Granular RBAC Permission Toggle
window.toggleUserPermission = function(username, sectionId, isChecked) {
  if (!state.content.adminAuth || !state.content.adminAuth.users) return;
  const targetUser = state.content.adminAuth.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!targetUser) return;

  if (!targetUser.permissions) {
    targetUser.permissions = ['dashboard', 'blog'];
  }

  if (isChecked) {
    if (!targetUser.permissions.includes(sectionId)) {
      targetUser.permissions.push(sectionId);
    }
  } else {
    targetUser.permissions = targetUser.permissions.filter(p => p !== sectionId);
    // Keep at least dashboard
    if (targetUser.permissions.length === 0) {
      targetUser.permissions = ['dashboard'];
    }
  }

  // If modifying currently logged in user session, sync it immediately
  if (state.adminSession && state.adminSession.username.toLowerCase() === username.toLowerCase()) {
    state.adminSession.permissions = targetUser.permissions;
    if (localStorage.getItem('cgcloud_admin_session')) {
      localStorage.setItem('cgcloud_admin_session', JSON.stringify(state.adminSession));
    } else {
      sessionStorage.setItem('cgcloud_admin_session', JSON.stringify(state.adminSession));
    }
    applySidebarPermissions();
  }

  markDirty(true);
  renderUsersManager();
  showToast(`Updated access permissions for "${username}". Click "Publish" to save permanently.`, 'success');
};

// Password Change Handler
window.handleChangePassword = async function(e) {
  e.preventDefault();
  const currentVal = document.getElementById('current-pwd-input').value;
  const newVal = document.getElementById('new-pwd-input').value;
  const confirmVal = document.getElementById('confirm-pwd-input').value;
  const btn = document.getElementById('change-pwd-btn');

  if (newVal !== confirmVal) {
    alert('New passwords do not match. Please retype them.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Updating...';

  try {
    const currentHash = await sha256(currentVal);
    const users = (state.content.adminAuth && state.content.adminAuth.users) || [];
    const activeUsername = (state.adminSession && state.adminSession.username) || 'admin';
    const userIndex = users.findIndex(u => u.username.toLowerCase() === activeUsername.toLowerCase());

    if (userIndex === -1 || users[userIndex].passwordHash !== currentHash) {
      alert('The current password you entered is incorrect.');
      btn.disabled = false;
      btn.textContent = 'Update Password';
      return;
    }

    const newHash = await sha256(newVal);
    state.content.adminAuth.users[userIndex].passwordHash = newHash;
    markDirty(true);

    showToast('Admin password updated successfully! Click "Publish" to permanently save it.', 'success');
    document.getElementById('change-pwd-form').reset();
    renderUsersManager();
  } catch (err) {
    console.error(err);
    alert('Failed to update password: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Password';
  }
};

// User Account Modal Controls (Replaces crude browser prompt)
window.openCreateUserModal = function() {
  const modal = document.getElementById('user-modal');
  if (!modal) return;

  document.getElementById('user-modal-title').textContent = '👤 Add User Account';
  document.getElementById('user-modal-save-btn').textContent = 'Save User Account';
  document.getElementById('user-edit-index').value = '-1';

  const alertEl = document.getElementById('user-modal-alert');
  if (alertEl) { alertEl.style.display = 'none'; alertEl.textContent = ''; }

  document.getElementById('user-fullname').value = '';
  const unameInput = document.getElementById('user-username');
  unameInput.value = '';
  unameInput.disabled = false;

  const pwdInput = document.getElementById('user-password');
  pwdInput.value = '';
  pwdInput.type = 'password';
  pwdInput.placeholder = '••••••••';
  pwdInput.required = true;
  document.getElementById('user-password-hint').textContent = 'Min 6 characters. Required for new users.';
  const toggleBtn = document.getElementById('toggle-user-pwd-btn');
  if (toggleBtn) toggleBtn.textContent = '👁️';

  document.getElementById('user-role-select').value = 'editor';

  const permCheckboxes = document.querySelectorAll('#user-modal-perms input[type="checkbox"]');
  permCheckboxes.forEach(cb => {
    cb.checked = (cb.value === 'dashboard' || cb.value === 'blog');
    cb.disabled = false;
  });

  modal.classList.add('active');
  document.getElementById('user-fullname').focus();
};

window.openEditUserModal = function(index) {
  const modal = document.getElementById('user-modal');
  if (!modal || !state.content.adminAuth || !state.content.adminAuth.users) return;
  const user = state.content.adminAuth.users[index];
  if (!user) return;

  document.getElementById('user-modal-title').textContent = `✏️ Edit User: ${user.username}`;
  document.getElementById('user-modal-save-btn').textContent = 'Update User Account';
  document.getElementById('user-edit-index').value = String(index);

  const alertEl = document.getElementById('user-modal-alert');
  if (alertEl) { alertEl.style.display = 'none'; alertEl.textContent = ''; }

  document.getElementById('user-fullname').value = user.displayName || user.username;
  const unameInput = document.getElementById('user-username');
  unameInput.value = user.username;
  unameInput.disabled = true; // Username is user ID, immutable

  const pwdInput = document.getElementById('user-password');
  pwdInput.value = '';
  pwdInput.type = 'password';
  pwdInput.placeholder = '(Leave blank to keep unchanged)';
  pwdInput.required = false;
  document.getElementById('user-password-hint').textContent = 'Leave blank to keep unchanged. Min 6 characters if updating.';
  const toggleBtn = document.getElementById('toggle-user-pwd-btn');
  if (toggleBtn) toggleBtn.textContent = '👁️';

  document.getElementById('user-role-select').value = user.role || 'editor';

  const isSuper = user.role === 'admin';
  const userPerms = user.permissions || (isSuper ? ['dashboard', 'pages', 'team', 'blog', 'users', 'settings'] : ['dashboard', 'blog']);
  const permCheckboxes = document.querySelectorAll('#user-modal-perms input[type="checkbox"]');
  permCheckboxes.forEach(cb => {
    cb.checked = isSuper || userPerms.includes(cb.value);
    cb.disabled = isSuper;
  });

  modal.classList.add('active');
  document.getElementById('user-fullname').focus();
};

window.closeUserModal = function() {
  const modal = document.getElementById('user-modal');
  if (modal) modal.classList.remove('active');
};

window.toggleUserPwdVisibility = function() {
  const pwdInput = document.getElementById('user-password');
  const toggleBtn = document.getElementById('toggle-user-pwd-btn');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (toggleBtn) toggleBtn.textContent = '🙈';
  } else {
    pwdInput.type = 'password';
    if (toggleBtn) toggleBtn.textContent = '👁️';
  }
};

window.onUserRoleChange = function() {
  const role = document.getElementById('user-role-select').value;
  const permCheckboxes = document.querySelectorAll('#user-modal-perms input[type="checkbox"]');
  if (role === 'admin') {
    permCheckboxes.forEach(cb => {
      cb.checked = true;
      cb.disabled = true;
    });
  } else {
    permCheckboxes.forEach(cb => {
      cb.disabled = false;
    });
  }
};

window.saveUserFromModal = async function() {
  const index = parseInt(document.getElementById('user-edit-index').value, 10);
  const fullName = document.getElementById('user-fullname').value.trim();
  const username = document.getElementById('user-username').value.trim().toLowerCase();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role-select').value;
  const alertEl = document.getElementById('user-modal-alert');

  const showAlert = (msg) => {
    if (alertEl) {
      alertEl.textContent = msg;
      alertEl.style.display = 'block';
    } else {
      alert(msg);
    }
  };

  if (!fullName) {
    showAlert('Please enter the Full Name / Display Name.');
    document.getElementById('user-fullname').focus();
    return;
  }
  if (!username) {
    showAlert('Please enter a valid Username.');
    document.getElementById('user-username').focus();
    return;
  }
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
    showAlert('Username can only contain letters, numbers, underscores, and hyphens.');
    document.getElementById('user-username').focus();
    return;
  }

  if (!state.content.adminAuth) state.content.adminAuth = { users: [] };
  if (!state.content.adminAuth.users) state.content.adminAuth.users = [];

  // Determine permissions
  let permissions = [];
  if (role === 'admin') {
    permissions = ['dashboard', 'pages', 'team', 'blog', 'users', 'settings'];
  } else {
    const permCheckboxes = document.querySelectorAll('#user-modal-perms input[type="checkbox"]:checked');
    permCheckboxes.forEach(cb => permissions.push(cb.value));
    if (permissions.length === 0) permissions = ['dashboard'];
  }

  if (index === -1) {
    // Creating new user
    const existing = state.content.adminAuth.users.find(u => u.username.toLowerCase() === username);
    if (existing) {
      showAlert(`User "${username}" already exists. Please choose a different username.`);
      return;
    }
    if (!password || password.length < 6) {
      showAlert('Password must be at least 6 characters.');
      document.getElementById('user-password').focus();
      return;
    }

    const passHash = await sha256(password);
    state.content.adminAuth.users.push({
      username: username,
      displayName: fullName,
      role: role,
      permissions: permissions,
      passwordHash: passHash
    });

    markDirty(true);
    closeUserModal();
    renderUsersManager();
    showToast(`Added user "${username}" successfully! Click "Publish" to save permanently.`, 'success');
  } else {
    // Editing existing user
    const targetUser = state.content.adminAuth.users[index];
    if (!targetUser) return;

    targetUser.displayName = fullName;
    targetUser.role = role;
    targetUser.permissions = permissions;

    if (password && password.trim()) {
      if (password.length < 6) {
        showAlert('New password must be at least 6 characters.');
        document.getElementById('user-password').focus();
        return;
      }
      targetUser.passwordHash = await sha256(password);
    }

    // If updating current active session
    if (state.adminSession && state.adminSession.username.toLowerCase() === targetUser.username.toLowerCase()) {
      state.adminSession.displayName = fullName;
      state.adminSession.role = role;
      state.adminSession.permissions = permissions;
      if (localStorage.getItem('cgcloud_admin_session')) {
        localStorage.setItem('cgcloud_admin_session', JSON.stringify(state.adminSession));
      } else {
        sessionStorage.setItem('cgcloud_admin_session', JSON.stringify(state.adminSession));
      }
      applySidebarPermissions();
    }

    markDirty(true);
    closeUserModal();
    renderUsersManager();
    showToast(`Updated user "${username}" successfully! Click "Publish" to save permanently.`, 'success');
  }
};

window.promptAddNewUser = function() {
  openCreateUserModal();
};

window.deleteAdminUser = function(index) {
  const user = state.content.adminAuth.users[index];
  showConfirmModal(
    'Delete User Account',
    `Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`,
    () => {
      state.content.adminAuth.users.splice(index, 1);
      markDirty(true);
      renderUsersManager();
      showToast('User account deleted.', 'info');
    },
    'Delete User',
    true
  );
};

// ==========================================
// 6. SETTINGS & REPOSITORY INTEGRATION (All GitHub Auth & Backups)
// ==========================================
function renderSettingsManager() {
  const container = document.getElementById('panel-settings');
  if (!container || !state.content) return;

  const isConnected = !!state.token && !!state.user;

  container.innerHTML = `
    <!-- GitHub Authentication & Publishing Engine -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">☁️ GitHub Authentication & Cloud Deployment</h2>
          <div class="studio-card-desc">Centralized Personal Access Token (PAT) and repository synchronization settings.</div>
        </div>
        ${isConnected ? `
          <span style="padding:0.35rem 0.85rem; background:var(--studio-green-light); color:var(--studio-green); border-radius:var(--radius-pill); font-size:0.8rem; font-weight:800;">
            ● GitHub Connected
          </span>
        ` : `
          <span style="padding:0.35rem 0.85rem; background:var(--studio-amber-light); color:var(--studio-amber); border-radius:var(--radius-pill); font-size:0.8rem; font-weight:800;">
            ⚪ Not Connected (Local Preview)
          </span>
        `}
      </div>

      ${isConnected ? `
        <!-- Connected Account Card -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; padding:1.25rem; background:var(--studio-surface-subtle); border-radius:var(--radius-md); margin-bottom:1.5rem;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <img src="${state.user.avatar}" alt="${state.user.login}" style="width:52px; height:52px; border-radius:50%; border:2px solid var(--studio-primary);">
            <div>
              <div style="font-weight:800; font-size:1.1rem; color:var(--studio-text);">${escapeHtml(state.user.name || state.user.login)} (@${state.user.login})</div>
              <div style="font-size:0.82rem; color:var(--studio-text-secondary); margin-top:2px;">
                Repository Collaborator Role: <span class="user-role-tag">${state.user.role.toUpperCase()}</span> &bull; Scopes: <code>repo</code>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="btn-studio btn-studio-secondary" onclick="testGitHubConnection()">🔄 Test Connection</button>
            <button type="button" class="btn-studio btn-studio-secondary" style="color:var(--studio-red);" onclick="disconnectGitHubToken()">Disconnect Token</button>
          </div>
        </div>
      ` : `
        <!-- Token Setup Form -->
        <div style="padding:1.25rem; background:var(--studio-surface-subtle); border-radius:var(--radius-md); margin-bottom:1.5rem;">
          <div style="font-weight:800; font-size:1rem; margin-bottom:0.35rem; color:var(--studio-text);">Connect GitHub Personal Access Token</div>
          <p style="font-size:0.84rem; color:var(--studio-text-secondary); line-height:1.6; margin-bottom:1rem;">
            To publish edits to <strong>${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}</strong> and trigger automatic deployment to GitHub Pages, provide a GitHub Personal Access Token with <code>repo</code> scope.
          </p>

          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem;">
            <input type="password" id="settings-token-input" class="form-control" style="flex:1; min-width:260px;" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx">
            <button type="button" class="btn-studio btn-studio-primary" onclick="saveSettingsGitHubToken()">Connect & Save Token</button>
          </div>

          <div class="form-hint">
            Don't have a token? <a href="https://github.com/settings/tokens/new?scopes=repo&description=CGCloud+Content+Studio" target="_blank" style="color:var(--studio-primary); font-weight:700;">Generate one in 10 seconds on GitHub ↗</a> (select "repo" scope).
          </div>
        </div>
      `}

      <!-- Repository Details Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; padding:1.15rem; background:var(--studio-surface-subtle); border-radius:var(--radius-md);">
        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--studio-text-muted);">Target Repository</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--studio-text); margin-top:2px;">
            <a href="https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}" target="_blank" style="color:var(--studio-primary); text-decoration:none;">${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME} ↗</a>
          </div>
        </div>
        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--studio-text-muted);">Active Branch</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--studio-text); margin-top:2px;"><code>${BRANCH_NAME}</code></div>
        </div>
        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--studio-text-muted);">Content Dictionary File</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--studio-text); margin-top:2px;"><code>${CONTENT_FILE_PATH}</code></div>
        </div>
        <div>
          <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--studio-text-muted);">Latest Git SHA</div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--studio-text); margin-top:2px;"><code>${state.fileSha ? state.fileSha.substring(0, 8) : 'Local static'}</code></div>
        </div>
      </div>
    </div>

    <!-- Backup & Raw Content JSON Snapshot -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">⚙️ Backup & Raw Content JSON</h2>
          <div class="studio-card-desc">Download a complete JSON snapshot or inspect raw structured data.</div>
        </div>
        <button type="button" class="btn-studio btn-studio-secondary" onclick="downloadBackupJson()">📥 Download site-content.json Backup</button>
      </div>

      <div class="form-group">
        <label class="form-label">Raw JSON Editor</label>
        <textarea id="raw-json-editor" class="form-control" style="min-height:380px; font-family:monospace; font-size:0.82rem;">${escapeHtml(JSON.stringify(state.content, null, 2))}</textarea>
      </div>

      <button type="button" class="btn-studio btn-studio-primary" onclick="applyRawJsonChanges()">Apply Raw JSON Changes</button>
    </div>
  `;
}

window.saveSettingsGitHubToken = async function() {
  const input = document.getElementById('settings-token-input');
  if (!input || !input.value.trim()) {
    alert('Please enter a valid GitHub token.');
    return;
  }
  const token = input.value.trim();
  await verifyGitHubAuth(token, true);
  renderSettingsManager();
};

window.disconnectGitHubToken = function() {
  showConfirmModal(
    'Disconnect GitHub Token',
    'Are you sure you want to disconnect your GitHub token? You will need to re-enter it to publish changes.',
    () => {
      localStorage.removeItem('cgcloud_gh_token');
      state.token = '';
      state.user = null;
      updateAuthUI(null);
      showToast('GitHub token removed.', 'info');
      renderSettingsManager();
    },
    'Disconnect Token',
    true
  );
};

window.testGitHubConnection = async function() {
  if (!state.token) {
    alert('No token configured.');
    return;
  }
  showToast('Testing GitHub connection...', 'info');
  await verifyGitHubAuth(state.token, true);
  renderSettingsManager();
};

window.downloadBackupJson = function() {
  const blob = new Blob([JSON.stringify(state.content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cgcloud-content-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup JSON downloaded.', 'success');
};

window.applyRawJsonChanges = function() {
  const textarea = document.getElementById('raw-json-editor');
  if (!textarea) return;
  try {
    const parsed = JSON.parse(textarea.value);
    state.content = parsed;
    markDirty(true);
    showToast('Raw JSON applied successfully!', 'success');
  } catch (err) {
    alert('Invalid JSON: ' + err.message);
  }
};

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

