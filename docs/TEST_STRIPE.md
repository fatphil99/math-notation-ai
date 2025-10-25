# Testing Stripe Integration

## ✅ Backend Limits Are Working!

The backend correctly limits users to 5 requests per day. After 5 uses, you get:
```
ERROR: Daily limit reached
```

---

## 🧪 How to Test the Complete Flow

### Step 1: Check Your Current User ID

1. **Load the extension** on any page
2. **Open Chrome DevTools** (F12)
3. **Go to Console tab**
4. **Run this command:**
   ```javascript
   chrome.storage.local.get(['userId', 'totalUsage'], (result) => console.log('Your Data:', result))
   ```
5. **You'll see something like:**
   ```
   Your Data: {userId: "user_1729834567890_abc123xyz", totalUsage: 2}
   ```

### Step 2: Use Up Your 5 Free Requests

1. **Go to a math page:** https://en.wikipedia.org/wiki/Pythagorean_theorem
2. **Press `Cmd+Shift+Z`** (Mac) or `Ctrl+Shift+Z`** (Windows)
3. **Select different math formulas** 5 times
4. **Watch the usage counter** increment in the popup

**Check usage after each request:**
- Click the extension icon → Should show "1 / 5 used", "2 / 5 used", etc.

### Step 3: Test the Limit

After 5 requests:
- **Try to explain one more formula**
- **You should see:** "You've used all 5 free lookups! Click the extension icon to upgrade."

### Step 4: Test Stripe Checkout

1. **Click the extension icon**
2. **You should see:** "⚠️ You've used all 5 free lookups!"
3. **Click "Upgrade to Premium - $2.99/month"**
4. **Stripe checkout page should open** with:
   - Price: $2.99/month
   - Your email field
   - Card details

**DO NOT ACTUALLY PAY** (it's real money!)

**Test card details you CAN use for testing:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/26)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

This test card won't actually charge you - it's Stripe's test card!

---

## 🔍 Troubleshooting: "I'm Not Getting Limited"

If you're not hitting the limit after 5 requests, it's likely because:

### Issue 1: Extension is creating new userIds
**Solution:** The extension creates one userId per browser/extension install. If you:
- Reload the extension
- Clear Chrome storage
- Use Incognito mode

It will create a NEW userId with a fresh 5 requests.

**To verify you're using the same userId:**
```javascript
// Run this in Console BEFORE each request
chrome.storage.local.get(['userId'], (r) => console.log('Current userId:', r.userId))
```

The userId should be THE SAME across all requests!

### Issue 2: Testing on different pages
Each page reload creates a new content script instance, but they should all use the SAME userId (stored in chrome.storage.local).

### Issue 3: Backend is caching responses
If you keep testing with the SAME math symbol (like "x^2"), the backend caches it and returns instantly. Try different symbols each time.

---

## 💳 Stripe Payment Flow (Full End-to-End)

### What Happens When User Pays:

1. **User clicks "Upgrade"** in extension popup
   - Extension calls: `POST /api/create-checkout-session`
   - Backend creates Stripe checkout session
   - Returns checkout URL

2. **User is redirected to Stripe checkout page**
   - Enters credit card details
   - Completes payment ($2.99/month)

3. **Stripe sends webhook to backend**
   - Event: `checkout.session.completed`
   - Backend updates user in MongoDB:
     ```javascript
     subscription.status = "premium"
     ```

4. **User now has unlimited access**
   - Daily limit changes from 5 → 500
   - Extension shows "✨ PREMIUM" badge

### Testing Without Real Payment:

**Option 1: Use Stripe Test Mode** (requires Stripe test keys)
- Use test card: `4242 4242 4242 4242`
- Stripe won't actually charge
- Webhooks still fire

**Option 2: Manually Upgrade a User in MongoDB** (for testing)

You can manually set a user to premium in MongoDB:

```javascript
// In MongoDB Compass or Atlas:
db.users.updateOne(
  { userId: "YOUR_USER_ID_HERE" },
  {
    $set: {
      "subscription.status": "premium",
      "subscription.plan": "monthly"
    }
  }
)
```

Then the extension will see unlimited access!

---

## 🎯 Quick Test Checklist

- [ ] Extension loads without errors
- [ ] Can explain math formulas
- [ ] Usage counter increments (1/5, 2/5...)
- [ ] After 5 uses, shows limit error
- [ ] Clicking "Upgrade" opens Stripe checkout
- [ ] Stripe checkout shows correct price ($2.99/month)
- [ ] Test card (4242...) is accepted (don't complete payment!)

---

## 📊 Verify Everything is Working:

**1. Backend Health:**
```bash
curl https://math-notation-ai-backend-production.up.railway.app/health
```
Should return: `{"status":"healthy",...}`

**2. Check User in MongoDB:**
Go to MongoDB Atlas → Browse Collections → `users`
You should see entries like:
```json
{
  "userId": "user_1729834567890_abc123xyz",
  "usage": {
    "today": 5,
    "lastResetDate": "2025-10-25"
  },
  "subscription": {
    "status": "free"
  }
}
```

**3. Check Stripe Dashboard:**
Go to: https://dashboard.stripe.com/test/payments
After a test payment, you should see a successful checkout session!

---

**Everything working? You're ready to publish!** 🚀
