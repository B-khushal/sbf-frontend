# 🚀 RENDER DEPLOYMENT GUIDE - SBF Florist Frontend

## 📋 Pre-Deployment Checklist

### ✅ 1. Verify Build Locally
```bash
# Test production build locally
npm run build
npm run preview

# Test all routes manually:
# ✓ http://localhost:4173/
# ✓ http://localhost:4173/shop
# ✓ http://localhost:4173/product/123
# ✓ http://localhost:4173/cart
# ✓ Refresh any page - should NOT 404
```

### ✅ 2. Backend Configuration
Ensure your backend is deployed and accessible at:
- **URL**: `https://sbf-backend.onrender.com`
- **API Endpoint**: `https://sbf-backend.onrender.com/api`
- **Test**: Visit `https://sbf-backend.onrender.com/api/health` (should return 200 OK)

---

## 🔧 Render Dashboard Setup

### Step 1: Create New Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "**New +**" → "**Static Site**"
3. Connect your GitHub/GitLab repository
4. Select repository: `SBF-Copy/sbf-main`

### Step 2: Configure Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:**
```
dist
```

**Branch:**
```
main
```

### Step 3: Add Environment Variables

In Render Dashboard → Environment → Add these variables:

```
VITE_API_URL=https://sbf-backend.onrender.com/api
VITE_UPLOADS_URL=https://sbf-backend.onrender.com
NODE_ENV=production
VITE_APP_MODE=production
VITE_ENABLE_PAYMENT=true
VITE_MOCK_PAYMENT=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_EMAIL=true
VITE_DEV_LOGGING=false
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_RAZORPAY_KEY_ID=your-razorpay-key-here
```

### Step 4: Configure Rewrite Rules

**⚠️ CRITICAL: This is the most important step!**

In Render Dashboard → Redirects/Rewrites → Add this rule:

**Source:** `/*`  
**Destination:** `/index.html`  
**Action:** `Rewrite`  
**Status:** `200`

**Screenshot of what it should look like:**
```
Source       Destination      Action    Status
------       -----------      ------    ------
/*           /index.html      Rewrite   200
```

### Step 5: Advanced Settings (Optional)

**Auto-Deploy:** ✅ Enable  
**Pull Request Previews:** ✅ Enable (optional)  
**Branch:** `main` or `master`

---

## 🔍 Troubleshooting Guide

### Problem 1: 404 on Direct URL Access
**Symptoms:** 
- Opening `/product/123` in new tab shows 404
- Refreshing any route shows 404

**Solution:**
✅ Verify Render Rewrite Rule is set correctly:
```
Source: /*
Destination: /index.html
Action: Rewrite
Status: 200
```

✅ Check `_redirects` file exists in `public/` folder
✅ Verify `base: '/'` in `vite.config.ts`

---

### Problem 2: Redirect to /index.html
**Symptoms:**
- URL changes to `/index.html`
- Navigation breaks

**Solution:**
✅ Ensure `BrowserRouter` is used (NOT HashRouter) ✓ Already correct
✅ No hardcoded `/index.html` in navigation ✓ Already correct
✅ Check all `<Link>` components use relative paths

---

### Problem 3: API Calls Fail in Production
**Symptoms:**
- API calls work locally but fail in production
- CORS errors in console
- 404 on API endpoints

**Solution:**
✅ Verify backend URL in environment variables
✅ Check backend CORS settings allow frontend domain
✅ Test API endpoint directly: `https://sbf-backend.onrender.com/api/health`

**Backend CORS Configuration:**
```javascript
// In your backend server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

---

### Problem 4: Assets Not Loading
**Symptoms:**
- Images, CSS, or JS files return 404
- Console shows 404 for asset files

**Solution:**
✅ Verify build output in `dist/` folder
✅ Check asset paths don't have double slashes
✅ Ensure `base: '/'` in vite.config.ts (NOT `/sbf/` or similar)

---

### Problem 5: Environment Variables Not Working
**Symptoms:**
- `import.meta.env.VITE_API_URL` is undefined
- App uses wrong API URL

**Solution:**
✅ All env vars MUST start with `VITE_`
✅ Add env vars in Render Dashboard (not just .env file)
✅ Rebuild after adding environment variables
✅ Check browser console: `console.log(import.meta.env.VITE_API_URL)`

---

## 🧪 Testing Checklist

After deployment, test ALL these scenarios:

### ✅ Navigation Tests
- [ ] Home page loads: `https://your-site.onrender.com/`
- [ ] Shop page loads: `https://your-site.onrender.com/shop`
- [ ] Product page loads: `https://your-site.onrender.com/product/123`
- [ ] Cart page loads: `https://your-site.onrender.com/cart`
- [ ] About page loads: `https://your-site.onrender.com/about`
- [ ] Admin panel loads: `https://your-site.onrender.com/admin`

