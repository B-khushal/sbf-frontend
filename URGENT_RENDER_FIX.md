# 🚨 URGENT: RENDER DASHBOARD FIX REQUIRED

## The Problem

Your Render environment variable is **MALFORMED**:

❌ **Current (WRONG)**: `https//sbf-backend.onrender.com/api` (missing colon)  
✅ **Should be**: `https://sbf-backend.onrender.com/api` (with colon)

The error `http://https//sbf-backend.onrender.com` means your env var is missing the `:` after https.

## IMMEDIATE FIX - Do This RIGHT NOW

### Step 1: Login to Render

Go to: https://dashboard.render.com

### Step 2: Find Your Frontend Service

Click on your service: `sbf-florist-frontend` or similar name

### Step 3: Go to Environment Tab

Click on the **"Environment"** tab in the left sidebar

### Step 4: Fix VITE_API_URL

Find the `VITE_API_URL` variable:

1. Click the **trash icon** to DELETE the existing variable
2. Click **"Add Environment Variable"**
3. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://sbf-backend.onrender.com/api` (COPY THIS EXACTLY)
4. Click **"Save Changes"**

### Step 5: Fix VITE_UPLOADS_URL

Find the `VITE_UPLOADS_URL` variable:

1. Click the **trash icon** to DELETE the existing variable
2. Click **"Add Environment Variable"**
3. Enter:
   - **Key**: `VITE_UPLOADS_URL`
   - **Value**: `https://sbf-backend.onrender.com` (COPY THIS EXACTLY)
4. Click **"Save Changes"**

### Step 6: Verify ALL Environment Variables

Make sure you have ALL these variables set correctly:

```
VITE_API_URL=https://sbf-backend.onrender.com/api
VITE_UPLOADS_URL=https://sbf-backend.onrender.com
NODE_ENV=production
VITE_APP_MODE=production
VITE_GOOGLE_CLIENT_ID=246004709667-1a33cbkt2b2hq2m1foav1b3j4fsvilef.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_here
VITE_RAZORPAY_KEY_SECRET=your_secret_here
```

### Step 7: Clear Cache and Redeploy

1. Click **"Manual Deploy"** button (top right)
2. Select **"Clear build cache & deploy"**
3. Wait for deployment to complete (5-10 minutes)

### Step 8: Verify the Fix

1. Visit https://sbf-frontend.onrender.com
2. Press F12 to open Developer Console
3. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) to hard refresh
4. Check console - you should see:
   ```
   🔧 Environment Configuration: {
     corrected: {
       API_URL: "https://sbf-backend.onrender.com/api",
       UPLOADS_URL: "https://sbf-backend.onrender.com"
     }
   }
   ```
5. NO mixed content errors should appear!

## Common Mistakes (AVOID THESE!)

❌ `https//sbf-backend.onrender.com` - Missing colon after https  
❌ `http://sbf-backend.onrender.com` - Using HTTP instead of HTTPS  
❌ `https:/sbf-backend.onrender.com` - Only one slash after colon  
❌ `https//://sbf-backend.onrender.com` - Double colon  

✅ `https://sbf-backend.onrender.com` - CORRECT FORMAT

## If Still Not Working

1. **Check Backend is Running**:
   Visit https://sbf-backend.onrender.com/health
   Should see a success response

2. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or use Incognito/Private mode

3. **Check Build Logs**:
   - In Render dashboard, click on your service
   - Click "Logs" tab
   - Look for any build errors

4. **Verify Environment Variables Again**:
   - Sometimes Render doesn't save properly
   - Double-check each variable
   - Make sure there are no extra spaces

## Need Help?

If you're still seeing errors after following these steps:

1. Take a screenshot of your Render Environment Variables tab
2. Take a screenshot of the browser console errors
3. Check the browser Network tab to see the actual URL being called

## Code Fix Applied

I've also added URL validation code that will:
- Auto-fix common malformations (like missing colon)
- Log configuration details to console
- Warn about HTTPS issues in production

This is now in the code, but you **MUST** fix the Render environment variables and redeploy for it to take effect.
