# 🚀 Installation & Setup Guide

## Complete Setup: Stripe + Database + Deployment

**Time to complete: 1-2 hours**

---

## Step 1: Install Backend Dependencies (5 mins)

```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai/backend"

# Install new packages (Stripe + MongoDB)
npm install stripe mongoose

# Verify installation
npm list stripe mongoose
```

---

## Step 2: Set Up MongoDB (10 mins)

### Option A: MongoDB Atlas (FREE - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up → Create Free Cluster
3. Choose: AWS / Free Tier (M0) / Closest region
4. Create Database User:
   - Username: `mathaiuser`
   - Password: Generate & save it!
5. Network Access:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
6. Get Connection String:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

**Your connection string:**
```
mongodb+srv://mathaiuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mathnotationai?retryWrites=true&w=majority
```

Save this!

---

## Step 3: Set Up Stripe (15 mins)

Follow `STRIPE_SETUP_GUIDE.md` to:

1. Create Stripe account
2. Get API keys (test mode)
3. Create 3 products:
   - Monthly: $2.99/month
   - Annual: $24.99/year
   - Lifetime: $39.99 one-time
4. Save all Price IDs

You should have:
- ✅ Secret Key (`sk_test_...`)
- ✅ Publishable Key (`pk_test_...`)
- ✅ Monthly Price ID (`price_...`)
- ✅ Annual Price ID (`price_...`)
- ✅ Lifetime Price ID (`price_...`)

---

## Step 4: Configure Environment Variables (5 mins)

Create/update `/backend/.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx  # Get this in Step 6
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ANNUAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_LIFETIME=price_xxxxxxxxxxxxx

# MongoDB
MONGODB_URI=mongodb+srv://mathaiuser:PASSWORD@cluster0.xxxxx.mongodb.net/mathnotationai?retryWrites=true&w=majority

# OpenAI (your existing key)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Server
PORT=3000
NODE_ENV=development

# URLs (for now, use these)
SUCCESS_URL=https://google.com?success=true
CANCEL_URL=https://google.com?canceled=true
```

**Replace ALL the `xxxxx` values with your actual keys!**

---

## Step 5: Replace Backend Server (2 mins)

```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai/backend"

# Backup old server
mv server.js server-old.js

# Use new server with Stripe
mv server-with-stripe.js server.js

# Create models directory
mkdir -p models
# models/User.js is already created
```

---

## Step 6: Set Up Stripe Webhooks (10 mins)

### For Local Testing (Use Stripe CLI):

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

4. Copy the webhook secret (starts with `whsec_...`)
5. Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### For Production (After deployment):

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://your-production-url.com/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Add endpoint
6. Copy signing secret → Update `.env`

---

## Step 7: Start Backend Server (2 mins)

```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai/backend"

# Start server
node server.js
```

You should see:
```
╔═══════════════════════════════════════╗
║   Math Notation AI - Backend Server   ║
║   Status: Running                      ║
║   Port: 3000                           ║
║   Database: Connected                  ║
╚═══════════════════════════════════════╝
✅ MongoDB connected
```

If you see "Database: Connected" - you're good! ✅

---

## Step 8: Update Frontend (5 mins)

### Update popup.js:

```bash
cd "/Users/philipshin/Desktop/Chrome Extensions/math notation ai"

# Backup old popup
mv js/popup.js js/popup-old.js

# Use new Stripe-enabled popup
mv js/popup-with-stripe.js js/popup.js
```

### Configure Stripe Price IDs:

Edit `js/popup.js` lines 7-11:

```javascript
this.STRIPE_PRICES = {
  monthly: 'price_xxxxx',   // Your monthly price ID
  annual: 'price_yyyyy',    // Your annual price ID
  lifetime: 'price_zzzzz'   // Your lifetime price ID
};
```

Replace with your actual Stripe Price IDs from Step 3!

---

## Step 9: Add CSS for Pricing Cards (5 mins)

Add to `css/popup.css` at the bottom:

