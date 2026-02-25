# Render Deployment Guide - SBF Florist Frontend

## 🚨 CRITICAL: Mixed Content Error Fix

If you're seeing errors like:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://...'
```

**This means your API URL is using HTTP instead of HTTPS!**

## ✅ Correct Environment Variables for Render

### Frontend Service Configuration

When deploying to Render, you **MUST** set these environment variables in the Render dashboard:

#### Required Variables:

```env
VITE_API_URL=https://sbf-backend.onrender.com/api
VITE_UPLOADS_URL=https://sbf-backend.onrender.com
NODE_ENV=production
VITE_APP_MODE=production
VITE_GOOGLE_CLIENT_ID=246004709667-1a33cbkt2b2hq2m1foav1b3j4fsvilef.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_live_your_production_key
VITE_RAZORPAY_KEY_SECRET=your_production_secret
```

### ⚠️ Common Mistakes to Avoid:

❌ **WRONG**: `VITE_API_URL=http://sbf-backend.onrender.com/api` (HTTP)
✅ **CORRECT**: `VITE_API_URL=https://sbf-backend.onrender.com/api` (HTTPS)

❌ **WRONG**: `VITE_API_URL=https//sbf-backend.onrender.com/api` (Missing colon)
✅ **CORRECT**: `VITE_API_URL=https://sbf-backend.onrender.com/api` (Has ://)

❌ **WRONG**: Setting only in `.env` file (not read by Render at build time)
✅ **CORRECT**: Set in Render dashboard Environment tab

## 📋 Step-by-Step Deployment Instructions

### 1. Prepare Backend First

Make sure your backend is deployed and working at:
- `https://sbf-backend.onrender.com`

Test it by visiting:
- `https://sbf-backend.onrender.com/health`

You should see a successful response.

### 2. Deploy Frontend to Render

#### A. Create Static Site on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository (`sbf-frontend`)
4. Configure the service:

#### B. Build Settings

```yaml
Name: sbf-florist-frontend
Branch: main
Root Directory: (leave blank or set to sbf-main if needed)
Build Command: npm install && npm run build:production
Publish Directory: dist
Auto-Deploy: Yes
```

#### C. Environment Variables

Click **"Environment"** tab and add each variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://sbf-backend.onrender.com/api` |
| `VITE_UPLOADS_URL` | `https://sbf-backend.onrender.com` |
| `NODE_ENV` | `production` |
| `VITE_APP_MODE` | `production` |
| `VITE_GOOGLE_CLIENT_ID` | `your-google-client-id` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_your_key` |
| `VITE_RAZORPAY_KEY_SECRET` | `your_production_secret` |

**CRITICAL**: Make sure URLs start with `https://` not `http://`

#### D. Custom Headers (Optional but Recommended)

Add these headers for better security:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: upgrade-insecure-requests
```

### 3. Configure Backend CORS

Update your backend `.env` or Render environment variables:

```env
CORS_ORIGIN=https://sbf-frontend.onrender.com,https://www.sbflorist.in
```

**Important**: Include both your Render URL and any custom domains.

### 4. Deploy & Verify

1. Click **"Create Static Site"** or **"Manual Deploy"**
2. Wait for build to complete (5-10 minutes)
3. Visit your site: `https://your-site-name.onrender.com`

#### Verification Checklist:

- ✅ Site loads without errors
- ✅ Open browser console (F12) - no mixed content errors
- ✅ API calls are using HTTPS (check Network tab)
- ✅ Images load properly
- ✅ Login/authentication works
- ✅ Cart functionality works
- ✅ Payment gateway initializes

### 5. Fix Common Issues

#### Issue: Still seeing mixed content errors

**Solution**:
1. Go to Render dashboard → Your static site → Environment
2. **Delete** the incorrect `VITE_API_URL` variable
3. **Add again** with correct HTTPS URL: `https://sbf-backend.onrender.com/api`
4. Click **"Manual Deploy"** to rebuild

#### Issue: API calls return 404 or can't connect

**Solution**:
1. Check backend is running: visit `https://sbf-backend.onrender.com/health`
2. Verify CORS is configured correctly on backend
3. Check backend logs in Render dashboard

#### Issue: Environment variables not working

**Solution**:
1. Environment variables in Vite **MUST** have `VITE_` prefix
2. After changing env vars, you **MUST** rebuild/redeploy
3. Clear browser cache (Ctrl+Shift+Delete)

## 🔒 Security Best Practices

1. **Never commit** production secrets to git:
   - `.env` is in `.gitignore`
   - Only `.env.example` and `.env.production` (without real secrets) should be committed

2. **Use production Razorpay keys** on production:
   - Development: `rzp_test_*`
   - Production: `rzp_live_*`

3. **Configure Google OAuth** for production domain:
   - Add your Render URL to authorized JavaScript origins
   - Add redirect URIs in Google Cloud Console

## 📊 Monitoring

After deployment, monitor:

1. **Render Dashboard**:
   - Build logs for errors
   - Deploy history
   - Custom domain setup

2. **Browser Console**:
   - Check for JavaScript errors
   - Verify API calls use HTTPS
   - Check for CORS errors

3. **Backend Logs**:
   - Monitor API requests
   - Check for authentication issues
   - Verify CORS headers

## 🔄 Updating the Deployment

When you push changes to GitHub:

1. Render auto-deploys (if enabled)
2. Or click **"Manual Deploy"** in Render dashboard
3. Wait for build to complete
4. Verify changes are live

## 📞 Need Help?

If you're still experiencing issues:

1. Check Render build logs for errors
2. Verify all environment variables are set correctly
3. Test backend API directly using tools like Postman
4. Check browser console for specific error messages
5. Verify network requests in DevTools Network tab

## 🎯 Quick Troubleshooting Commands

Test your API from command line:

```bash
# Test backend health
curl https://sbf-backend.onrender.com/health

# Test API endpoint
curl https://sbf-backend.onrender.com/api/products

# Check CORS headers
curl -I -X OPTIONS https://sbf-backend.onrender.com/api/products \
  -H "Origin: https://your-frontend.onrender.com" \
  -H "Access-Control-Request-Method: GET"
```

## ✅ Success Criteria

Your deployment is successful when:

- ✅ No mixed content errors in console
- ✅ All API calls use HTTPS
- ✅ Authentication works
- ✅ Images load from HTTPS URLs
- ✅ Cart and checkout function properly
- ✅ Payment gateway works
- ✅ No CORS errors
