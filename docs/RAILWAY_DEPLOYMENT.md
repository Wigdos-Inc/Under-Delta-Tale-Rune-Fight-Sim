# Railway Deployment Guide

This guide walks you through deploying the Undertale/Deltarune Fighting Simulator to Railway.

## Why Railway?

- ✅ Free tier includes 500 hours/month ($5 credit)
- ✅ Automatic HTTPS certificates
- ✅ GitHub integration for auto-deployment
- ✅ Built-in PostgreSQL/MySQL databases (or use external like filess.io)
- ✅ Simple environment variable management
- ✅ No credit card required for hobby tier

## Prerequisites

- GitHub account (to push your code)
- Railway account (sign up at https://railway.app)
- This project pushed to a GitHub repository

## Deployment Options

### Option 1: Backend on Railway + Frontend on Vercel (Recommended)

**Why this approach:**
- Railway excels at backend Node.js apps
- Vercel excels at static frontend hosting (free, unlimited bandwidth)
- Keep database on filess.io (already configured)

### Option 2: Everything on Railway

**Why this approach:**
- Single platform for everything
- Simpler management
- Good for development/testing

---

## Option 1: Backend on Railway + Frontend on Vercel

### Part A: Deploy Backend to Railway

#### Step 1: Prepare Backend for Railway

Railway needs a few adjustments to the backend code:

**1. Update `backend/package.json`** - Add start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**2. Update `backend/server.js`** - Make port dynamic:
```javascript
const PORT = process.env.PORT || 3000;
```
(Already done in your code!)

**3. Create `backend/.railwayignore`** (optional):
```
node_modules/
*.log
.env
```

#### Step 2: Push to GitHub

```bash
cd /workspaces/Under-Delta-Tale-Rune-Fight-Sim
git init
git add .
git commit -m "Initial commit - Undertale/Deltarune Fighting Simulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### Step 3: Deploy Backend on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Configure the service:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

#### Step 4: Set Environment Variables on Railway

In your Railway project dashboard:

1. Click on your service
2. Go to "Variables" tab
3. Add these variables:

```
NODE_ENV=production
JWT_SECRET=your_random_32_character_secret_key_here_CHANGE_THIS
DB_HOST=pd04u8.h.filess.io
DB_PORT=3307
DB_NAME=Under_Delta_Tale_Rune_carefulbet
DB_USER=Under_Delta_Tale_Rune_carefulbet
DB_PASSWORD=84219052d20c92b9fafb24b25d7819e4173d64f7
FRONTEND_URL=https://your-app.vercel.app
```

**Important:** Generate a new JWT_SECRET using:
```bash
openssl rand -base64 32
```

#### Step 5: Get Your Backend URL

After deployment, Railway gives you a URL like:
```
https://your-app.railway.app
```

Save this URL - you'll need it for the frontend!

---

### Part B: Deploy Frontend to Vercel

#### Step 1: Update Frontend API URL

**Update `src/api/ApiClient.js`:**

```javascript
constructor(baseUrl = 'https://your-app.railway.app/api') {
  // Replace with your Railway backend URL
  this.baseUrl = baseUrl;
  // ... rest of code
}
```

Or better, make it dynamic:

```javascript
constructor(baseUrl = null) {
  // Auto-detect backend URL
  this.baseUrl = baseUrl || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api'
      : 'https://your-app.railway.app/api');
  // ... rest of code
}
```

#### Step 2: Create `vercel.json` in Project Root

```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": ".",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New" → "Project"**
4. **Import your GitHub repository**
5. **Configure:**
   - Framework Preset: Other
   - Root Directory: `./` (project root)
   - Build Command: (leave empty)
   - Output Directory: `./` (project root)
6. **Click "Deploy"**

#### Step 4: Update CORS on Railway

Go back to Railway dashboard and update `FRONTEND_URL`:

```
FRONTEND_URL=https://your-app.vercel.app
```

Replace with your actual Vercel URL (e.g., `your-project.vercel.app`)

#### Step 5: Test the Deployment

Visit your Vercel URL and test:
- Registration
- Login
- Battle system
- Leaderboards

---

## Option 2: Everything on Railway

### Step 1: Push Entire Project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create Railway Project

1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"

### Step 3: Configure Backend Service

1. **Add Backend Service:**
   - Root Directory: `backend`
   - Start Command: `npm start`

