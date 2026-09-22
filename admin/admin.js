/**
 * Chhattisgadhiya Cloud — Content Studio Client Engine
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
  fileSha: '',
  content: null,
  originalContentJson: '',
  isDirty: false,
  activeTab: 'dashboard',
  editingPostIndex: null
};

// UTF-8 Safe Base64 helpers for bilingual Hindi / English content
function utf8ToBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

// Initialize Studio
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();

  // Load content (locally or from GitHub)
  await loadInitialContent();

  // If token exists, verify with GitHub
  if (state.token) {
    await verifyGitHubAuth(state.token, false);
  } else {
    updateAuthUI(null);
  }

  renderActiveTab();
});

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
      dashboard: 'Dashboard Overview',
      team: 'About & Team Management',
      blog: 'Blog Posts Manager',
      pages: 'All Pages Content',
      users: 'Users & Permissions',
      settings: 'Settings & JSON Backup'
    };
    titleEl.textContent = titles[tabId] || 'Content Studio';
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
      if (confirm('Discard all unsaved changes and reload from source?')) {
        state.content = JSON.parse(state.originalContentJson);
        markDirty(false);
        renderActiveTab();
        showToast('Unsaved changes discarded.', 'info');
      }
    });
  }
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
      publishBtn.title = canPublish ? 'Commit changes to GitHub main branch' : 'You need write permissions to publish';
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
      publishBtn.title = 'Connect GitHub to publish changes';
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
  publishBtn.innerHTML = `<span>Publishing to GitHub...</span>`;

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
      throw new Error(errData.message || 'GitHub commit failed');
    }

    const resultData = await putRes.json();
    state.fileSha = resultData.content.sha;
    state.originalContentJson = JSON.stringify(state.content);
    markDirty(false);

    showToast('Changes committed to GitHub! Deploying on GitHub Pages (~30s)...', 'success');

    // Trigger workflow run tracking
    pollDeployment();

  } catch (err) {
    console.error('Publish error:', err);
    alert('Failed to publish changes to GitHub: ' + err.message);
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
          <h2 class="studio-card-title">🚀 Welcome to Chhattisgadhiya Cloud Studio</h2>
          <div class="studio-card-desc">Direct GitHub-backed management for your bilingual culture & theatre portal.</div>
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
        <button type="button" class="btn-studio btn-studio-secondary" onclick="addNewTeamMember()">+ Add Team Member</button>
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
    return `
      <div class="team-card-editor" data-index="${index}">
        <div class="team-card-header">
          <span class="team-card-badge">Member #${index + 1}</span>
          <div class="team-card-actions">
            ${index > 0 ? `<button type="button" class="icon-btn" onclick="moveTeamMember(${index}, -1)" title="Move Up">↑</button>` : ''}
            ${index < team.length - 1 ? `<button type="button" class="icon-btn" onclick="moveTeamMember(${index}, 1)" title="Move Down">↓</button>` : ''}
            <button type="button" class="icon-btn danger" onclick="removeTeamMember(${index})" title="Delete Member">✕</button>
          </div>
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
        <button type="button" class="btn-studio btn-studio-primary" onclick="addNewTeamMember()">+ Add Member</button>
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

      <div class="bilingual-tabs-wrap">
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
  if (confirm(`Are you sure you want to remove ${member.name || 'this team member'}?`)) {
    state.content.about.team.splice(index, 1);
    markDirty(true);
    renderTeamAndAbout();
    showToast('Team member removed.', 'info');
  }
};

window.addNewTeamMember = function() {
  if (!state.content.about) state.content.about = {};
  if (!state.content.about.team) state.content.about.team = [];

  state.content.about.team.push({
    name: "New Member",
    role: { en: "Role Title", hi: "पदनाम" },
    bio: { en: "Biographical details...", hi: "परिचय विवरण..." }
  });

  markDirty(true);
  renderTeamAndAbout();
  showToast('New team member added. Fill out details and save.', 'success');
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
  const title = post.title && post.title.en || 'this article';
  if (confirm(`Are you sure you want to delete "${title}"?`)) {
    state.content.blog.posts.splice(index, 1);
    markDirty(true);
    renderBlogManager();
    showToast('Post deleted.', 'info');
  }
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

  modal.classList.add('active');
}

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

  const postObj = {
    id: slug,
    slug: slug,
    date: document.getElementById('post-edit-date').value,
    author: document.getElementById('post-edit-author').value.trim(),
    category: document.getElementById('post-edit-category').value.trim(),
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
// 4. ALL PAGES CONTENT MANAGER
// ==========================================
function renderPagesManager() {
  const container = document.getElementById('panel-pages');
  if (!container || !state.content) return;

  const contact = state.content.contact || {};
  const orgName = state.content.orgName || {};
  const tagline = state.content.tagline || {};

  container.innerHTML = `
    <!-- Brand & Contact Details -->
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">🌐 Brand & Organization Core</h2>
          <div class="studio-card-desc">Main titles, Rebus tagline, and official contact numbers.</div>
        </div>
      </div>

      <div class="bilingual-tabs-wrap">
        <div class="bilingual-header"><span class="bilingual-title">Organization Headline</span></div>
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
        <div class="bilingual-header"><span class="bilingual-title">Motto / Tagline</span></div>
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
          <label class="form-label">Repertoire Bookings Email</label>
          <input type="email" class="form-control" value="${escapeHtml(contact.bookingEmail || '')}" onchange="state.content.contact.bookingEmail = this.value; markDirty(true);">
        </div>
        <div class="form-group">
          <label class="form-label">Helpline Phone Number</label>
          <input type="text" class="form-control" value="${escapeHtml(contact.phone || '')}" onchange="state.content.contact.phone = this.value; markDirty(true);">
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. USERS & ACCESS MANAGEMENT
// ==========================================
function renderUsersManager() {
  const container = document.getElementById('panel-users');
  if (!container) return;

  const currentUserHtml = state.user ? `
    <div style="display:flex; align-items:center; gap:1rem; padding:1.25rem; background:var(--studio-surface-subtle); border-radius:var(--radius-md); margin-bottom:1.5rem;">
      <img src="${state.user.avatar}" alt="${state.user.login}" style="width:48px; height:48px; border-radius:50%;">
      <div>
        <div style="font-weight:800; font-size:1.05rem;">${escapeHtml(state.user.name)} (@${state.user.login})</div>
        <div style="font-size:0.82rem; color:var(--studio-text-secondary); margin-top:2px;">
          Repository Access Role: <span class="user-role-tag">${state.user.role.toUpperCase()}</span>
        </div>
      </div>
      <div style="margin-left:auto;">
        <span style="font-size:0.8rem; font-weight:700; color:var(--studio-green);">● Authenticated via GitHub</span>
      </div>
    </div>
  ` : `
    <div style="padding:1.5rem; text-align:center; background:var(--studio-surface-subtle); border-radius:var(--radius-md); margin-bottom:1.5rem;">
      <p style="margin-bottom:1rem; color:var(--studio-text-secondary);">You are currently in local read-only preview mode.</p>
      <button type="button" class="btn-studio btn-studio-primary" onclick="showAuthModal()">Connect GitHub Account to View Permissions</button>
    </div>
  `;

  container.innerHTML = `
    <div class="studio-card">
      <div class="studio-card-header">
        <div>
          <h2 class="studio-card-title">🔐 User Access & Collaborators</h2>
          <div class="studio-card-desc">Permissions are strictly enforced via your GitHub repository access control.</div>
        </div>
      </div>

      ${currentUserHtml}

      <div style="background:#FFFFFF; border:1px solid var(--studio-border); border-radius:var(--radius-md); padding:1.5rem;">
        <h3 style="font-size:1rem; font-weight:800; margin-bottom:0.75rem;">How User Management Works</h3>
        <p style="font-size:0.88rem; color:var(--studio-text-secondary); line-height:1.6; margin-bottom:1rem;">
          To grant other team members or writers access to publish content:
        </p>
        <ol style="font-size:0.88rem; color:var(--studio-text-secondary); line-height:1.7; padding-left:1.5rem; margin-bottom:1.25rem;">
          <li>Visit your GitHub repository collaborators page: <a href="https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/settings/access" target="_blank" style="color:var(--studio-primary); font-weight:700;">GitHub Settings → Collaborators ↗</a></li>
          <li>Click <strong>Add people</strong> and invite the collaborator's GitHub username.</li>
          <li>Assign them the <strong>Write</strong> role (or <strong>Admin</strong>).</li>
          <li>Once accepted, they can navigate to <code>/admin/</code>, connect their GitHub token, and immediately edit and publish!</li>
        </ol>
        <a href="https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/settings/access" target="_blank" class="btn-studio btn-studio-secondary">
          Manage Collaborators on GitHub ↗
        </a>
      </div>
    </div>
  `;
}

// ==========================================
// 6. SETTINGS & JSON BACKUP
// ==========================================
function renderSettingsManager() {
  const container = document.getElementById('panel-settings');
  if (!container || !state.content) return;

  container.innerHTML = `
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
