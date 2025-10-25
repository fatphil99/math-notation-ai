# Chrome Web Store Submission Checklist

## Pre-Submission Requirements

### 1. Extension Files
- [x] manifest.json properly configured
- [x] All permissions justified and minimal
- [x] Icons in required sizes (16x16, 48x48, 128x128)
- [ ] Test extension in incognito mode
- [ ] Test extension with fresh install (no cached data)

### 2. Privacy & Security
- [ ] Create Privacy Policy (REQUIRED for extensions collecting data)
- [ ] Host privacy policy on accessible URL
- [ ] Add privacy policy URL to manifest.json
- [ ] Disclose what data is collected (userId, usage stats, emails)
- [ ] Explain how Stripe handles payment data
- [ ] No sensitive API keys in code (✓ already using env variables)

### 3. Store Listing Assets

#### Required Screenshots (1280x800 or 640x400)
- [ ] Screenshot 1: Extension popup showing free tier
- [ ] Screenshot 2: Extension in action (selecting math notation)
- [ ] Screenshot 3: Explanation tooltip displayed
- [ ] Screenshot 4: Premium interface
- [ ] Screenshot 5: Example on real website (Wikipedia, Khan Academy, etc.)

#### Store Listing Copy
- [ ] Detailed description (min 100 characters)
- [ ] Short description/tagline (max 132 characters)
- [ ] Category: Productivity or Education
- [ ] Language: English

#### Promotional Images (Optional but Recommended)
- [ ] Small tile: 440x280
- [ ] Marquee: 1400x560

### 4. Technical Requirements

#### manifest.json Review
```json
{
  "manifest_version": 3,  ✓
  "name": "Math Notation AI",  ✓
  "version": "1.0.0",  ✓
  "description": "...",  ✓
  "permissions": [...],  ✓ (minimal)
  "host_permissions": [...],  ⚠️ Review if all are needed
  "content_scripts": [...],  ✓
  "icons": {...}  ✓
}
```

#### Code Review
- [x] No obfuscated code
- [x] No remote code execution
- [x] All external scripts bundled locally (KaTeX, Tesseract)
- [x] Proper error handling
- [x] No console.log in production (optional cleanup)

### 5. Testing Checklist

#### Functionality
- [ ] Test on Chrome (stable channel)
- [ ] Test keyboard shortcut (Cmd/Ctrl+Shift+Z)
- [ ] Test on multiple websites (Wikipedia, Khan Academy, Stack Exchange)
- [ ] Test free tier limit (10 queries)
- [ ] Test payment flow (use test card if still testing)
- [ ] Test premium upgrade activation
- [ ] Test error states (network failure, API down)

#### Browser Compatibility
- [ ] Chrome (stable)
- [ ] Chrome (beta) - optional
- [ ] Edge (Chromium) - optional but recommended

#### User Scenarios
- [ ] New user first install
- [ ] User reaches free limit
- [ ] User upgrades to premium
- [ ] User uses premium features
- [ ] User with slow internet connection
- [ ] User on mobile device (if applicable)

### 6. Legal & Compliance

#### Required Documents
- [ ] **Privacy Policy** (CRITICAL - extension will be rejected without this)
- [ ] Terms of Service (recommended)
- [ ] Refund policy (if offering refunds)

#### Privacy Policy Must Include:
- What data is collected (userId, usage counts, email via Stripe)
- How data is used (service functionality, subscription management)
- Third-party services (OpenAI, Stripe, MongoDB, Railway)
- Data retention policy
- User rights (access, deletion)
- Contact information

#### Payment Disclosure
- [ ] Clearly state pricing ($2.99/month)
- [ ] Explain what premium includes
- [ ] Mention Stripe as payment processor
- [ ] Link to Terms of Service in checkout

### 7. Chrome Web Store Developer Account
- [ ] Google account created
- [ ] One-time developer registration fee paid ($5)
- [ ] Developer account verified

### 8. Post-Submission Preparation

