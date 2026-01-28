# ⚡ QUICK FIX REFERENCE - SPA Routing on Render

## 🔥 THE ONE CRITICAL THING

**Add this Rewrite Rule in Render Dashboard:**

```
Source: /*
Destination: /index.html  
Action: Rewrite
```

Without this, NOTHING else matters! ☝️

---

## ✅ What Was Fixed (2-Minute Summary)

### 1️⃣ vite.config.ts
```typescript
base: '/'  // ← Added this line
```

### 2️⃣ public/_redirects
```plaintext
/*    /index.html   200  // ← Simplified to just this
```

### 3️⃣ render.yaml (NEW FILE)
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### 4️⃣ .env.production (NEW FILE)
```env
VITE_API_URL=https://sbf-backend.onrender.com/api
```

---

## 🚀 Deploy Now (3 Steps)

### Step 1: Push Code
```bash
git add .
git commit -m "Fix SPA routing"
git push
```

### Step 2: Configure Render
```
Build Command: npm install && npm run build
Publish Directory: dist
```

### Step 3: Add Rewrite Rule
```
Render Dashboard → Redirects/Rewrites
Source: /*
Destination: /index.html
Action: Rewrite
```

---

## 🧪 Test (1 Minute)

After deploy, test these 3 things:

1. ✅ Open `/product/123` in NEW TAB → Should work
2. ✅ Navigate to `/shop` then press F5 → Should work  
3. ✅ Check console: `console.log(import.meta.env.VITE_API_URL)` → Should show backend URL

If all 3 pass → ✅ Success!

---

## 🆘 Still Broken? (Quick Fix)

### If 404 on routes:
→ Check Render rewrite rule is added

### If API fails:
→ Add env vars in Render Dashboard  
→ Check backend CORS allows your frontend domain

### If assets 404:
→ Verify `base: '/'` in vite.config.ts  
→ Clear cache (Ctrl+Shift+R)

---

## 📖 Full Documentation

See `RENDER_DEPLOYMENT_GUIDE.md` for complete guide.

---

**That's it! You're production ready! 🎉**
