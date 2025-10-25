# 🔍 Math Notation AI - Debug Guide

## ✅ DEBUGGING UPDATES COMPLETED

I've added comprehensive debug logging to your extension. Here's what to do:

---

## 🚀 **STEP 1: RELOAD EXTENSION**

1. Go to `chrome://extensions/`
2. Find "Math Notation AI"
3. Click the **🔄 Reload** button
4. Verify it shows "Errors" = 0

---

## 🔍 **STEP 2: OPEN DEVTOOLS & TEST**

### **Open Test Page:**
```
1. Go to: https://en.wikipedia.org/wiki/Laplace_operator
2. Press F12 (opens DevTools)
3. Click "Console" tab
4. Clear console (🗑️ icon)
```

### **Expected Immediate Console Output:**
You should see these messages **immediately** when the page loads:

```
🔵 Math Notation AI: Content script loaded! https://en.wikipedia.org/wiki/Laplace_operator
🔵 Math Notation AI: Document ready state: loading (or complete)
🔵 Math Notation AI: Initializing extension...
🔵 Math Notation AI: Document ready state: loading
🔵 Math Notation AI: DOM already ready, creating instance immediately
🟢 Math Notation AI: Starting initialization...
🟢 Math Notation AI: API_URL set to: http://localhost:3000
🟢 Math Notation AI: Settings loaded: {enableTooltips: true, autoHide: true, ...}
🟡 Math Notation AI: Setting up event listeners...
🟡 Math Notation AI: Mouse/touch listeners attached
🟡 Math Notation AI: Keyboard listener attached
🟡 Math Notation AI: All event listeners setup complete
🟢 Math Notation AI: Event listeners attached
🟢 Math Notation AI: Initialization complete!
```

**🚨 IF YOU DON'T SEE THESE MESSAGES:**
- The content script is not loading at all
- Check for JavaScript errors in console
- Verify extension is actually enabled

---

## 🖱️ **STEP 3: TEST HIGHLIGHTING**

### **Highlight the "Δ" symbol on Wikipedia:**

**Expected Console Output:**
```
🟠 Math Notation AI: Mouse up detected at 234 567
🟡 Math Notation AI: Processing text selection...
🟡 Math Notation AI: Selected text: "Δ" Length: 1
🟠 Math Notation AI: Checking if math: "Δ"
🟠 Math Notation AI: Pattern matches: [0] Result: true
🟠 Math Notation AI: Is math check result: true
🟢 Math Notation AI: Math detected! Processing...
🟢 Math Notation AI: Tooltip coordinates: {x: 234, y: 567}
🟢 Math Notation AI: Context: In mathematics, the Laplace operator or Laplacian is a differential operator...
🔴 Math Notation AI: Starting API call...
🔴 Math Notation AI: API_URL: http://localhost:3000
🔴 Math Notation AI: Symbol: Δ
🔴 Math Notation AI: User ID: user_1234567890_abc123
🔴 Math Notation AI: Request body: {symbol: "Δ", context: "...", userId: "...", tier: "free"}
🔴 Math Notation AI: Making fetch request to: http://localhost:3000/api/explain
```

**Then either:**

**✅ SUCCESS:**
```
🟣 Math Notation AI: API response status: 200
🟣 Math Notation AI: API response data: {explanation: "...", category: "..."}
🟢 Math Notation AI: Success! Creating tooltip...
🔵 Math Notation AI: Creating explanation tooltip at 234 567
🔵 Math Notation AI: Tooltip data: {explanation: "...", category: "..."}
🔵 Math Notation AI: Appending tooltip to body
🔵 Math Notation AI: Positioning tooltip
🔵 Math Notation AI: Tooltip created and positioned successfully!
```

**❌ OR ERROR:**
```
🔴 Math Notation AI: Fetch error: TypeError: Failed to fetch
🔴 Math Notation AI: Error details: {name: "TypeError", message: "Failed to fetch", ...}
```

---

## 🔧 **STEP 4: DIAGNOSE ISSUES**

### **Issue 1: No Console Messages at All**
**Problem:** Content script not loading
**Solutions:**
- Check `chrome://extensions/` for errors
- Verify extension is enabled
- Try disabling/re-enabling extension
- Check for conflicting extensions

### **Issue 2: Script Loads But No Mouse Events**
**Look for:** `🔵 Content script loaded` but no `🟠 Mouse up detected`
**Solutions:**
- Try clicking in different areas of the page
- Check if other extensions are blocking events
- Try on a different website

