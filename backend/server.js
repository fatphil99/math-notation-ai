// backend/server.js - Complete backend for Math Notation AI
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const OpenAI = require('openai');
const Stripe = require('stripe');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Railway proxy (required for rate limiting and client IP detection)
app.set('trust proxy', 1);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  stripeCustomerId: String,
  subscription: {
    status: { type: String, default: 'free' }, // free, premium
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean,
    plan: String // monthly, yearly
  },
  usage: {
    today: { type: Number, default: 0 },
    lastResetDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Response cache - 30 days
const cache = new NodeCache({ stdTTL: 2592000 });

// Middleware
app.use(cors());

// Webhook endpoint needs raw body - MUST come before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

app.use(express.json());

// Rate limiting - 10 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please slow down' }
});

app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cacheSize: cache.keys().length
  });
});

// Stripe: Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    let { email } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: 'userId and plan are required' });
    }

    // Email is optional - Stripe will collect it during checkout
    if (!email) {
      email = `user_${userId}@temp.mathnotationai.com`;
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      console.error(`Stripe price ID not configured for plan: ${plan}`);
      return res.status(500).json({ error: `Price ID not configured for ${plan} plan` });
    }

    console.log(`Creating checkout session for userId: ${userId}, plan: ${plan}, priceId: ${priceId}`);
    console.log(`Stripe key configured: ${!!process.env.STRIPE_SECRET_KEY}, key starts with: ${process.env.STRIPE_SECRET_KEY?.substring(0, 7)}`);

    // Get or create user
    let user = await User.findOne({ userId });
    if (!user) {
      console.log(`Creating new user with userId: ${userId}, email: ${email}`);
      user = new User({ userId, email });
      await user.save();
    } else {
      console.log(`Found existing user: ${userId}`);
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    // If we have a saved customer ID, verify it exists (handles test/live mode switch)
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Customer doesn't exist (likely switched from live to test mode)
        console.log(`Saved customer ${customerId} not found, creating new customer`);
        customerId = null;
        user.stripeCustomerId = null;
      }
    }

    // Create new customer if needed
    if (!customerId) {
      console.log(`Creating new Stripe customer for email: ${email}`);
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      customerId = customer.id;
      console.log(`Stripe customer created: ${customerId}`);
      user.stripeCustomerId = customerId;
      await user.save();
    } else {
      console.log(`Using existing Stripe customer: ${customerId}`);
    }

    // Create checkout session
    console.log(`Creating Stripe checkout session with priceId: ${priceId}`);
    
    // Use Railway backend URL for success/cancel pages
    const baseUrl = process.env.BASE_URL || 'https://math-notation-ai-backend-production.up.railway.app';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        userId,
        plan
      }
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message // Always return error details to help debug
    });
  }
});

