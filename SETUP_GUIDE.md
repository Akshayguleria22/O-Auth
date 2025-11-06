# Quick Setup Guide

Follow these steps to get your OAuth2 application running in minutes!

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Use it in the `.env` file

## Step 3: Get OAuth Credentials

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a Project**
   - Click "Select a project" → "New Project"
   - Name: "OAuth2-MERN-App"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Click "Create"
   - Fill in:
     - App name: "OAuth2 MERN App"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip Scopes → Save and Continue
   - Add test users (your email)
   - Click "Save and Continue"

5. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "OAuth2 MERN Client"
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `http://localhost:3000` (optional)
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

### Facebook OAuth Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Sign in with your Facebook account

2. **Create an App**
   - Click "My Apps" → "Create App"
   - Choose "Consumer" → Click "Next"
   - App name: "OAuth2 MERN App"
   - App contact email: your email
   - Click "Create App"

3. **Add Facebook Login**
   - In dashboard, find "Facebook Login"
   - Click "Set Up"
   - Choose "Web"
   - Site URL: `http://localhost:3000`
   - Click "Save" → "Continue"

4. **Configure OAuth Settings**
   - Go to "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     - `http://localhost:5000/api/auth/facebook/callback`
   - Click "Save Changes"

5. **Get App Credentials**
   - Go to "Settings" → "Basic"
   - Copy **App ID** and **App Secret**

6. **Make App Public (Optional)**
   - For testing, add test users in "Roles" → "Test Users"
   - OR make app public in "App Review"

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```

2. Open `.env` in a text editor and fill in your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB - Use your connection string
MONGODB_URI=mongodb://localhost:27017/mern-oauth2
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-oauth2

# JWT Configuration - Generate random strings
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Google OAuth2 - Paste your credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth2 - Paste your credentials
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Security - Generate random strings
COOKIE_SECRET=your-random-cookie-secret-key
CSRF_SECRET=your-random-csrf-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Generate Random Secrets

You can generate random secrets in PowerShell:

```powershell
# Generate JWT Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate Cookie Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate CSRF Secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Step 5: Seed Test Users (Optional)

Create test users in the database:

```powershell
npm run seed
```

Test credentials:
- **Admin:** admin@example.com / Admin123!
- **User:** user@example.com / User123!

## Step 6: Run the Application

### Development Mode (Recommended)

Run both backend and frontend together:

```powershell
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

### Run Separately

**Backend:**
```powershell
npm run server
```

**Frontend (in new terminal):**
```powershell
npm run client
```

## Step 7: Test the Application

1. Open your browser and go to `http://localhost:3000`
2. Try registering a new account
3. Test social login with Google
4. Test social login with Facebook
5. Link/unlink providers in Settings
6. Check the Dashboard

## Troubleshooting

### MongoDB Connection Issues

**Error:** "MongoServerError: connect ECONNREFUSED"

**Solution:**
- Ensure MongoDB is running: `net start MongoDB`
- Check MongoDB URI in `.env`
- For Atlas, whitelist your IP address

### OAuth Redirect URI Mismatch

**Error:** "redirect_uri_mismatch"

**Solution:**
- Check that redirect URIs in Google/Facebook console match exactly with `.env`
- Include `http://` or `https://`
- No trailing slashes

### Port Already in Use

**Error:** "EADDRINUSE: address already in use"

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### CORS Errors

**Solution:**
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Clear browser cache
- Try incognito mode

### Google OAuth "Access Blocked"

**Solution:**
- Add your email as a test user in Google Console
- OR publish your app (requires verification)
- Ensure consent screen is configured

### Facebook OAuth Not Working

**Solution:**
- Add test users in Facebook App settings
- Ensure app is in Development mode
- Check redirect URIs are correct
- Verify App ID and Secret

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-random-production-secret
# Update OAuth callback URLs to production domain
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback
```

### Build for Production

```powershell
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## Next Steps

1. **Customize the UI** - Update colors, logos, and branding
2. **Add More Features** - Email verification, password reset
3. **Deploy** - Heroku, Vercel, AWS, DigitalOcean
4. **Add More Providers** - GitHub, Twitter, LinkedIn
5. **Implement 2FA** - Additional security layer

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review the logs in `logs/` folder
3. Ensure all environment variables are set correctly
4. Verify OAuth credentials and redirect URIs

## Security Checklist

Before going to production:

- [ ] Change all default secrets in `.env`
- [ ] Use strong, random JWT secrets (min 32 chars)
- [ ] Enable HTTPS for production
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Configure MongoDB authentication
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Review and test error handling
- [ ] Set up monitoring and logging
- [ ] Backup database regularly

---

**Congratulations!** 🎉 Your OAuth2 social login application is now ready!
