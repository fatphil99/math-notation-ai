# Quick Start - Testing Your Extension

## 🚀 Loading the Extension in Chrome

### Method 1: Load from Source (Recommended for Testing)

1. **Open Chrome Extensions Page:**
   - Go to `chrome://extensions/`
   - OR click the 3-dot menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" ON (top-right corner)

3. **Load the Extension:**
   - Click "Load unpacked"
   - Select this folder: `/Users/philipshin/Desktop/Chrome Extensions/math notation ai`
   - Click "Select"

4. **Verify Installation:**
   - You should see "Math Notation AI" in your extensions list
   - The icon should appear in your Chrome toolbar

### Method 2: Load from ZIP (Production Test)

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Drag and drop `math-notation-ai-v1.0.0.zip` onto the page
4. Click "Load unpacked" and select the extracted folder

---

## 🧪 Testing the Extension

### 1. Test the Popup

1. **Click the extension icon** in your Chrome toolbar
2. **Verify you see:**
   - "Free Plan" with "0 / 5 used"
   - "Remaining Lookups: 5"
   - "Upgrade to Premium - $2.99/month" button
   - Keyboard shortcut instructions

### 2. Test Math Explanation Feature

1. **Open a webpage with math content:**
   - Try: https://en.wikipedia.org/wiki/Pythagorean_theorem
   - OR: https://www.khanacademy.org/math/algebra

2. **Activate screenshot mode:**
   - Press **`Cmd+Shift+Z`** (Mac) or **`Ctrl+Shift+Z`** (Windows)
   - You should see a dark overlay with instructions

3. **Select math content:**
   - Click and drag to select any mathematical formula or equation
   - Release the mouse

4. **Verify the explanation:**
   - A tooltip should appear with the AI explanation
   - LaTeX math should be properly rendered
   - You can close it with the X button or ESC key

5. **Check usage counter:**
   - Click the extension icon again
   - Usage should now show "1 / 5 used"

### 3. Test Payment Flow

1. **Use all 5 free lookups** by explaining 5 different math items

2. **Try to use it again:**
   - You should see an error: "You've used all 5 free lookups!"

3. **Click the extension icon** → **Click "Upgrade to Premium"**
   - Should open a Stripe checkout page
   - **DON'T COMPLETE THE PAYMENT** (it's real money!)
   - Just verify the page loads correctly

4. **Test card details page (optional):**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

---

## 🔍 Troubleshooting

### Extension Not Loading?

1. Check the console for errors:
   - Right-click the extension icon → "Inspect popup"
   - Look for red errors in the Console tab

2. Check content script:
   - Open any webpage
   - Press F12 → Console tab
   - Look for "Math Notation AI loaded"

### Backend Connection Issues?

1. **Verify backend is running:**
   ```bash
   curl https://math-notation-ai-backend-production.up.railway.app/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check browser console:**
   - F12 → Console tab
   - Look for network errors when trying to explain math

### Keyboard Shortcut Not Working?

1. Go to `chrome://extensions/shortcuts`
2. Verify "Math Notation AI" has the shortcut assigned
3. If not, click the pencil icon and set it to:
   - Mac: `Command+Shift+Z`
   - Windows: `Ctrl+Shift+Z`

### No Math Found?

- Try selecting actual text instead of images
- Make sure you're dragging to create a selection box
- Try a webpage with clear mathematical formulas

---

## ✅ What to Verify Before Publishing

- [ ] Extension loads without errors
- [ ] Popup shows correctly
- [ ] Keyboard shortcut works
- [ ] Can select and get explanations for math content
- [ ] Usage counter increments (1/5, 2/5, etc.)
- [ ] After 5 uses, shows upgrade prompt
- [ ] Clicking "Upgrade" opens Stripe checkout
- [ ] Backend is responding (check health endpoint)
- [ ] LaTeX rendering works correctly

---

## 🎯 Ready to Publish?

Once all tests pass:

1. **Create final ZIP** (already done): `math-notation-ai-v1.0.0.zip`
2. **Go to Chrome Web Store:** https://chrome.google.com/webstore/devconsole
3. **Upload the ZIP file**
4. **Fill in store listing details**
5. **Submit for review**

---

## 🔗 Useful Links

- **Backend URL:** https://math-notation-ai-backend-production.up.railway.app
- **Health Check:** https://math-notation-ai-backend-production.up.railway.app/health
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Railway Dashboard:** https://railway.app/dashboard

---

**Need help?** Check the archived docs in `docs/archive/` for detailed guides.