### **Issue 3: Mouse Events But No Math Detection**
**Look for:** `🟠 Mouse up detected` but `🟠 Is math check result: false`
**Solutions:**
- Try highlighting different symbols: ∫, ∑, α, β, =, +, -
- Check the pattern matches array in console
- The symbol might not match any patterns

### **Issue 4: Math Detected But API Fails**
**Look for:** `🟢 Math detected!` but `🔴 Fetch error`
**Solutions:**
- Verify backend is running: `curl http://localhost:3000/health`
- Check CORS settings in backend
- Verify host_permissions in manifest.json includes localhost

### **Issue 5: API Success But No Tooltip**
**Look for:** `🟣 API response status: 200` but no visible tooltip
**Solutions:**
- Check if tooltip is created but positioned off-screen
- Look for CSS conflicts
- Check z-index issues

---

## 🛠️ **STEP 5: BACKEND VERIFICATION**

### **Test Backend Directly:**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test explain endpoint
curl -X POST http://localhost:3000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"symbol":"Δ","context":"","userId":"test_user","tier":"free"}'
```

**Expected Response:**
```json
{
  "symbol": "Δ",
  "explanation": "The Greek letter Delta (Δ) commonly represents...",
  "category": "Greek Letter",
  "cached": false
}
```

---

## 🔍 **STEP 6: SERVICE WORKER CHECK**

1. Go to `chrome://extensions/`
2. Find your extension
3. Click **"service worker"** (blue link)
4. Check for errors in that console too

---

## 📋 **DEBUGGING CHECKLIST**

**Content Script Loading:**
- [ ] ✅ `🔵 Content script loaded!` appears immediately
- [ ] ✅ `🟢 Initialization complete!` appears
- [ ] ✅ No JavaScript errors in console

**Event Handling:**
- [ ] ✅ `🟠 Mouse up detected` when clicking
- [ ] ✅ `🟡 Selected text: "..."` shows selected text
- [ ] ✅ Text selection is detected correctly

**Math Detection:**
- [ ] ✅ `🟠 Pattern matches: [X]` shows matched patterns
- [ ] ✅ `🟠 Is math check result: true` for math symbols
- [ ] ✅ Common symbols (Δ, ∫, ∑, α) are detected

**API Communication:**
- [ ] ✅ `🔴 Making fetch request` appears
- [ ] ✅ Backend responds with 200 status
- [ ] ✅ Response data contains explanation

**Tooltip Display:**
- [ ] ✅ `🔵 Tooltip created and positioned successfully!`
- [ ] ✅ Tooltip is visible on page
- [ ] ✅ Tooltip contains explanation text

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **"Failed to fetch" Error:**
```javascript
🔴 Math Notation AI: Fetch error: TypeError: Failed to fetch
```
**Causes:**
- Backend not running
- CORS issues
- Wrong API URL
- Missing host_permissions

**Solutions:**
1. Start backend: `cd backend && npm start`
2. Test health: `curl http://localhost:3000/health`
3. Check manifest.json includes `"http://localhost:3000/*"`

### **"Script not loading" Issue:**
**No console messages at all**
**Causes:**
- Extension not enabled
- JavaScript syntax error
- File path issues in manifest.json

**Solutions:**
1. Check `chrome://extensions/` for errors
2. Verify file paths: `js/content.js`, `css/tooltip.css`
3. Look for red error badges

### **"Math not detected" Issue:**
```javascript
🟠 Math Notation AI: Is math check result: false
```
**Causes:**
- Symbol not in pattern list
- Text too long/short
- Non-mathematical text selected

**Solutions:**
1. Try basic symbols: Δ, ∫, ∑, α, β, π
2. Check pattern matches array in console
3. Highlight single symbols, not words

---

## 📞 **NEXT STEPS**

1. **Follow this guide step by step**
2. **Screenshot any console output** (or lack thereof)
3. **Note exactly where the process stops**
4. **Test with multiple symbols**: Δ, ∫, ∑, α, =, +

**The colored emoji logs will tell us exactly where the issue is!** 🎯

---

## 🎯 **SUCCESS CRITERIA**

**Your extension is working when you see:**
1. ✅ Immediate console logs on page load
2. ✅ Mouse events detected when clicking
3. ✅ Math symbols properly detected
4. ✅ API calls successful (200 response)
5. ✅ Tooltips appear and display explanations

**If any step fails, the logs will show exactly where!** 🔍

