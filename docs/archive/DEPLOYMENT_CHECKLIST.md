# 🚀 Chrome Web Store Deployment Checklist

## ✅ Phase 1: Code & Payment Setup

### 1. Payment Integration (Choose ONE)

**Option A: LemonSqueezy (Recommended for $7.99 one-time)**
- [ ] Create account at https://lemonsqueezy.com
- [ ] Create product: "Math Notation AI Premium" - $7.99
- [ ] Get product ID and store ID
- [ ] Set up webhook for payment confirmation
- [ ] Add license key verification endpoint to backend
- [ ] Update `js/popup.js` line 177 with checkout URL
- [ ] Test payment flow end-to-end

**Option B: Stripe**
- [ ] Create Stripe account
- [ ] Create one-time payment product
- [ ] Set up Stripe Checkout
- [ ] Add webhook for `checkout.session.completed`
- [ ] Create backend endpoint to verify purchases
- [ ] Update popup.js with Stripe checkout URL

**Option C: Gumroad (Simplest)**
- [ ] Create Gumroad account
- [ ] Create product: $7.99 one-time
- [ ] Get license key API
- [ ] Add verification to your extension
- [ ] Update popup.js with Gumroad link

### 2. Backend Deployment

- [ ] Choose hosting: Railway / Vercel / DigitalOcean / Google Cloud Run
- [ ] Deploy backend server
- [ ] Get production URL (e.g., `https://math-ai.railway.app`)
- [ ] Update `js/content.js` line 7: `this.API_URL = 'YOUR_PRODUCTION_URL'`
- [ ] Update `manifest.json` host_permissions with production URL
- [ ] Set environment variables on hosting platform:
  - `OPENAI_API_KEY`
  - `PORT=3000`
  - `NODE_ENV=production`
- [ ] Test production API endpoint
- [ ] Remove localhost URLs from manifest

### 3. License Verification System

Add this endpoint to your backend:

```javascript
// POST /api/verify-license
app.post('/api/verify-license', async (req, res) => {
  const { licenseKey, userId } = req.body;

  // Verify with LemonSqueezy/Stripe/Gumroad API
  const isValid = await verifyLicense(licenseKey);

  if (isValid) {
    // Store in database: userId -> premium
    res.json({ tier: 'premium', valid: true });
  } else {
    res.json({ tier: 'free', valid: false });
  }
});
```

Add license activation to extension (new file `js/license.js`):

```javascript
async function activateLicense(licenseKey) {
  const userId = await getUserId();
  const response = await fetch(`${API_URL}/api/verify-license`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey, userId })
  });

  const data = await response.json();
  if (data.valid) {
    chrome.storage.local.set({ tier: 'premium', licenseKey });
    alert('Premium activated! 🎉');
  } else {
    alert('Invalid license key');
  }
}
```

---

## ✅ Phase 2: Legal & Compliance

### 4. Privacy Policy (REQUIRED)

Create `privacy-policy.html` and host it publicly. Must include:

```markdown
# Privacy Policy for Math Notation AI

Last updated: [DATE]

## What We Collect
- Anonymous usage statistics (total lookups)
- User-generated content (math equations you select)
- No personal data, emails, or browsing history

## How We Use Data
- Selected math content is sent to OpenAI API for explanations
- Usage counts stored locally in your browser
- No data sold or shared with third parties

## Data Storage
- All data stored locally on your device
- Server only processes requests temporarily
- No long-term data retention

## Third-Party Services
- OpenAI API for AI explanations
- [Payment Provider] for purchases

## Contact
Email: your-email@example.com
```

- [ ] Create privacy policy
- [ ] Host at publicly accessible URL
- [ ] Add link to manifest.json

### 5. Terms of Service

- [ ] Create terms of service
- [ ] Include refund policy
- [ ] Host publicly
- [ ] Link from extension

---

## ✅ Phase 3: Chrome Web Store Assets

### 6. Required Images

**Store Icon (Required)**
- [ ] 128x128px PNG
- [ ] Already have: `icons/icon128.png` ✓

**Screenshots (3-5 required, 1280x800 or 1920x1280)**
- [ ] Screenshot 1: Extension in action (selecting math)
- [ ] Screenshot 2: Explanation tooltip
- [ ] Screenshot 3: Popup showing free tier
- [ ] Screenshot 4: Premium features
- [ ] Screenshot 5: Complex equation example

**Promotional Images**
- [ ] Small tile: 440x280px
- [ ] Large tile: 920x680px
- [ ] Marquee: 1400x560px

### 7. Store Listing Content

**Title (Max 45 chars)**
```
Math Notation AI - Instant Explanations
```

**Short Description (Max 132 chars)**
```
Screenshot any math equation for instant AI-powered explanations. Perfect for students, teachers, and professionals.
```