### ✅ Direct URL Access (Critical!)
- [ ] Open `/shop` in NEW TAB → Should load correctly
- [ ] Open `/product/123` in NEW TAB → Should load correctly
- [ ] Open `/cart` in NEW TAB → Should load correctly

### ✅ Refresh Tests (Critical!)
- [ ] Go to `/shop` → Press F5 → Should NOT 404
- [ ] Go to `/product/123` → Press F5 → Should NOT 404
- [ ] Go to `/admin` → Press F5 → Should NOT 404

### ✅ Browser Back/Forward
- [ ] Navigate: Home → Shop → Product → Back → Forward
- [ ] URL changes correctly
- [ ] Content loads properly

### ✅ API Tests
- [ ] Products load on shop page
- [ ] Product details load on product page
- [ ] Cart operations work (add/remove items)
- [ ] Login/Signup works
- [ ] Checkout flow completes

### ✅ 404 Handling
- [ ] Invalid route like `/xyz123` → Shows custom 404 page
- [ ] 404 page has link back to home

---

## 📊 Performance Optimization (Already Implemented)

✅ **Lazy Loading** - All non-critical pages lazy loaded  
✅ **Code Splitting** - Vendor chunks separated  
✅ **Compression** - Gzip and Brotli enabled  
✅ **Image Optimization** - Cloudinary integration  
✅ **React Optimization** - Proper memoization  

---

## 🔒 Security Checklist

- [ ] Never expose API secrets in frontend env vars
- [ ] Use `VITE_RAZORPAY_KEY_ID` (public key only)
- [ ] Backend validates all API requests
- [ ] CORS properly configured on backend
- [ ] HTTPS enabled on Render (automatic)
- [ ] Content Security Policy headers set

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```typescript
// ❌ Wrong - Using HashRouter
import { HashRouter } from 'react-router-dom';

// ❌ Wrong - Hardcoded index.html
navigate('/index.html');

// ❌ Wrong - Wrong base path
base: '/sbf/'

// ❌ Wrong - Missing rewrite rule on Render

// ❌ Wrong - Using backend URL in frontend routes
const API_URL = 'https://backend.com/product/123'; // This is API call, not route
```

### ✅ DO THIS:
```typescript
// ✅ Correct - Using BrowserRouter
import { BrowserRouter } from 'react-router-dom';

// ✅ Correct - Clean navigation
navigate('/shop');

// ✅ Correct - Root base path
base: '/'

// ✅ Correct - Proper Render rewrite rule configured

// ✅ Correct - Separate frontend routes and API calls
navigate('/product/123'); // Frontend route
fetch(`${API_URL}/products/123`); // API call
```

---

## 🎯 Final Verification

Run this checklist before marking deployment as complete:

1. ✅ Backend is live and accessible
2. ✅ Frontend builds without errors
3. ✅ All environment variables added to Render
4. ✅ Rewrite rule configured: `/* → /index.html`
5. ✅ Direct URL access works (test in new tab)
6. ✅ Refresh on any route works (press F5)
7. ✅ API calls return data (check network tab)
8. ✅ Authentication flow works
9. ✅ Payment flow works (if applicable)
10. ✅ Mobile view tested
11. ✅ 404 page shows for invalid routes

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs/deploy-create-react-app
- **Vite Docs**: https://vitejs.dev/guide/build.html
- **React Router**: https://reactrouter.com/en/main/start/overview

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ All routes accessible via direct URL  
✅ Refresh works on any page  
✅ No 404 errors on valid routes  
✅ API calls return data  
✅ Authentication works  
✅ Images load correctly  
✅ No console errors  

---

**Last Updated:** January 28, 2026  
**Version:** 1.0.0  
**Author:** SBF Florist Team
