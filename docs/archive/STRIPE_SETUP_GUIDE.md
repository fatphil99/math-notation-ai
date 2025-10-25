# 🎯 Complete Stripe Integration Guide

## Part 1: Stripe Account Setup (15 minutes)

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" → Sign up
3. Enter your email, create password
4. Fill in business details:
   - Business type: Individual (or LLC if you have one)
   - Business name: Your name or company
   - Country: United States (or your country)
5. **Important**: Verify your email

### Step 2: Get Your API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal"
3. Copy both keys - we'll use them soon

> ⚠️ These are TEST keys. After launch, you'll switch to LIVE keys.

### Step 3: Create Your 3 Products

#### Product 1: Monthly Subscription ($2.99/month)

1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Add product"
3. Fill in:
   - **Name**: Math Notation AI - Monthly
   - **Description**: Unlimited math explanations, billed monthly
   - **Pricing model**: Standard pricing
   - **Price**: $2.99 USD
   - **Billing period**: Monthly
   - **Recurring**: Yes
4. Click "Save product"
5. **Copy the Price ID** (looks like `price_xxxxx`) - You'll need this!

#### Product 2: Annual Subscription ($24.99/year)

1. Click "+ Add product" again
2. Fill in:
   - **Name**: Math Notation AI - Annual
   - **Description**: Unlimited math explanations, billed yearly (save 30%)
   - **Pricing model**: Standard pricing
   - **Price**: $24.99 USD
   - **Billing period**: Yearly
   - **Recurring**: Yes
3. Click "Save product"
4. **Copy the Price ID** (looks like `price_yyyyy`)

#### Product 3: Lifetime Access ($39.99 one-time)

1. Click "+ Add product" again
2. Fill in:
   - **Name**: Math Notation AI - Lifetime
   - **Description**: Unlimited math explanations, pay once forever
   - **Pricing model**: Standard pricing
   - **Price**: $39.99 USD
   - **Billing period**: One time
   - **Recurring**: No
3. Click "Save product"
4. **Copy the Price ID** (looks like `price_zzzzz`)

### Step 4: Create Checkout Links

For each product:

1. Go to https://dashboard.stripe.com/test/payment-links
2. Click "+ New"
3. Select your product (Monthly/Annual/Lifetime)
4. Configure:
   - **Collect customer information**: Email (required)
   - **After payment**: Redirect to a custom URL
   - **Success URL**: We'll create this later
5. Click "Create link"
6. **Copy the Checkout URL** (looks like `https://buy.stripe.com/test_xxxxx`)

Repeat for all 3 products.

---

## Part 2: Database Setup (10 minutes)

### Option A: MongoDB Atlas (Recommended - FREE)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier available)
3. Create a free cluster:
   - Cloud: AWS
   - Region: Closest to you
   - Tier: M0 (FREE)
4. Create database user:
   - Username: `mathnotationai`
   - Password: Generate strong password
   - Save credentials!
5. Whitelist IP addresses:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allow all - for development)
6. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

**Your connection string:**
```
mongodb+srv://mathnotationai:<password>@cluster0.xxxxx.mongodb.net/mathnotationai?retryWrites=true&w=majority
```

Save this! We'll use it in the backend.

### Option B: PostgreSQL on Railway (Alternative)

1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Provision PostgreSQL
4. Copy the connection string from "Connect" tab

---

## Part 3: Backend Code (Next Steps)

I'm creating updated backend files for you with:
- ✅ Stripe integration
- ✅ MongoDB database
- ✅ Webhook handler
- ✅ User subscription management
- ✅ License verification

Continue to the next files...

---

## 📝 Summary - Save These Values:

Create a file called `.env` in your backend folder with:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (we'll get this later)

# Price IDs
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_yyyyy
STRIPE_PRICE_LIFETIME=price_zzzzz

# Database
MONGODB_URI=mongodb+srv://mathnotationai:password@cluster0.xxxxx.mongodb.net/mathnotationai

# OpenAI (existing)
OPENAI_API_KEY=your_existing_key

# Server
PORT=3000
NODE_ENV=development
```

Replace all the `xxxxx`, `yyyyy`, `zzzzz` values with your actual keys!

---

## ⏭️ Next Steps:

1. ✅ Complete Stripe setup above
2. ✅ Create MongoDB database
3. ✅ Save all keys to `.env` file
4. ⏳ I'll create the updated backend code
5. ⏳ Update frontend with pricing UI
6. ⏳ Set up webhooks
7. ⏳ Test the flow

**Time to complete: ~30-45 minutes total**
