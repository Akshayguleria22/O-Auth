# 🚀 Quick Start Guide

## ✅ Frontend is Running!

Your React frontend is now running at: **http://localhost:3000**

## 🔧 Next Steps to Complete Setup

### 1. Install MongoDB (if not already installed)

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**Start MongoDB locally:**
```bash
mongod
```

### 2. Update Backend `.env` File

The `.env` file has been created at `server/.env`. You need to update:

#### Required (to run locally):
- ✅ `MONGODB_URI` - Update if using Atlas or different local URI
- ✅ `JWT_SECRET` - Change to a random secret string
- ✅ `COOKIE_SECRET` - Change to a random secret string

#### Optional (for OAuth to work):
- `GOOGLE_CLIENT_ID` - Get from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console
- `FACEBOOK_APP_ID` - Get from Facebook Developers
- `FACEBOOK_APP_SECRET` - Get from Facebook Developers

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Start Backend Server

```bash
cd server
npm start
```

The backend will run on **http://localhost:5000**

### 5. Test the Application

1. **Without OAuth** (works immediately):
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Register with email/password
   - Login and explore the dashboard

2. **With OAuth** (requires credentials):
   - Get Google OAuth credentials: https://console.cloud.google.com/
   - Get Facebook App credentials: https://developers.facebook.com/
   - Update the `.env` file with your credentials
   - Restart the backend server
   - Try "Continue with Google" or "Continue with Facebook"

## 📋 What's Working Now

✅ **Frontend** (http://localhost:3000):
- Registration page
- Login page
- Home page with features
- All routing configured
- Tailwind CSS styling
- Protected routes

⏳ **Backend** (needs `.env` configuration):
- Server code ready
- MongoDB connection (needs URI)
- JWT authentication
- OAuth2 integration (needs credentials)
- All API endpoints

## 🔐 Getting OAuth Credentials

### Google OAuth Setup:

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:5000/api/auth/oauth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Facebook OAuth Setup:

1. Go to https://developers.facebook.com/apps/
2. Create a new app
3. Add "Facebook Login" product
4. In Settings → Basic, copy App ID and App Secret
5. In Facebook Login → Settings, add redirect URI: `http://localhost:5000/api/auth/oauth/facebook/callback`
6. Paste credentials in `.env`

## 🐛 Troubleshooting

### Frontend Not Loading?
- Check if running on http://localhost:3000
- Clear browser cache
- Check browser console for errors

### Backend Not Starting?
- Ensure MongoDB is running
- Check `.env` file exists in server folder
- Verify MONGODB_URI is correct
- Run `npm install` in server folder

### OAuth Not Working?
- Verify credentials in `.env`
- Check redirect URIs match exactly
- Ensure backend is running on port 5000
- Check browser console and server logs

## 📚 Documentation

- Full README: See root `README.md`
- Frontend docs: See `CLIENT_README.md`
- Setup guide: See `SETUP_GUIDE.md`
- API docs: See `DOCUMENTATION.md`

## 🎉 Quick Test Without OAuth

You can test the app immediately without OAuth:

1. Make sure MongoDB is running
2. Start backend: `cd server && npm start`
3. Frontend is already running at http://localhost:3000
4. Register with email/password
5. Login and explore!

---

**Current Status:**
- ✅ Frontend: Running on port 3000
- ⏳ Backend: Needs `.env` configuration and MongoDB
- ⏳ MongoDB: Needs to be started
- ⏳ OAuth: Optional - needs credentials

**Next command to run:**
```bash
cd server
npm start
```
