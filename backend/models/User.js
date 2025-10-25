// models/User.js - User subscription model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Unique user ID from extension
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Email from Stripe checkout
  email: {
    type: String,
    required: false
  },

  // Subscription tier
  tier: {
    type: String,
    enum: ['free', 'monthly', 'annual', 'lifetime'],
    default: 'free'
  },

  // Stripe customer ID
  stripeCustomerId: {
    type: String,
    sparse: true
  },

  // Stripe subscription ID (for monthly/annual)
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },

  // Payment ID (for lifetime purchases)
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },

  // Subscription status
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing', null],
    default: null
  },

  // Subscription start date
  subscriptionStart: {
    type: Date
  },

  // Subscription end date (for active subscriptions)
  subscriptionEnd: {
    type: Date
  },

  // Total usage (for analytics)
  totalUsage: {
    type: Number,
    default: 0
  },

  // Created date
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if user has active premium access
userSchema.methods.isPremium = function() {
  if (this.tier === 'lifetime') {
    return true;
  }

  if (this.tier === 'monthly' || this.tier === 'annual') {
    return this.subscriptionStatus === 'active' &&
           this.subscriptionEnd &&
           this.subscriptionEnd > new Date();
  }

  return false;
};

module.exports = mongoose.model('User', userSchema);