#### Support Infrastructure
- [ ] Support email address (add to manifest.json)
- [ ] Way to handle user feedback
- [ ] Process for bug reports
- [ ] Stripe dashboard monitoring

#### Monitoring
- [ ] Railway logs configured
- [ ] Error tracking setup
- [ ] Usage analytics (optional)
- [ ] Stripe webhook monitoring

### 9. Known Issues to Address

#### Before Submission
- [ ] Remove all console.log statements (or minimize to errors only)
- [ ] Verify all Railway environment variables are set:
  - STRIPE_SECRET_KEY
  - STRIPE_MONTHLY_PRICE_ID
  - STRIPE_YEARLY_PRICE_ID (if offering)
  - STRIPE_WEBHOOK_SECRET
  - MONGODB_URI
  - OPENAI_API_KEY
- [ ] Test webhook endpoint is accessible
- [ ] Verify success/cancel URLs work

#### host_permissions Review
Current permissions in manifest.json:
```json
"host_permissions": [
  "http://localhost:3000/*",  // ⚠️ Remove for production
  "https://*.railway.app/*",   // ✓ Keep
  "https://*.vercel.app/*",    // ⚠️ Remove if not using
  "https://*.ondigitalocean.app/*",  // ⚠️ Remove if not using
  "https://*.run.app/*"        // ⚠️ Remove if not using
]
```

Recommended for production:
```json
"host_permissions": [
  "https://math-notation-ai-backend-production.up.railway.app/*"
]
```

### 10. Recommended Improvements

#### Before Launch
- [ ] Add "What's New" section for updates
- [ ] Create simple landing page/website
- [ ] Set up support email forwarding
- [ ] Prepare response templates for common questions

#### Optional Enhancements
- [ ] Add yearly subscription option
- [ ] Add settings page for user preferences
- [ ] Add history of recent queries
- [ ] Add export functionality
- [ ] Add dark mode support

### 11. Submission Steps

1. **Prepare ZIP file**
   ```bash
   # Exclude these files:
   - node_modules/
   - backend/
   - docs/
   - test files
   - .git/
   - *.md files (except necessary ones)
   ```

2. **Upload to Chrome Web Store**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Click "New Item"
   - Upload ZIP
   - Fill out store listing
   - Add privacy policy URL
   - Submit for review

3. **Review Timeline**
   - Initial review: 1-3 days typically
   - May request changes
   - Updates also require review

### 12. Critical Issues Found

#### MUST FIX:
1. **Privacy Policy Required** - Extension collects user data (userId, email, usage)
2. **host_permissions Too Broad** - Should only include actual backend URL
3. **Support Email Missing** - Should add to manifest.json

#### SHOULD FIX:
1. Remove localhost from host_permissions
2. Add more detailed description
3. Clean up console.log statements
4. Add explicit Stripe data handling disclosure

---

## Quick Launch Command

After fixes above, create production build:

```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai"

# Create clean directory
mkdir -p build
cp -r css icons js lib manifest.json popup.html build/

# Create ZIP
cd build
zip -r ../math-notation-ai-v1.0.0.zip .
cd ..

# Upload math-notation-ai-v1.0.0.zip to Chrome Web Store
```

---

## Post-Launch Monitoring

### Week 1
- [ ] Monitor Stripe for subscriptions
- [ ] Check Railway logs for errors
- [ ] Respond to reviews quickly
- [ ] Monitor usage patterns

### Ongoing
- [ ] Regular security updates
- [ ] Dependency updates
- [ ] Feature improvements based on feedback
- [ ] Maintain at least 4.0+ star rating

---

## Emergency Contacts

- **Railway Support**: https://railway.app/help
- **Stripe Support**: https://support.stripe.com
- **Chrome Web Store Support**: https://support.google.com/chrome_webstore/
- **MongoDB Support**: https://support.mongodb.com

---

## Resources

- Chrome Web Store Developer Documentation: https://developer.chrome.com/docs/webstore/
- Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Stripe Subscription Best Practices: https://stripe.com/docs/billing/subscriptions/overview