```css
/* Pricing Cards */
.pricing-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  margin: 16px 0 12px 0;
  color: #1f2937;
}

.pricing-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.plan-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  color: white;
  text-align: left;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.plan-card.popular {
  border: 3px solid #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: 12px;
  background: #fbbf24;
  color: #78350f;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.plan-header {
  margin-bottom: 12px;
}

.plan-name {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
}

.plan-price {
  font-size: 28px;
  font-weight: 800;
  margin: 4px 0;
}

.plan-period {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.8;
}

.plan-savings {
  font-size: 12px;
  color: #fbbf24;
  font-weight: 600;
  margin-top: 4px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plan-feature {
  font-size: 13px;
  opacity: 0.9;
}

.manage-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.manage-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.premium-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  color: #1f2937;
}
```

---

## Step 10: Test Locally (10 mins)

### Terminal 1: Start backend
```bash
cd backend
node server.js
```

### Terminal 2: Start Stripe webhook forwarding
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

### Chrome:
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension folder
5. Click extension icon
6. You should see:
   - Free tier: 0 / 5 used
   - 3 pricing cards
7. Click on a pricing card
8. Should open Stripe checkout page ✅

### Test Payment (Test Mode):
1. Click "Monthly" plan
2. On Stripe checkout, use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
3. Complete payment
4. Check Terminal 2 for webhook event:
   ```
   ✅ Checkout completed
   ✅ User xxx upgraded to monthly
   ```
5. Reload extension popup
6. Should show "MONTHLY" premium status ✅

---

## Step 11: Deploy to Production (30 mins)

### Option A: Railway (Recommended)

1. Push backend to GitHub:
```bash
cd backend
git init
git add .
git commit -m "Backend with Stripe integration"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Deploy to Railway:
   - Go to https://railway.app
   - Sign in with GitHub
   - New Project → Deploy from GitHub
   - Select your backend repo
   - Add environment variables (all from your `.env`)
   - Deploy

3. Get production URL (e.g., `https://math-ai.up.railway.app`)

4. Update extension:
   - `js/popup.js` line 12: Update `API_URL`
   - `js/content.js` line 7: Update `API_URL`
   - `manifest.json`: Update `host_permissions`

5. Set up production webhook:
   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-railway-url.com/api/webhook`
   - Copy webhook secret → Update Railway env var

---

## Step 12: Switch to Live Mode (When Ready to Launch)

1. Stripe Dashboard → Toggle "View test data" to OFF
2. Get LIVE API keys
3. Create same 3 products in LIVE mode
4. Update all environment variables with LIVE keys
5. Redeploy backend
6. Update extension
7. Submit to Chrome Web Store

---

## ✅ Verification Checklist

Before deploying:

- [ ] Backend starts without errors
- [ ] MongoDB shows "Connected"
- [ ] Can open extension popup
- [ ] See 3 pricing cards
- [ ] Clicking card opens Stripe checkout
- [ ] Test payment completes
- [ ] Webhook receives event
- [ ] User upgraded in database
- [ ] Popup shows premium status
- [ ] Can make unlimited API calls

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Check MONGODB_URI in .env
- Verify password has no special characters (or URL-encode them)
- Check IP whitelist (should be 0.0.0.0/0)

### "Stripe checkout doesn't open"
- Check Price IDs in popup.js
- Check browser console for errors
- Verify STRIPE_SECRET_KEY in .env

### "Webhook not receiving events"
- Check `stripe listen` is running
- Verify STRIPE_WEBHOOK_SECRET in .env
- Check backend logs for webhook errors

### "User not upgraded after payment"
- Check webhook events in Stripe Dashboard
- Verify webhook secret matches
- Check backend logs for errors
- Look for user in MongoDB

---

## 📞 Need Help?

Check the logs:
```bash
# Backend logs
tail -f backend/logs/server.log

# Stripe webhook events
https://dashboard.stripe.com/test/logs

# MongoDB data
https://cloud.mongodb.com → Browse Collections
```

---

**You're all set! Time to launch! 🚀**
