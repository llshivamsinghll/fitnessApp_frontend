# Deployment Configuration Guide

## The Problem
When deployed to Vercel (or any hosting platform), your frontend app was making API requests to itself instead of your backend server. This is because the Vite proxy only works in development.

## The Solution
The API configuration has been updated to handle both development and production environments properly.

## Configuration Steps

### 1. For Local Development
Your current setup should work with the proxy. The API will use `http://localhost:5000` through the Vite proxy.

### 2. For Production Deployment

#### Step 1: Deploy your Backend
First, deploy your backend to a hosting platform like:
- Heroku: `https://your-app.herokuapp.com`
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`
- Vercel (for API): `https://your-backend.vercel.app`

#### Step 2: Update Environment Variables
In your Vercel dashboard (or hosting platform), set these environment variables:

```bash
VITE_API_BASE_URL=https://your-actual-backend-url.com
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

#### Step 3: Update Local Environment Files
Update `.env.production`:
```bash
VITE_API_BASE_URL=https://your-actual-backend-url.com
```

### 3. Backend CORS Configuration
Make sure your backend allows requests from your frontend domain:

```javascript
// In your backend index.js
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://fitness-app-frontend-six.vercel.app',
    'https://your-custom-domain.com'  // Add your actual domain
  ],
  credentials: true
}));
```

### 4. Environment Variable Priority
Vite loads environment variables in this order:
1. `.env.production` (in production)
2. `.env.development` (in development)  
3. `.env.local` (always, but should be gitignored)
4. `.env` (always)

## Testing
After configuration, check the browser console for debug logs that show which URL is being used for API requests.

## Debugging
If you still see requests going to your frontend URL:
1. Check browser Network tab to see the actual request URL
2. Look for console logs showing the API configuration
3. Verify environment variables are set correctly in your hosting platform
4. Clear browser cache and try again

## Example Backend URLs
Replace `https://your-backend-url.com` with your actual backend URL:
- Heroku: `https://fitness-backend-app.herokuapp.com`
- Railway: `https://fitness-backend.up.railway.app`
- Render: `https://fitness-backend.onrender.com`
- Custom domain: `https://api.yourfitnessdomain.com`