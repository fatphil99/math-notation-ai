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
    const progressColor = isLimitReached ? '#dc2626' : '#4b5563';

    this.content.innerHTML = `
      <div class="stats-card" style="background: #f9fafb; border: 1px solid #d1d5db;">
        <div class="stat-row">
          <span class="stat-label">Account Type</span>
          <span class="stat-value" style="font-weight: 600; color: #6b7280;">Free</span>
        </div>
      </div>

      <div class="stats-card" style="border: 1px solid #e5e7eb;">
        <div class="stat-row">
          <span class="stat-label">Daily Usage</span>
          <span class="stat-value">${usage} / ${limit} queries</span>
        </div>
        <div class="progress-bar" style="background: #e5e7eb;">
          <div class="progress-fill" style="width: ${progress}%; background: ${progressColor}"></div>
        </div>
      </div>

      <div class="stats-card" style="border: 1px solid #e5e7eb;">
        <div class="stat-row">
          <span class="stat-label">Remaining Today</span>
          <span class="stat-value" style="color: ${progressColor}; font-weight: 600;">${remaining}</span>
        </div>
      </div>

      ${isLimitReached ? `
        <div class="error-message" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; border-radius: 4px; margin-top: 12px; font-size: 13px;">
          Daily limit reached. Upgrade for continued access.
        </div>
      ` : ''}

      <button class="upgrade-btn" id="upgradeBtn" style="
        background: #111827;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 12px;
        transition: background 0.2s ease;
      " onmouseover="this.style.background='#1f2937'" onmouseout="this.style.background='#111827'">
        Upgrade to Premium — $2.99/month
      </button>

      <div class="features-list" style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 4px; padding: 14px; margin-top: 14px;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #111827; font-size: 12px;">Premium Features</p>
        <div class="feature" style="font-size: 12px; color: #374151; margin-bottom: 6px;">• 500 queries per day</div>
        <div class="feature" style="font-size: 12px; color: #374151; margin-bottom: 6px;">• Advanced mathematical analysis</div>
        <div class="feature" style="font-size: 12px; color: #374151; margin-bottom: 6px;">• Priority support</div>
        <div class="feature" style="font-size: 12px; color: #374151;">• Ad-free experience</div>
      </div>

      <div class="help-text" style="color: #374151; font-size: 13px; margin-top: 14px; line-height: 1.7; background: #ffffff; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px;">
        <strong style="color: #111827; display: block; margin-bottom: 8px;">Keyboard Shortcut:</strong>
        <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 2px; border: 1px solid #d1d5db; font-family: monospace; font-size: 12px; color: #111827;">Cmd+Shift+Z</kbd> <span style="color: #6b7280;">(Mac)</span></div>
        <div style="margin-bottom: 8px;"><kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 2px; border: 1px solid #d1d5db; font-family: monospace; font-size: 12px; color: #111827;">Ctrl+Shift+Z</kbd> <span style="color: #6b7280;">(Windows)</span></div>
        <span style="color: #6b7280; font-size: 12px;">Select mathematical notation for analysis</span>
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
      <div class="stats-card" style="background: #f9fafb; border: 1px solid #d1d5db;">
        <div class="stat-row">
          <span class="stat-label">Account Type</span>
          <span class="premium-badge" style="background: #111827; color: white; padding: 4px 12px; border-radius: 2px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">PREMIUM</span>
        </div>
      </div>

      <div class="stats-card" style="border: 1px solid #e5e7eb;">
        <div class="stat-row">
          <span class="stat-label">Daily Usage</span>
          <span class="stat-value">${usage} / ${limit} queries</span>
        </div>
        <div class="progress-bar" style="background: #e5e7eb;">
          <div class="progress-fill" style="width: ${progress}%; background: #4b5563"></div>
        </div>
      </div>

      <div class="stats-card" style="border: 1px solid #e5e7eb;">
        <div class="stat-row">
          <span class="stat-label">Status</span>
          <span class="stat-value" style="color: #111827; font-weight: 600;">Active</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Remaining Today</span>
          <span class="stat-value" style="color: #111827; font-weight: 600;">${remaining}</span>
        </div>
      </div>

      <div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 4px; padding: 14px; margin-top: 16px;">
        <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.5;">
          Premium subscription active. Access to enhanced mathematical analysis and priority support.
        </p>
      </div>

      <div class="help-text" style="color: #374151; font-size: 13px; margin-top: 16px; line-height: 1.7; background: #ffffff; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px;">
        <strong style="color: #111827; display: block; margin-bottom: 8px;">Keyboard Shortcut:</strong>
        <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 2px; border: 1px solid #d1d5db; font-family: monospace; font-size: 12px; color: #111827;">Cmd+Shift+Z</kbd> <span style="color: #6b7280;">(Mac)</span></div>
        <div style="margin-bottom: 8px;"><kbd style="background: #f3f4f6; padding: 4px 8px; border-radius: 2px; border: 1px solid #d1d5db; font-family: monospace; font-size: 12px; color: #111827;">Ctrl+Shift+Z</kbd> <span style="color: #6b7280;">(Windows)</span></div>
        <span style="color: #6b7280; font-size: 12px;">Select mathematical notation for analysis</span>
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
