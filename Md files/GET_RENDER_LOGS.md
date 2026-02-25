# Get Render Backend Logs

## Option 1: Render Dashboard (Easiest)
1. Go to: https://dashboard.render.com
2. Click on **sbf-backend** service
3. Click **Logs** tab
4. Look for errors around the time of payment/order creation

## Option 2: Render CLI
```powershell
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Get logs
render logs sbf-backend --tail
```

## Option 3: Check Specific Endpoints
Look for these error patterns in logs:

### Payment Verification Endpoint
```
POST /api/orders/verify-payment
```
**Common errors:**
- "Payment verification failed"
- "Invalid signature"
- "Order creation failed"

### Get Order Endpoint
```
GET /api/orders/:orderId
```
**Common errors:**
- "Order not found"
- "Unauthorized"

## What to Share:
When you get the logs, share:
1. Any errors with "payment" or "order" keywords
2. Timestamp of the error
3. Status codes (500, 404, etc.)
4. Full error message and stack trace

## Quick Test:
Open browser console and run:
```javascript
// Check what's stored after payment
console.log('Order data:', localStorage.getItem('lastOrder'));
console.log('From payment:', sessionStorage.getItem('from_payment'));
```

If `lastOrder` is null/empty, the payment handler didn't store it properly.
If `lastOrder` exists but page redirects, there's a parsing error.
