# Complete Setup Guide - Math Notation AI

## 🎯 Goal
Build and deploy a profitable Chrome extension that explains math notation using AI in 48 hours.

## 📋 Prerequisites

### Required
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Chrome Browser**
- **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))
  - Cost: ~$5 for 40,000+ explanations
  - Need credit card, but charges are minimal

### Optional
- **Git** (for version control)
- **VS Code** (recommended editor)

---

## 🚀 Quick Start (30 Minutes)

### Step 1: Get OpenAI API Key (5 min)

1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Name it "Math Notation AI"
5. Copy the key (starts with `sk-...`)
6. **Save it immediately** - you can't see it again!

### Step 2: Setup Backend (10 min)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# On Mac/Linux:
nano .env

# On Windows:
notepad .env

# Replace 'sk-your-openai-api-key-here' with your actual key
```

**Your .env should look like:**
```
OPENAI_API_KEY=sk-proj-abc123xyz...
PORT=3000
NODE_ENV=development
```

```bash
# Start the server
npm start

# You should see:
# ╔═══════════════════════════════════════════╗
# ║  Math Notation AI - Backend Server        ║
# ║  Status: Running                           ║
# ║  Port: 3000                                ║
# ╚═══════════════════════════════════════════╝
```

✅ **Test it:** Open http://localhost:3000/health in your browser
- You should see: `{"status":"healthy", ...}`

### Step 3: Install Chrome Extension (5 min)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. You should see "Math Notation AI" in your extensions!

### Step 4: Test It! (2 min)

1. Go to https://en.wikipedia.org/wiki/Integral
2. Highlight the symbol "∫" (integral sign)
3. Wait 1-2 seconds
4. See the AI explanation appear! 🎉

---

## 🏗️ Deployment (Making It Live)

### Option A: Replit (Easiest, Free)

**Perfect for: Beginners, MVP testing**

1. Go to https://replit.com
2. Sign up (free account)
3. Create new Repl → Import from GitHub (or upload files)
4. Add `backend` folder contents
5. In "Secrets" tab:
   - Add `OPENAI_API_KEY` = your key
6. Click "Run"
7. Copy the Repl URL (like `https://your-project.username.repl.co`)
8. Update `extension/js/content.js`:
   ```javascript
   const API_URL = 'https://your-project.username.repl.co';
   ```
9. Reload extension in Chrome
10. Test again!

**Cost:** $0/month
**Uptime:** ~99% (free tier has some downtime)

### Option B: Railway (Recommended for Production)

**Perfect for: Serious deployment, better uptime**

1. Go to https://railway.app
2. Sign up with GitHub (free)
3. New Project → Deploy from GitHub
4. Select your `backend` folder
5. Add environment variables:
   - `OPENAI_API_KEY`
6. Deploy!
7. Get your public URL
8. Update extension with new URL
9. Reload extension

**Cost:** $5/month (free $5 credit initially)
**Uptime:** 99.9%

### Option C: Vercel Serverless (Advanced)

**Perfect for: Scalable, pay-per-use**

- Deploy as serverless functions
- Only pay for actual usage
- More complex setup
- See [Vercel deployment guide](https://vercel.com/docs)

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

### Basic Functionality
- [ ] Highlight "α" (alpha) → Get explanation
- [ ] Highlight "∫" (integral) → Get explanation
- [ ] Highlight "∈" (element of) → Get explanation
- [ ] Test on different websites (Wikipedia, ArXiv, Stack Exchange)

### Rate Limiting
- [ ] Make 5 requests quickly → Should work
- [ ] Make 11th request in same minute → Should be rate limited
- [ ] Wait 1 minute → Should work again

### Daily Limits
- [ ] Make 5 requests today → Should work
- [ ] Make 6th request → Should show "upgrade" message
- [ ] Check `/api/stats/your-user-id` → Should show usage

### Edge Cases
- [ ] Highlight regular text → Nothing happens (correct!)
- [ ] Highlight very long text → Nothing happens
- [ ] Server offline → Shows error message
- [ ] Invalid API key → Shows error (check server logs)

---

## 📊 Monitoring Your Costs

### Check OpenAI Usage
1. Go to https://platform.openai.com/usage
2. See your daily/monthly spend
3. Should be pennies per day initially

### Expected Costs
- 100 users, 10 lookups/day each = 1,000 lookups/day
- Cost: 1,000 × $0.00012 × 30% (after cache) = **$0.036/day**
- That's **$1.08/month** for 100 active users!

### Backend Logs
```bash
# In your backend terminal, you'll see:
{
  timestamp: '2025-10-22T...',
  userId: 'user_abc123...',
  symbol: '∫',
  tokens: 120,
  cost: '$0.000014',
  responseTime: '850ms'
}
```

---

## 🐛 Troubleshooting

### "Failed to generate explanation"
**Cause:** Backend can't connect to OpenAI
**Fix:** 
1. Check your API key in `.env`
2. Check OpenAI account has credits
3. Check server logs for specific error

### "Unable to connect to server"
**Cause:** Backend not running or wrong URL
**Fix:**
1. Ensure backend is running (`npm start`)
2. Check `API_URL` in `content.js` matches your server
3. Check CORS settings if deployed

### Extension not loading
**Cause:** Manifest or file structure issue
**Fix:**
1. Check all files are in correct locations
2. Look for errors in `chrome://extensions/` (click "Errors")
3. Try "Reload extension" button

### Too many errors in console
**Cause:** Multiple instances running
**Fix:**
1. Disable/remove old versions of extension
2. Clear browser cache
3. Restart Chrome

---

## 📈 Next Steps

### Week 1: MVP
- [x] Build basic extension
- [x] Connect to AI
- [ ] Get 10 friends to test
- [ ] Fix bugs

### Week 2: Polish
- [ ] Improve tooltip design
- [ ] Add keyboard shortcuts (optional)
- [ ] Optimize caching
- [ ] Add analytics

### Week 3-4: Monetization
- [ ] Integrate Stripe
- [ ] Add user accounts
- [ ] Build payment page
- [ ] Launch paid tier

### Month 2: Growth
- [ ] Post on Reddit (r/math, r/learnmath)
- [ ] Reach out to math YouTubers
- [ ] Add to Chrome Web Store
- [ ] Get first 100 users

---

## 💡 Pro Tips

1. **Test with real use cases**: Use actual math papers/articles
2. **Monitor costs daily**: Set up OpenAI spend alerts
3. **Start with friends**: Get feedback before public launch
4. **Cache is your friend**: 70% cache hit rate saves tons of money
5. **Keep it simple**: Don't over-engineer v1

---

## 🆘 Need Help?

**Common Resources:**
- OpenAI API Docs: https://platform.openai.com/docs
- Chrome Extension Docs: https://developer.chrome.com/docs/extensions
- Node.js Docs: https://nodejs.org/docs

**Check Your Logs:**
- Backend: Look at terminal where `npm start` is running
- Extension: Open `chrome://extensions/` → Click "background page" or "Errors"
- OpenAI: Check https://platform.openai.com/usage

---

## ✅ Success Checklist

You're ready to launch when:
- [ ] Extension loads without errors
- [ ] Can explain at least 10 different symbols
- [ ] Rate limiting works (tested)
- [ ] Daily limits work (tested)
- [ ] Tooltip looks good on light/dark backgrounds
- [ ] Works on at least 3 different websites
- [ ] Backend deployed and stable
- [ ] Monitoring costs (<$1/day initially)
- [ ] Have at least 5 test users

---

**You've got this! 🚀**

The hardest part is starting. Follow this guide step by step, and you'll have a working product in hours, not weeks.