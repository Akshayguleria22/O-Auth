# 🚀 Deployment Guide

This guide covers deploying your MERN OAuth2 application to production. We'll cover multiple deployment options.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Production MongoDB database ready
- [ ] OAuth credentials for production URLs obtained
- [ ] Security review completed
- [ ] Build process tested

---

## 🌐 Option 1: Vercel (Frontend) + Render (Backend) [RECOMMENDED - FREE]

This is the easiest and completely free option for getting started.

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: kanika-backend (or your choice)
     Region: Choose closest to you
     Branch: main
     Root Directory: server
     Environment: Node
     Build Command: npm install
     Start Command: npm start
     ```

3. **Add Environment Variables** (in Render dashboard)
   ```env
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://your-frontend.vercel.app
   
   MONGODB_URI=your-production-mongodb-uri
   
   JWT_SECRET=generate-a-strong-random-secret-here
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/oauth/google/callback
   
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=https://your-backend.onrender.com/api/auth/oauth/github/callback
   
   COOKIE_SECRET=generate-another-strong-secret
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)
   - Note your backend URL: `https://your-app.onrender.com`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable**
   ```env
   VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Update vite.config.js** (if needed for production)
   ```javascript
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     server: {
       port: 3000,
       proxy: process.env.NODE_ENV === 'development' ? {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true,
         }
       } : undefined
     },
     // Add base URL if deploying to subdirectory
     // base: '/your-app/',
   });
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Note your frontend URL: `https://your-app.vercel.app`

### Step 3: Update OAuth Providers

#### Google OAuth Console
1. Go to https://console.cloud.google.com/
2. Navigate to your OAuth credentials
3. Add authorized redirect URIs:
   ```
   https://your-backend.onrender.com/api/auth/oauth/google/callback
   ```
4. Add authorized JavaScript origins:
   ```
   https://your-frontend.vercel.app
   ```

#### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Update Authorization callback URL:
   ```
   https://your-backend.onrender.com/api/auth/oauth/github/callback
   ```
4. Update Homepage URL:
   ```
   https://your-frontend.vercel.app
   ```

### Step 4: Update Backend CORS

Update `server/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Step 5: Update Frontend API Calls

Update `client/src/api/axios.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

---

## 🚀 Option 2: Railway [EASY - FREE TIER]

Railway can host both frontend and backend.

### Deploy Full Stack to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MongoDB**
   - Click "New"
   - Select "Database" → "MongoDB"
   - Copy the connection string

4. **Configure Backend Service**
   - Click on your service
   - Settings → Root Directory: `server`
   - Add environment variables (same as Render above)
   - Custom Start Command: `npm start`
   - Click "Generate Domain" to get your backend URL

5. **Configure Frontend Service**
   - Click "New" → "GitHub Repo" → Same repo
   - Settings → Root Directory: `client`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```
   - Click "Generate Domain" to get your frontend URL

6. **Update OAuth Callbacks** (same as above with your Railway URLs)

---

## 🐳 Option 3: Docker + VPS (DigitalOcean, AWS, etc.)

For full control, deploy using Docker.

### Create Dockerfiles

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf** (`client/nginx.conf`):
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**docker-compose.yml** (root directory):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: kanika-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: kanika-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/kanika?authSource=admin
      CLIENT_URL: ${CLIENT_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_ACCESS_EXPIRE: 15m
      JWT_REFRESH_EXPIRE: 7d
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_CALLBACK_URL: ${GOOGLE_CALLBACK_URL}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      GITHUB_CALLBACK_URL: ${GITHUB_CALLBACK_URL}
      COOKIE_SECRET: ${COOKIE_SECRET}
    depends_on:
      - mongodb
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: kanika-frontend
    restart: always
    environment:
      VITE_API_URL: ${BACKEND_URL}
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  mongodb_data:
```

**.env.production**:
```env
MONGO_PASSWORD=your-secure-password
CLIENT_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/oauth/google/callback
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/oauth/github/callback
COOKIE_SECRET=your-cookie-secret
```

**Deploy to VPS**:
```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
git clone your-repo-url
cd your-repo

# Copy environment file
cp .env.production .env

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f
```

---

## 🔒 Production Security Checklist

- [ ] **Environment Variables**
  - [ ] Strong JWT_SECRET (min 32 chars)
  - [ ] Strong COOKIE_SECRET (min 32 chars)
  - [ ] Secure MongoDB credentials
  
- [ ] **OAuth Configuration**
  - [ ] Production callback URLs configured
  - [ ] OAuth apps set to production mode
  - [ ] Redirect URIs whitelisted
  
- [ ] **Server Configuration**
  - [ ] HTTPS enabled (use Cloudflare/Let's Encrypt)
  - [ ] Rate limiting configured
  - [ ] CORS restricted to your domain
  - [ ] Helmet.js security headers enabled
  
- [ ] **Database**
  - [ ] MongoDB authentication enabled
  - [ ] Database backups configured
  - [ ] Connection pooling optimized
  
- [ ] **Monitoring**
  - [ ] Error logging (Sentry, LogRocket)
  - [ ] Uptime monitoring (UptimeRobot)
  - [ ] Performance monitoring

---

## 🛠️ Generate Strong Secrets

Use these commands to generate secure secrets:

**PowerShell:**
```powershell
# JWT Secret (32 bytes)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Cookie Secret (32 bytes)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

---

## 📊 Post-Deployment Testing

1. **Test OAuth Flows**
   - [ ] Google login works
   - [ ] GitHub login works
   - [ ] Account linking works
   - [ ] Unlink provider works

2. **Test Authentication**
   - [ ] Register new user
   - [ ] Login with email/password
   - [ ] Logout works
   - [ ] Token refresh works

3. **Test Profile**
   - [ ] Update profile
   - [ ] Upload avatar
   - [ ] Change password
   - [ ] Delete account

4. **Test Admin Panel** (if applicable)
   - [ ] View all users
   - [ ] Change user roles
   - [ ] View auth logs

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd server && npm ci
      - run: cd server && npm test
      # Add deployment steps for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd client && npm ci
      - run: cd client && npm run build
      # Add deployment steps for your platform
```

---

## 🆘 Troubleshooting

### Issue: OAuth callback not working
**Solution:** Verify callback URLs match exactly in:
- OAuth provider settings
- Environment variables
- No trailing slashes

### Issue: CORS errors
**Solution:** Check CLIENT_URL in backend .env matches your frontend domain exactly

### Issue: Database connection failed
**Solution:** 
- Verify MongoDB URI is correct
- Check if database allows connections from your server IP
- For MongoDB Atlas, whitelist your server IP or use 0.0.0.0/0

### Issue: Cookies not being set
**Solution:**
- Ensure `credentials: true` in axios config
- Verify `withCredentials: true` in CORS
- For production, ensure both domains use HTTPS
- Check cookie SameSite settings

---

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [GitHub OAuth Setup](https://github.com/settings/developers)

---

**Need help?** Check the logs:
- Render: View logs in dashboard
- Vercel: Runtime logs in dashboard
- Railway: Deployments tab → View logs
- Docker: `docker-compose logs -f`

Good luck with your deployment! 🚀