**Detailed Description (Max 16,000 chars)**
```markdown
📐 **Math Notation AI** - Your Personal Math Assistant

Struggling to understand complex mathematical notation? Just press Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows), select any math content on any webpage, and get instant AI-powered explanations!

✨ **Key Features:**

• **Screenshot & Explain**: Select any math equation, symbol, or formula
• **AI-Powered**: Uses advanced AI (GPT-4) for accurate explanations
• **LaTeX Rendering**: Beautiful mathematical notation display
• **Works Everywhere**: Any website, PDF, or online document
• **Instant Understanding**: Get explanations in seconds

🎓 **Perfect For:**

- Students studying calculus, linear algebra, statistics
- Professors reviewing complex papers
- Engineers working with technical documentation
- Anyone learning mathematics

💎 **Free vs Premium:**

**Free Tier:**
• 5 total explanations
• Full feature access
• Try before you buy

**Premium ($7.99 one-time):**
• Unlimited explanations
• Lifetime access
• No subscription
• Priority support

🔒 **Privacy First:**
• No data collection
• Explanations processed securely
• Works offline for stored results

🚀 **How to Use:**
1. Install the extension
2. Press Cmd+Shift+Z (Mac) or Ctrl+Shift+Z
3. Drag to select math content
4. Get instant AI explanation!

**Support:** your-email@example.com
**Privacy Policy:** [your-privacy-url]
```

**Category**
- [ ] Select: "Productivity" or "Education"

---

## ✅ Phase 4: Manifest Updates

### 8. Update manifest.json

```json
{
  "name": "Math Notation AI",
  "version": "1.0.0",
  "description": "Screenshot math equations for instant AI explanations. Perfect for students & professionals.",

  // Remove unused permissions
  "permissions": [
    "storage",
    "activeTab"
    // REMOVED: "clipboardRead" - not used
  ],

  // Add privacy policy
  "homepage_url": "https://your-website.com",

  // Update host_permissions with production URL
  "host_permissions": [
    "https://your-backend-url.com/*"
  ]
}
```

- [ ] Remove `clipboardRead` permission
- [ ] Remove localhost from host_permissions
- [ ] Add production API URL
- [ ] Add homepage_url
- [ ] Increment version if resubmitting

---

## ✅ Phase 5: Testing

### 9. Final Testing Checklist

- [ ] Test fresh install (clear all data first)
- [ ] Verify free tier limits (exactly 5 lookups)
- [ ] Test payment flow completely
- [ ] Verify license activation works
- [ ] Test on multiple websites (Wikipedia, Khan Academy, etc)
- [ ] Test LaTeX rendering
- [ ] Test error messages
- [ ] Test popup UI (free & premium)
- [ ] Check console for errors
- [ ] Test keyboard shortcut (Cmd+Shift+Z)
- [ ] Verify ESC key closes tooltip
- [ ] Test X button closes tooltip
- [ ] Test on different browsers (Chrome, Edge, Brave)

---

## ✅ Phase 6: Chrome Web Store Submission

### 10. Developer Account

- [ ] Create Chrome Web Store Developer account
- [ ] Pay $5 one-time developer fee
- [ ] Verify your email

### 11. Upload Extension

1. [ ] Zip your extension folder:
```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai"
zip -r math-notation-ai.zip . -x "*/node_modules/*" "*.git/*" "backend/*" "*.DS_Store" "*.log"
```

2. [ ] Go to: https://chrome.google.com/webstore/devconsole
3. [ ] Click "New Item"
4. [ ] Upload `math-notation-ai.zip`
5. [ ] Fill out store listing
6. [ ] Upload all images
7. [ ] Select category: Education
8. [ ] Add privacy policy URL
9. [ ] Submit for review

---

## ✅ Phase 7: Post-Launch

### 12. After Approval

- [ ] Test live version from Chrome Web Store
- [ ] Set up Google Analytics (optional)
- [ ] Create support email/system
- [ ] Monitor reviews
- [ ] Set up error tracking (Sentry)
- [ ] Create changelog for future updates

---

## 📋 Quick Links

- Chrome Web Store Dashboard: https://chrome.google.com/webstore/devconsole
- LemonSqueezy: https://lemonsqueezy.com
- Stripe: https://stripe.com
- Gumroad: https://gumroad.com
- Railway: https://railway.app
- Vercel: https://vercel.com

---

## ⏱️ Timeline

- Payment setup: 1-2 days
- Backend deployment: 1 day
- Legal docs: 1 day
- Assets creation: 1-2 days
- Testing: 1 day
- Chrome review: **2-7 days** (average 3 days)

**Total: ~7-14 days**

---

## 💰 Estimated Costs

- Chrome Web Store fee: $5 (one-time)
- Backend hosting: $5-10/month (Railway/Vercel)
- Domain (optional): $12/year
- **Total monthly: ~$5-10**

---

## 🆘 Common Issues

**Issue: "Manifest permissions too broad"**
- Remove unused permissions
- Justify each permission in review notes

**Issue: "Privacy policy missing"**
- Must be publicly accessible
- Must match actual data usage

**Issue: "Screenshots unclear"**
- Use 1920x1280 resolution
- Show actual extension UI
- Add annotations/arrows

---

## ✅ Ready to Deploy?

Make sure you've completed ALL items in Phases 1-3 before submitting!
