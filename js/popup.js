// popup.js - Popup interface for Math Notation AI

class PopupManager {
  constructor() {
    this.content = null;
    this.init();
  }

  async init() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupPopup());
      } else {
        this.setupPopup();
      }
    } catch (error) {
      console.error('Popup init error:', error);
      this.showError('Failed to load extension');
    }
  }

  async setupPopup() {
    this.content = document.getElementById('content');

    if (!this.content) {
      console.error('Content element not found');
      return;
    }

    try {
      this.showLoading();
      const userData = await this.getUserData();
      this.renderInterface(userData);
    } catch (error) {
      console.error('Setup error:', error);
      this.showError('Failed to load user data');
    }
  }

  showLoading() {
    this.content.innerHTML = `
      <div class="loading">
        <div style="margin-bottom: 10px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" opacity="0.75">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
        Loading...
      </div>
    `;
  }

  showError(message) {
    this.content.innerHTML = `
      <div class="error-message" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <strong>Error:</strong> ${this.escapeHtml(message)}
      </div>
      <button class="upgrade-btn" onclick="location.reload()" style="
        background: #1e40af;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
      ">
        Retry
      </button>
    `;
  }

  async getUserId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userId'], (result) => {
        if (result.userId) {
          resolve(result.userId);
        } else {
          const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
          chrome.storage.local.set({ userId: newUserId }, () => {
            resolve(newUserId);
          });
        }
      });
    });
  }

  async getUserData() {
    try {
      const userId = await this.getUserId();
      const API_URL = 'https://math-notation-ai-backend-production.up.railway.app';

      // Fetch subscription data from backend
      const response = await fetch(`${API_URL}/api/subscription/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();

      // Store subscription data in chrome.storage for content.js to access
      const subscription = {
        status: data.tier,
        usage: data.usage,
        limit: data.limit,
        remaining: data.remaining
      };

      await new Promise((resolve) => {
        chrome.storage.local.set({ subscription }, resolve);
      });

      return {
        tier: data.tier,
        usage: data.usage,
        limit: data.limit,
        remaining: data.remaining
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to cached data if fetch fails
      return new Promise((resolve) => {
        chrome.storage.local.get(['subscription'], (result) => {
          const subscription = result.subscription || { status: 'free', usage: 0, limit: 5, remaining: 5 };
          resolve({
            tier: subscription.status,
            usage: subscription.usage,
            limit: subscription.limit,
            remaining: subscription.remaining
          });
        });
      });
    }
  }

  renderInterface(userData) {
    const { tier, usage, limit, remaining } = userData;

    if (tier === 'premium') {
      this.renderPremiumInterface(usage, limit);
    } else {
      this.renderFreeInterface(usage, limit, remaining);
    }
  }

  renderFreeInterface(usage, limit, remaining) {
    const progress = Math.min(100, (usage / limit) * 100);
    const isLimitReached = remaining === 0;
    const progressColor = isLimitReached ? '#dc2626' : '#3b82f6';

    this.content.innerHTML = `
      <div class="stats-card">
        <div class="stat-row">
          <span class="stat-label">Current Plan</span>
          <span class="stat-value" style="font-weight: 600; color: #64748b;">Free Tier</span>
        </div>
      </div>

      <div class="stats-card">
        <div class="stat-row">
          <span class="stat-label">Daily Usage</span>
          <span class="stat-value">${usage} / ${limit} explanations</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%; background: ${progressColor}"></div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stat-row">
          <span class="stat-label">Remaining Today</span>
          <span class="stat-value" style="color: ${progressColor}; font-weight: 600;">${remaining}</span>
        </div>
      </div>

      ${isLimitReached ? `
        <div class="error-message" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;">
          <strong>Daily limit reached.</strong> Upgrade to Premium for continued access.
        </div>
      ` : ''}

      <button class="upgrade-btn" id="upgradeBtn" style="
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
        transition: all 0.2s ease;
        letter-spacing: 0.025em;
      ">
        Upgrade to Premium — $2.99/month
      </button>

      <div class="features-list" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e293b; font-size: 13px;">Premium Benefits</p>
        <div class="feature" style="font-size: 13px; color: #475569; margin-bottom: 8px;">• 500 explanations per day</div>
        <div class="feature" style="font-size: 13px; color: #475569; margin-bottom: 8px;">• Advanced mathematical analysis</div>
        <div class="feature" style="font-size: 13px; color: #475569; margin-bottom: 8px;">• Priority support</div>
        <div class="feature" style="font-size: 13px; color: #475569;">• No advertisements</div>
      </div>

      <div class="help-text" style="color: #64748b; font-size: 13px; margin-top: 16px; line-height: 1.6;">
        <strong style="color: #1e293b;">Quick Start:</strong><br>
        Press <kbd style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;">Cmd+Shift+Z</kbd> (Mac) or <kbd style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;">Ctrl+Shift+Z</kbd> (Windows)<br>
        Select any mathematical notation to receive an instant explanation.
      </div>
    `;

    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', this.handleUpgrade.bind(this));
    }
  }

  renderPremiumInterface(usage, limit) {
    const progress = Math.min(100, (usage / limit) * 100);
    const remaining = limit - usage;

    this.content.innerHTML = `
      <div class="stats-card" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border: none;">
        <div class="stat-row">
          <span class="stat-label" style="color: rgba(255,255,255,0.9);">Current Plan</span>
          <span class="premium-badge" style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">PREMIUM</span>
        </div>
      </div>

      <div class="stats-card">
        <div class="stat-row">
          <span class="stat-label">Daily Usage</span>
          <span class="stat-value">${usage} / ${limit} explanations</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(135deg, #10b981 0%, #059669 100%)"></div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stat-row">
          <span class="stat-label">Subscription Status</span>
          <span class="stat-value" style="color: #10b981; font-weight: 600;">Active</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Remaining Today</span>
          <span class="stat-value" style="color: #3b82f6; font-weight: 600;">${remaining}</span>
        </div>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="margin: 0; text-align: center; color: #0369a1; font-size: 14px; line-height: 1.6;">
          Thank you for your subscription. Your support enables continuous development and improvement of Math Notation AI.
        </p>
      </div>

      <div class="help-text" style="color: #64748b; font-size: 13px; margin-top: 16px; line-height: 1.6;">
        <strong style="color: #1e293b;">Quick Start:</strong><br>
        Press <kbd style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;">Cmd+Shift+Z</kbd> (Mac) or <kbd style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;">Ctrl+Shift+Z</kbd> (Windows)<br>
        Select any mathematical notation to receive an instant explanation.
      </div>
    `;
  }

  async handleUpgrade() {
    try {
      // Get user ID
      const result = await chrome.storage.local.get(['userId']);
      const userId = result.userId || 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

      // Create checkout session
      const response = await fetch('https://math-notation-ai-backend-production.up.railway.app/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          plan: 'monthly'
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Open Stripe checkout
        chrome.tabs.create({ url: data.url });
        window.close();
      } else {
        console.error('Checkout session creation failed:', data);
        const errorMessage = data.error || 'Failed to create checkout session';
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        alert(errorMessage + errorDetails + '\n\nPlease check the console for more information.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to connect to payment server. Please try again.');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
new PopupManager();