2. **Set Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=generate_new_secret_here
   DB_HOST=pd04u8.h.filess.io
   DB_PORT=3307
   DB_NAME=Under_Delta_Tale_Rune_carefulbet
   DB_USER=Under_Delta_Tale_Rune_carefulbet
   DB_PASSWORD=84219052d20c92b9fafb24b25d7819e4173d64f7
   FRONTEND_URL=https://your-frontend-railway-url.railway.app
   ```

### Step 4: Add Static File Service for Frontend

**Option A: Use Railway's Static File Hosting**

Create `railway.json` in project root:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Create a simple Node.js server in project root (`frontend-server.js`):
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
```

**Option B: Use Caddy or Nginx (More Complex)**

Not recommended for this use case.

---

## Alternative: Render.com

Render is another great option, very similar to Railway:

### Backend on Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (same as Railway)

### Frontend on Render (Static Site)

1. Create new "Static Site"
2. Configure:
   - Build Command: (leave empty)
   - Publish Directory: `.`

---

## Database Options

### Option A: Keep filess.io (Current Setup)
- ✅ Already configured and working
- ✅ No changes needed
- ✅ Free tier

### Option B: Railway PostgreSQL
1. In Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway auto-generates connection variables
3. Update `backend/config/database.js` to use PostgreSQL
4. Install `pg` package: `npm install pg`
5. Modify schema for PostgreSQL syntax

### Option C: PlanetScale MySQL
- Free tier: 5GB storage
- Better performance than filess.io
- Requires account at https://planetscale.com

---

## Cost Breakdown

### Free Tier Limits

**Railway:**
- $5 credit/month (500 execution hours)
- Good for hobby projects
- After credit: ~$0.01/hour

**Vercel:**
- Unlimited bandwidth (frontend)
- 100 deployments/day
- Free forever for personal projects

**Render:**
- Free tier includes 750 hours/month
- Services spin down after 15min inactivity
- Slower cold starts

### Estimated Monthly Cost

**Development/Hobby:**
- Railway Backend: $0-5/month
- Vercel Frontend: $0/month
- filess.io Database: $0/month
- **Total: $0-5/month**

**Production (with traffic):**
- Railway Backend: $5-20/month
- Vercel Frontend: $0-20/month (if you hit limits)
- Upgraded Database: $0-10/month
- **Total: $5-50/month**

---

## Recommended Deployment Strategy

### Phase 1: Development (Current)
```
Local Backend (localhost:3000)
Local Frontend (localhost:8080)
filess.io Database
```

### Phase 2: Testing Deployment
```
Railway Backend (free tier)
Vercel Frontend (free tier)
filess.io Database
```

### Phase 3: Production
```
Railway Backend (paid if needed)
Vercel Frontend (scales automatically)
PlanetScale/Railway Database
CDN for sprites (Cloudflare)
```

---

## Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Deploy backend to Railway
- [ ] Set environment variables
- [ ] Get Railway backend URL
- [ ] Update frontend API client with Railway URL
- [ ] Deploy frontend to Vercel
- [ ] Update CORS in Railway with Vercel URL
- [ ] Test authentication flow
- [ ] Test battle system
- [ ] Test leaderboards
- [ ] Generate new JWT secret for production
- [ ] Enable HTTPS (automatic on both platforms)

---

## Troubleshooting

### Backend won't start on Railway
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script
- Check database connection (test with `node database/init.js`)

### CORS errors
- Verify `FRONTEND_URL` in Railway matches your Vercel URL
- Include protocol: `https://your-app.vercel.app` (not just domain)
- Check Railway logs for CORS-related errors

### Database connection fails
- Verify filess.io credentials
- Check if filess.io allows connections from Railway IPs
- Consider switching to Railway PostgreSQL

### Frontend can't reach backend
- Verify API URL in `ApiClient.js`
- Check Railway service is running
- Test backend endpoint directly: `https://your-app.railway.app/api/health`

---

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Railway: Add custom domain in settings
   - Vercel: Add custom domain in project settings
   - Update CORS to include custom domain

2. **Environment-Specific Configs**:
   ```javascript
   const isDevelopment = window.location.hostname === 'localhost';
   const API_URL = isDevelopment 
     ? 'http://localhost:3000/api'
     : 'https://api.yourdomain.com/api';
   ```

3. **Monitoring**:
   - Railway has built-in metrics
   - Consider adding Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot)

4. **Performance**:
   - Enable gzip compression
   - Add caching headers for sprites
   - Consider CDN for `data/assets/`

---

**Ready to deploy? Start with Option 1 (Railway + Vercel) for the best free-tier experience!**
