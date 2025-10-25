// content.js - Screenshot-based Math Notation AI

console.log('Math Notation AI loaded');

class MathNotationAI {
  constructor() {
    this.API_URL = 'https://math-notation-ai-backend-production.up.railway.app';
    this.screenshotMode = false;
    this.overlay = null;
    this.selectionBox = null;
    this.startX = 0;
    this.startY = 0;
    this.isSelecting = false;
    this.tooltip = null;

    this.init();
  }

  init() {
    // Listen for keyboard command
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'screenshot-explain') {
        console.log('Screenshot command received');
        this.startScreenshotMode();
      }
    });

    // Listen for ESC to cancel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.screenshotMode) {
        this.cancelScreenshotMode();
      }
    });
  }

  startScreenshotMode() {
    if (this.screenshotMode) return;

    console.log('Starting screenshot mode');
    this.screenshotMode = true;
    this.createOverlay();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'math-ai-screenshot-overlay';

    const instructions = document.createElement('div');
    instructions.className = 'math-ai-screenshot-instructions';
    instructions.innerHTML = 'Drag to select math content • Press <kbd>ESC</kbd> to cancel';

    this.overlay.appendChild(instructions);
    this.overlay.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.overlay.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.overlay.addEventListener('mouseup', this.handleMouseUp.bind(this));

    document.body.appendChild(this.overlay);
  }

  handleMouseDown(e) {
    this.isSelecting = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    if (this.selectionBox) {
      this.selectionBox.remove();
    }

    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'math-ai-selection-box';

    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(corner => {
      const handle = document.createElement('div');
      handle.className = `math-ai-selection-handle ${corner}`;
      this.selectionBox.appendChild(handle);
    });

    this.overlay.appendChild(this.selectionBox);
  }

  handleMouseMove(e) {
    if (!this.isSelecting) return;

    const left = Math.min(this.startX, e.clientX);
    const top = Math.min(this.startY, e.clientY);
    const width = Math.abs(e.clientX - this.startX);
    const height = Math.abs(e.clientY - this.startY);

    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
  }

  async handleMouseUp(e) {
    if (!this.isSelecting) return;

    this.isSelecting = false;

    const left = Math.min(this.startX, e.clientX);
    const top = Math.min(this.startY, e.clientY);
    const width = Math.abs(e.clientX - this.startX);
    const height = Math.abs(e.clientY - this.startY);

    // Check if selection is too small
    if (width < 20 || height < 20) {
      console.log('Selection too small');
      this.cancelScreenshotMode();
      return;
    }

    const selectedArea = { left, top, width, height };
    console.log('Selected area:', selectedArea);

    // Remove overlay
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
        this.screenshotMode = false;
      }
    }, 200);

    // Extract and explain text
    await this.extractAndExplain(selectedArea);
  }

  cancelScreenshotMode() {
    console.log('Canceling screenshot mode');

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }

    this.screenshotMode = false;
    this.isSelecting = false;
  }

  async extractAndExplain(area) {
    console.log('Selection area (viewport coords):', area);
    console.log('Window scroll:', { x: window.pageXOffset, y: window.pageYOffset });
    
    const text = this.extractTextFromDOM(area);
    
    console.log('Extracted text:', text);
    console.log('Text length:', text.length);

    if (!text || text.trim().length === 0) {
      this.showError('No text found in selection. Try selecting text directly.');
      return;
    }

    console.log('Extracted text:', text);
    await this.fetchExplanation(text);
  }

  extractTextFromDOM(area) {
    // Convert viewport coordinates to page coordinates
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    const pageArea = {
      left: area.left + scrollX,
      top: area.top + scrollY,
      right: area.left + area.width + scrollX,
      bottom: area.top + area.height + scrollY,
      width: area.width,
      height: area.height
    };
    
    console.log('Page area (with scroll offset):', pageArea);
    
    // Get elements at center of selection (viewport coordinates work here)
    const centerX = area.left + area.width / 2;
    const centerY = area.top + area.height / 2;
    
    console.log('Checking elements at center:', { centerX, centerY });
    
    const elements = document.elementsFromPoint(centerX, centerY);
    console.log('Found elements:', elements.map(el => el.className || el.tagName));

    let extractedText = '';

    // Check for math-specific elements
    for (const element of elements) {
      if (element.classList.contains('katex') ||
          element.classList.contains('MathJax') ||
          element.classList.contains('math')) {

        const img = element.querySelector('img[alt]');
        if (img && img.alt) {
          extractedText = img.alt;
          console.log('Found math from img alt:', extractedText);
          break;
        }

        const annotation = element.querySelector('annotation[encoding="application/x-tex"]');
        if (annotation) {
          extractedText = annotation.textContent;
          console.log('Found math from annotation:', extractedText);
          break;
        }

        const dataLatex = element.getAttribute('data-latex');
        if (dataLatex) {
          extractedText = dataLatex;
          console.log('Found math from data-latex:', extractedText);
          break;
        }
      }
    }

    // If no math element, get text from area
    if (!extractedText) {
      console.log('No math elements found, walking text nodes...');
      
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      const textParts = [];
      let nodesChecked = 0;
      let nodesMatched = 0;

      while (node = walker.nextNode()) {
        nodesChecked++;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        
        // Convert rect to page coordinates
        const nodePageRect = {
          left: rect.left + scrollX,
          top: rect.top + scrollY,
          right: rect.right + scrollX,
          bottom: rect.bottom + scrollY
        };
        
        // Check intersection with page coordinates
        if (nodePageRect.right > pageArea.left &&
            nodePageRect.left < pageArea.right &&
            nodePageRect.bottom > pageArea.top &&
            nodePageRect.top < pageArea.bottom) {

          const text = node.textContent.trim();
          if (text) {
            textParts.push(text);
            nodesMatched++;
          }
        }
      }

      console.log(`Text node scan: checked ${nodesChecked} nodes, matched ${nodesMatched}`);
      console.log('Text parts found:', textParts);
      
      extractedText = textParts.join(' ');
    }

    return extractedText.trim();
  }

  async fetchExplanation(text) {
    console.log('Fetching explanation for:', text);

    // Check usage limit
    const canProceed = await this.checkUsageLimit();
    if (!canProceed) {
      return;
    }

    this.showLoading();

    try {
      const userId = await this.getUserId();
      const tier = await this.getUserTier();

      const requestBody = {
        symbol: text,
        context: '',
        userId: userId,
        tier: tier
      };

      console.log('Sending request:', requestBody);

      const response = await fetch(`${this.API_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000)  // Increased to 30s for GPT API calls
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Success! Showing explanation');

        // Update subscription data in storage
        if (data.remainingToday !== undefined) {
          const tier = await this.getUserTier();
          const limit = tier === 'premium' ? 500 : 10;
          const usage = limit - data.remainingToday;

          chrome.storage.local.set({
            subscription: {
              status: tier,
              usage: usage,
              limit: limit,
              remaining: data.remainingToday
            }
          });
        }

        // Check if response might be truncated
        let explanation = data.explanation;
        if (!explanation.trim().endsWith('.') && !explanation.trim().endsWith('!')) {
          console.warn('Response may be truncated');
          explanation += '\n\n_(Response may be incomplete - try a shorter selection)_';
        }

        this.showExplanation(explanation);
      } else {
        console.error('API error:', data);

        // Special handling for daily limit reached
        if (response.status === 429 && data.error === 'Daily limit reached') {
          this.showLimitReached(data.message);
        } else {
          this.showError(data.error || data.message || 'Failed to get explanation');
        }
      }

    } catch (error) {
      console.error('Fetch error:', error);

      if (error.message.includes('fetch') || error.name === 'TypeError') {
        this.showError('Unable to connect to backend server. Please try again.');
      } else if (error.name === 'TimeoutError') {
        this.showError('Request timed out. Try again.');
      } else {
        this.showError('Error: ' + error.message);
      }
    }
  }

  showLoading() {
    this.hideTooltip();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'math-ai-tooltip loading';
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <button class="tooltip-close">×</button>
      </div>
      <div class="tooltip-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Generating explanation...</p>
      </div>
    `;

    // Fixed position bottom-right
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.right = '20px';
    this.tooltip.style.bottom = '20px';
    this.tooltip.style.zIndex = '2147483647';
    this.tooltip.style.maxWidth = '400px';

    document.body.appendChild(this.tooltip);

    this.tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
      this.hideTooltip();
    });
  }

  showExplanation(explanation) {
    this.hideTooltip();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'math-ai-tooltip';
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <button class="tooltip-close">×</button>
      </div>
      <div class="tooltip-content">
        ${this.formatExplanation(explanation)}
      </div>
    `;

    // Fixed position bottom-right
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.right = '20px';
    this.tooltip.style.bottom = '20px';
    this.tooltip.style.zIndex = '2147483647';
    this.tooltip.style.maxWidth = '500px';
    this.tooltip.style.maxHeight = '600px';

    document.body.appendChild(this.tooltip);

    // Render LaTeX with KaTeX
    if (typeof window.katex !== 'undefined') {
      const content = this.tooltip.querySelector('.tooltip-content');
      this.renderMath(content);
    }

    this.tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
      this.hideTooltip();
    });

    // ESC to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideTooltip();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  renderMath(element) {
    // Use KaTeX auto-render for proper LaTeX rendering
    if (typeof window.renderMathInElement !== 'undefined') {
      try {
        // Clean up any broken LaTeX delimiters first
        let html = element.innerHTML;

        // Convert any display math to inline math (safety fallback)
        html = html.replace(/\\\[/g, '\\(');
        html = html.replace(/\\\]/g, '\\)');
        
        // Remove incomplete LaTeX blocks
        html = html.replace(/\\\(([^\\]*)$/g, ''); // Incomplete inline block at end

        element.innerHTML = html;

        window.renderMathInElement(element, {
          delimiters: [
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false,
          errorColor: '#ef4444',
          strict: false,
          trust: false,
          macros: {}
        });
        
        console.log('LaTeX rendered successfully');
      } catch (e) {
        console.error('LaTeX rendering error:', e);
        // Don't crash - just show the raw text
      }
    } else {
      console.error('KaTeX renderMathInElement not available');
    }
  }

  showError(message) {
    console.log('Showing error:', message);
    this.hideTooltip();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'math-ai-tooltip error';
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <button class="tooltip-close">×</button>
      </div>
      <div class="tooltip-content">
        <div class="error-icon">⚠️</div>
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;

    // Fixed position bottom-right
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.right = '20px';
    this.tooltip.style.bottom = '20px';
    this.tooltip.style.zIndex = '2147483647';
    this.tooltip.style.maxWidth = '400px';

    document.body.appendChild(this.tooltip);

    this.tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
      this.hideTooltip();
    });

    // ESC to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideTooltip();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Auto-hide error after 8 seconds
    setTimeout(() => {
      this.hideTooltip();
    }, 8000);
  }

  showLimitReached(message) {
    console.log('Showing limit reached:', message);
    this.hideTooltip();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'math-ai-tooltip limit-reached';
    this.tooltip.innerHTML = `
      <div class="tooltip-header">
        <button class="tooltip-close">×</button>
      </div>
      <div class="tooltip-content" style="text-align: center; padding: 28px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="width: 48px; height: 48px; margin: 0 auto 16px; background: #111827; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 17px; font-weight: 600;">
          Daily Limit Reached
        </h2>
        <p style="color: #374151; margin: 0 0 18px 0; font-size: 14px; line-height: 1.5;">
          ${this.escapeHtml(message)}
        </p>
        <div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 4px; padding: 14px; margin-bottom: 18px; text-align: left;">
          <p style="color: #111827; margin: 0 0 10px 0; font-size: 13px; font-weight: 600;">
            Premium Features
          </p>
          <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.7;">
            <li>500 queries per day</li>
            <li>Advanced mathematical analysis</li>
            <li>Priority support</li>
            <li>Ad-free experience</li>
          </ul>
        </div>
        <button id="upgradeLimitBtn" style="
          background: #111827;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s ease;
        " onmouseover="this.style.background='#1f2937'"
           onmouseout="this.style.background='#111827'">
          Upgrade to Premium — $2.99/month
        </button>
        <p style="color: #6b7280; margin: 12px 0 0 0; font-size: 12px;">
          Limit resets daily at 00:00 UTC
        </p>
      </div>
    `;

    // Fixed position bottom-right
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.right = '20px';
    this.tooltip.style.bottom = '20px';
    this.tooltip.style.zIndex = '2147483647';
    this.tooltip.style.maxWidth = '450px';
    this.tooltip.style.maxHeight = '600px';

    document.body.appendChild(this.tooltip);

    // Close button
    this.tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
      this.hideTooltip();
    });

    // Upgrade button - opens Stripe checkout
    const upgradeBtn = this.tooltip.querySelector('#upgradeLimitBtn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', async () => {
        try {
          this.hideTooltip();

          // Get user ID
          const userId = await this.getUserId();

          // Create checkout session
          const response = await fetch(`${this.API_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              plan: 'monthly'
            })
          });

          const data = await response.json();

          if (response.ok && data.url) {
            // Open Stripe checkout in new tab
            window.open(data.url, '_blank');
          } else {
            console.error('Checkout session creation failed:', data);
            const errorMessage = data.error || 'Failed to create checkout session. Please try again.';
            const errorDetails = data.details ? ` (${data.details})` : '';
            this.showError(errorMessage + errorDetails);
          }
        } catch (error) {
          console.error('Upgrade error:', error);
          this.showError('Failed to connect to payment server. Please try again.');
        }
      });
    }

    // ESC to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideTooltip();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  formatExplanation(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');

    if (!text.startsWith('<p>')) {
      text = '<p>' + text + '</p>';
    }

    return text;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async checkUsageLimit() {
    // Fetch latest subscription data from backend
    try {
      const userId = await this.getUserId();
      const response = await fetch(`${this.API_URL}/api/subscription/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const tier = data.tier;
        const usage = data.usage;
        const limit = data.limit;
        const remaining = data.remaining;

        console.log(`Usage check from backend: ${usage}/${limit} (${tier} tier), remaining: ${remaining}`);

        // Update local storage
        chrome.storage.local.set({
          subscription: {
            status: tier,
            usage: usage,
            limit: limit,
            remaining: remaining
          }
        });

        // Check if limit is reached
        if (remaining <= 0) {
          this.showLimitReached(
            tier === 'free'
              ? `You have reached your daily limit of ${limit} explanations. Upgrade to Premium for 500 explanations per day.`
              : `You have reached your daily limit of ${limit} explanations. Your usage limit will reset at 00:00 UTC.`
          );
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error('Error checking usage limit:', error);
    }

    // Fallback to cached data if fetch fails
    return new Promise((resolve) => {
      chrome.storage.local.get(['subscription'], (result) => {
        const subscription = result.subscription || { status: 'free', usage: 0, limit: 10, remaining: 10 };
        const tier = subscription.status || 'free';
        const remaining = subscription.remaining || 0;
        const limit = subscription.limit || 10;

        console.log(`Client-side usage check (cached): remaining ${remaining}/${limit} (${tier} tier)`);

        if (remaining <= 0) {
          this.showLimitReached(
            tier === 'free'
              ? `You have reached your daily limit of ${limit} explanations. Upgrade to Premium for 500 explanations per day.`
              : `You have reached your daily limit of ${limit} explanations. Your usage limit will reset at 00:00 UTC.`
          );
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  async getUserTier() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['subscription'], (result) => {
        const subscription = result.subscription || { status: 'free' };
        resolve(subscription.status || 'free');
      });
    });
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
}

// Initialize - only create one instance
if (!window.mathNotationAI) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.mathNotationAI) {
        window.mathNotationAI = new MathNotationAI();
      }
    });
  } else {
    window.mathNotationAI = new MathNotationAI();
  }
}
