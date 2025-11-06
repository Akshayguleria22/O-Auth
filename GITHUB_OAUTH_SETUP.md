# GitHub OAuth Setup Guide

## 🔧 How to Get GitHub OAuth Credentials

### Step 1: Go to GitHub Developer Settings
1. Visit: https://github.com/settings/developers
2. Or navigate: GitHub → Settings → Developer settings → OAuth Apps

### Step 2: Create a New OAuth App
1. Click **"New OAuth App"** button
2. Fill in the application details:

   - **Application name**: `OAuth2 Social Login` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: `OAuth2 authentication app with social login`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/oauth/github/callback`

3. Click **"Register application"**

### Step 3: Get Your Credentials
1. After creation, you'll see your **Client ID** - copy this
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** immediately (you won't see it again!)

### Step 4: Update Your `.env` File
Open `server/.env` and update these lines:

```env
# GitHub OAuth2 Configuration
GITHUB_CLIENT_ID=your_actual_github_client_id_here
GITHUB_CLIENT_SECRET=your_actual_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/oauth/github/callback
```

### Step 5: Restart Your Backend Server
```bash
cd server
npm start
```

## ✅ Testing GitHub Login

1. Go to http://localhost:3000/login
2. Click **"Continue with GitHub"**
3. You'll be redirected to GitHub to authorize
4. After authorization, you'll be redirected back and logged in!

## 🔒 Important Notes

- **Callback URL must match exactly**: `http://localhost:5000/api/auth/oauth/github/callback`
- Keep your Client Secret safe and never commit it to Git
- For production, create a new OAuth app with production URLs
- GitHub requires the `User-Agent` header in API requests (already handled in code)

## 🌐 Production Setup

When deploying to production:

1. Create a new GitHub OAuth App with production URLs:
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://yourdomain.com/api/auth/oauth/github/callback`

2. Update your production `.env`:
   ```env
   GITHUB_CLIENT_ID=production_client_id
   GITHUB_CLIENT_SECRET=production_client_secret
   GITHUB_REDIRECT_URI=https://yourdomain.com/api/auth/oauth/github/callback
   ```

## 🐛 Troubleshooting

### Error 400: invalid_request
- **Cause**: `redirect_uri` is undefined or doesn't match
- **Fix**: Make sure `GITHUB_REDIRECT_URI` is set correctly in `.env`

### User email is null
- **Cause**: GitHub user hasn't made their email public
- **Fix**: Code automatically fetches from the emails API (already implemented)

### Authorization failed
- **Cause**: Wrong Client ID or Secret
- **Fix**: Double-check credentials in GitHub OAuth App settings

## 📝 What Changed from Facebook?

✅ Updated backend OAuth configuration for GitHub
✅ Changed token exchange to use GitHub's API
✅ Added GitHub-specific headers (User-Agent, Accept)
✅ Added separate email fetching for private emails
✅ Updated profile normalization for GitHub data
✅ Updated frontend components to use GitHub icon
✅ Changed button styling for GitHub (dark theme)

Your app now uses **Google + GitHub** for social login! 🎉