// Stripe: Customer portal
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await User.findOne({ userId });
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: req.headers.origin || 'chrome-extension://YOUR_EXTENSION_ID',
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get user subscription status
app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findOne({ userId });
    if (!user) {
      // Create new free user
      user = new User({
        userId,
        email: 'unknown@example.com' // Should be updated on first checkout
      });
      await user.save();
    }

    // Reset daily usage if needed
    const today = new Date().toISOString().split('T')[0];
    if (user.usage.lastResetDate !== today) {
      user.usage.today = 0;
      user.usage.lastResetDate = today;
      await user.save();
    }

    const tier = user.subscription.status === 'premium' ? 'premium' : 'free';
    const limit = tier === 'premium' ? 500 : 10;

    res.json({
      tier,
      usage: user.usage.today,
      limit,
      remaining: Math.max(0, limit - user.usage.today),
      subscription: user.subscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Main explanation endpoint
app.post('/api/explain', async (req, res) => {
  try {
    const { symbol, context, userId } = req.body;

    if (!symbol || !userId) {
      return res.status(400).json({ error: 'Symbol and userId required' });
    }

    // Get or create user
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, email: 'unknown@example.com' });
      await user.save();
    }

    // Reset daily usage if needed
    const today = new Date().toISOString().split('T')[0];
    if (user.usage.lastResetDate !== today) {
      user.usage.today = 0;
      user.usage.lastResetDate = today;
      await user.save();
    }

    // Check daily limit
    const tier = user.subscription.status === 'premium' ? 'premium' : 'free';
    const limit = tier === 'premium' ? 500 : 10;

    console.log(`Usage check: ${user.usage.today}/${limit} (${tier} tier)`);

    if (user.usage.today >= limit) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message: tier === 'free'
          ? "You have reached your daily limit of 10 explanations. Upgrade to Premium for 500 explanations per day."
          : `Daily limit of ${limit} explanations reached. Your usage limit will reset at 00:00 UTC.`,
        remainingToday: 0
      });
    }

    // Check cache
    const cacheKey = `${symbol}:${context ? context.substring(0, 100) : ''}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      user.usage.today += 1;
      await user.save();
      return res.json({ ...cached, cached: true, remainingToday: limit - user.usage.today });
    }

    // Call OpenAI
    console.log(`Calling OpenAI for: ${symbol}`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a mathematics professor who excels at making complex concepts accessible to students.

Provide a pedagogically-sound explanation using this structure:

**What it means:**
One clear, jargon-free sentence explaining what this does conceptually.

**Breaking it down:**
List each symbol/component with its meaning (1 line each). For complex expressions, explain every part systematically.

**Why it matters:**
The key insight or intuition - the "aha!" moment that makes it click (1-2 sentences).

**Example:**
A concrete, fully worked example with actual numbers showing step-by-step calculation.

CRITICAL FORMATTING RULES:
- ONLY use inline LaTeX with \\( ... \\) - NEVER EVER use \\[ ... \\], $$ ... $$, or any display math delimiters
- Even for equations on their own line, use \\( ... \\) not \\[ ... \\]
- For multi-step calculations, put each step on a new line with plain text like "First, \\( step1 \\). Then, \\( step2 \\)."
- Keep LaTeX expressions simple - break complex formulas into smaller inline pieces
- Aim for 100-250 words (more for complex multi-part equations)
- ALWAYS complete your sentences - never cut off mid-explanation
- Use plain English between math expressions
- Focus on conceptual understanding, not just symbol manipulation

EXAMPLE FORMAT:

**What it means:**
\\( \\nabla \\cdot \\vec{F} \\) measures how much a vector field spreads out or converges at each point.

**Breaking it down:**
- \\( \\nabla \\cdot \\) = divergence operator (pronounced "del dot")
- \\( \\vec{F} \\) = vector field with components \\( (F_x, F_y, F_z) \\)
- Calculation: \\( \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z} \\)

**Why it matters:**
Positive divergence means flow is spreading out (like a source), negative means converging (like a sink), zero means steady flow.

**Example:**
For \\( \\vec{F} = (x, y, 0) \\), we calculate each partial derivative.

First, \\( \\frac{\\partial x}{\\partial x} = 1 \\).

Then, \\( \\frac{\\partial y}{\\partial y} = 1 \\).

Finally, \\( \\frac{\\partial 0}{\\partial z} = 0 \\).

Adding these: \\( 1 + 1 + 0 = 2 \\) everywhere, indicating constant outward flow.`
        },
        {
          role: 'user',
          content: context
            ? `Explain "${symbol}" in context: "${context}"`
            : `Explain the mathematical content: "${symbol}"`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const explanation = completion.choices[0].message.content.trim();
    const response = {
      symbol,
      explanation,
      category: inferCategory(symbol),
      timestamp: new Date().toISOString()
    };

    // Cache it
    cache.set(cacheKey, response);

    // Increment usage
    user.usage.today += 1;
    await user.save();

    // Log cost
    const cost = (completion.usage.prompt_tokens * 0.15 + completion.usage.completion_tokens * 0.60) / 1000000;
    console.log(`Cost: $${cost.toFixed(6)}, Tokens: ${completion.usage.total_tokens}`);

    res.json({ ...response, cached: false, remainingToday: limit - user.usage.today });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Webhook helper functions
async function handleCheckoutComplete(session) {
  console.log('Checkout completed:', session.id);

  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Retrieve customer and subscription details to get the real email
  const customer = await stripe.customers.retrieve(customerId);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  console.log(`Customer email from Stripe: ${customer.email}`);

  // Update user in database with real email from Stripe
  await User.findOneAndUpdate(
    { userId },
    {
      email: customer.email, // Update with real email from Stripe checkout
      stripeCustomerId: customerId,
      'subscription.status': 'premium',
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      'subscription.plan': plan,
      updatedAt: new Date()
    },
    { upsert: true }
  );

  console.log(`✅ User ${userId} upgraded to ${plan} plan with email ${customer.email}`);
}

async function handleSubscriptionChange(subscription) {
  console.log('Subscription changed:', subscription.id);

  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  const status = subscription.status === 'active' ? 'premium' : 'free';

  await User.findOneAndUpdate(
    { userId: user.userId },
    {
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      updatedAt: new Date()
    }
  );

  console.log(`✅ User ${user.userId} subscription updated: ${status}`);
}

function inferCategory(symbol) {
  if (/[α-ωΑ-Ω]/.test(symbol)) return 'Greek Letter';
  if (/[∫∂∇]/.test(symbol)) return 'Calculus';
  if (/[∈∉⊂∪∩]/.test(symbol)) return 'Set Theory';
  return 'Mathematics';
}

// TEMPORARY: Reset all users' usage to 0 (for testing)
app.post('/api/admin/reset-usage', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await User.updateMany(
      {},
      {
        $set: {
          'usage.today': 0,
          'usage.lastResetDate': today
        }
      }
    );

    console.log(`✅ Reset usage for ${result.modifiedCount} users`);
    res.json({
      success: true,
      message: `Reset usage for ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
});

// TEMPORARY: Check Stripe configuration
app.get('/api/admin/check-stripe', (req, res) => {
  res.json({
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'NOT_SET',
    yearlyPriceId: process.env.STRIPE_YEARLY_PRICE_ID || 'NOT_SET',
    webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'NOT_SET'
  });
});

// Success page route
app.get('/success', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - Math Notation AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.5s ease-out;
    }
    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
    .checkmark {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
      fill: none;
      stroke-linecap: round;
      animation: draw 0.5s ease-out 0.3s forwards;
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 32px; }
    .close-btn {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .close-btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">
      <svg class="checkmark" viewBox="0 0 52 52">
        <path d="M14 27l8 8 16-16" />
      </svg>
    </div>
    <h1>🎉 Payment Successful!</h1>
    <p>Your Math Notation AI Premium subscription is now active. You now have access to 500 explanations per day.</p>
    <button class="close-btn" onclick="window.close()">Close & Start Using</button>
    <p style="margin-top: 24px; font-size: 14px; color: #94a3b8;">
      You can close this tab and start using your premium features immediately.
    </p>
  </div>
  <script>setTimeout(() => window.close(), 10000);</script>
</body>
</html>
  `);
});

// Cancel page route
app.get('/cancel', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Cancelled - Math Notation AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 32px; }
    .close-btn {
      background: #64748b;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg width="40" height="40" fill="none" stroke="#64748b" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
    <h1>Payment Cancelled</h1>
    <p>No charges have been made. You can still use the free tier with 10 daily explanations.</p>
    <button class="close-btn" onclick="window.close()">Close This Tab</button>
  </div>
  <script>setTimeout(() => window.close(), 5000);</script>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Math Notation AI - Backend Server   ║
║   Status: Running                      ║
║   Port: ${PORT}                             ║
╚═══════════════════════════════════════╝
  `);
});
