# Railway Deployment - Environment Variables

## Backend Service (under-delta-tale-rune-fight-sim-production.up.railway.app)

**Root Directory:** `backend`

### Required Environment Variables:

```env
# Database Configuration (filess.io)
DB_HOST=pd04u8.h.filess.io
DB_PORT=3307
DB_NAME=Under_Delta_Tale_Rune_carefulbet
DB_USER=Under_Delta_Tale_Rune_carefulbet
DB_PASSWORD=84219052d20c92b9fafb24b25d7819e4173d64f7

# JWT Authentication
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Server Configuration
NODE_ENV=production
PORT=${{RAILWAY_PORT}}

# CORS Configuration - MUST match frontend URL exactly
FRONTEND_URL=https://undertale-fight-sim.up.railway.app
```

### Generate JWT_SECRET:
```bash
openssl rand -base64 32
```

---

## Frontend Service (undertale-fight-sim.up.railway.app)

**Root Directory:** `.` (project root)

### No Environment Variables Required

Frontend automatically uses:
- `https://under-delta-tale-rune-fight-sim-production.up.railway.app/api` for API calls (configured in `src/api/ApiClient.js`)

---

## Deployment Instructions

### 1. Backend Service Setup

1. In Railway dashboard, select your backend service
2. Go to **Settings** → **Root Directory** → Set to: `backend`
3. Go to **Variables** tab → Add all environment variables listed above
4. Deploy from GitHub (should auto-deploy on push to main branch)

### 2. Frontend Service Setup

1. In Railway dashboard, create a new service (or select existing frontend service)
2. Connect to the same GitHub repository
3. Go to **Settings** → **Root Directory** → Set to: `.` (leave empty or set to root)
4. No environment variables needed
5. Deploy from GitHub (should auto-deploy on push to main branch)

### 3. Verify Deployment

**Backend Health Check:**
```bash
curl https://under-delta-tale-rune-fight-sim-production.up.railway.app/health
# Should return: OK

curl https://under-delta-tale-rune-fight-sim-production.up.railway.app/api/health
# Should return: {"status":"ok","message":"Server and DB are reachable"}
```

**Frontend:**
- Visit: https://undertale-fight-sim.up.railway.app/
- Should load the game interface
- Check browser console for any CORS errors

### 4. Troubleshooting

**CORS Errors:**
- Verify `FRONTEND_URL` in backend matches exactly: `https://undertale-fight-sim.up.railway.app`
- No trailing slash
- Must be HTTPS in production

**Backend Won't Start:**
- Check Railway logs for database connection errors
- Verify all DB credentials are correct
- Ensure `JWT_SECRET` is set

**Frontend 404 Errors:**
- Verify root directory is set to `.` (project root)
- Check that `index.html` exists in root
- Verify Railway is serving static files with `http-server`

---

## File Structure

```
/
├── package.json              # Frontend static server config
├── railway.toml              # Frontend Railway config
├── .railwayignore           # Files to ignore for frontend
├── index.html               # Main game page
├── css/                     # Stylesheets
├── src/                     # JavaScript source
├── data/                    # Game assets
└── backend/
    ├── package.json         # Backend dependencies
    ├── nixpacks.toml        # Backend Railway build config
    ├── server.js            # Express server
    └── ...                  # Other backend files
```
