# 🚀 Getting Started Checklist

Use this checklist to set up your OAuth2 MERN application step by step.

## ✅ Initial Setup

- [ ] **Navigate to project directory**
  ```powershell
  cd "c:\Users\HP VICTUS\Desktop\Kanika"
  ```

- [ ] **Install backend dependencies**
  ```powershell
  npm install
  ```

- [ ] **Install frontend dependencies**
  ```powershell
  cd client
  npm install
  cd ..
  ```

## ✅ Database Setup

Choose one option:

### Option A: Local MongoDB
- [ ] Download MongoDB from https://www.mongodb.com/try/download/community
- [ ] Install MongoDB
- [ ] Start MongoDB service
  ```powershell
  net start MongoDB
  ```
- [ ] Verify MongoDB is running (should see no errors)

### Option B: MongoDB Atlas (Recommended for beginners)
- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster (M0 Sandbox)
- [ ] Create database user
- [ ] Whitelist IP address (0.0.0.0/0 for development)
- [ ] Get connection string
- [ ] Save connection string for later

## ✅ Google OAuth Setup

- [ ] Go to https://console.cloud.google.com/
- [ ] Sign in with Google account
- [ ] Create new project: "OAuth2-MERN-App"
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen:
  - [ ] Choose "External"
  - [ ] Fill app name: "OAuth2 MERN App"
  - [ ] Add your email as user support and developer contact
  - [ ] Add test users (your email)
- [ ] Create OAuth 2.0 Client ID:
  - [ ] Type: Web application
  - [ ] Name: "OAuth2 MERN Client"
  - [ ] Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Save credentials for .env file

## ✅ Facebook OAuth Setup

- [ ] Go to https://developers.facebook.com/
- [ ] Sign in with Facebook account
- [ ] Create new app:
  - [ ] Type: Consumer
  - [ ] Name: "OAuth2 MERN App"
- [ ] Add Facebook Login product
- [ ] Configure Facebook Login settings:
  - [ ] Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/facebook/callback`
  - [ ] Save changes
- [ ] Go to Settings → Basic
- [ ] Copy App ID
- [ ] Copy App Secret (click Show)
- [ ] Save credentials for .env file

## ✅ Environment Configuration

- [ ] Copy .env.example to .env
  ```powershell
  copy .env.example .env
  ```

- [ ] Open .env in text editor

- [ ] Fill in MongoDB URI:
  - Local: `mongodb://localhost:27017/mern-oauth2`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/mern-oauth2`

- [ ] Generate JWT_SECRET (run in PowerShell):
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
  - [ ] Copy output to JWT_SECRET

- [ ] Generate COOKIE_SECRET (run same command):
  - [ ] Copy output to COOKIE_SECRET

- [ ] Generate CSRF_SECRET (run same command):
  - [ ] Copy output to CSRF_SECRET

- [ ] Paste Google credentials:
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET

- [ ] Paste Facebook credentials:
  - [ ] FACEBOOK_APP_ID
  - [ ] FACEBOOK_APP_SECRET

- [ ] Save .env file

## ✅ Verify Configuration

- [ ] Check .env file has all required variables filled
- [ ] No placeholder text like "your-..." remaining
- [ ] All secrets are random and strong
- [ ] OAuth credentials are correct

## ✅ Initial Run

- [ ] Seed test users (optional but recommended):
  ```powershell
  npm run seed
  ```
  - You should see: "Seeded 2 users successfully"

- [ ] Start the application:
  ```powershell
  npm run dev
  ```

- [ ] Verify no errors in console
- [ ] Backend should start on port 5000
- [ ] Frontend should start on port 3000
- [ ] Browser should open automatically to http://localhost:3000

## ✅ First Test

- [ ] Home page loads successfully
- [ ] Click "Get Started" or "Sign In"
- [ ] Try registering a new account:
  - [ ] Email: your-email@example.com
  - [ ] Password: TestPass123!
  - [ ] Registration successful
- [ ] Login with credentials
  - [ ] Login successful
  - [ ] Redirected to Dashboard
- [ ] Test Google OAuth:
  - [ ] Logout
  - [ ] Click "Continue with Google"
  - [ ] Choose Google account
  - [ ] Consent to permissions
  - [ ] Successfully logged in
  - [ ] Check Dashboard shows Google provider
- [ ] Test Facebook OAuth:
  - [ ] Logout
  - [ ] Click "Continue with Facebook"
  - [ ] Login to Facebook
  - [ ] Successfully logged in

## ✅ Feature Testing

- [ ] **Profile Page**:
  - [ ] View profile information
  - [ ] Update first name, last name
  - [ ] Changes saved successfully

- [ ] **Settings Page**:
  - [ ] View linked accounts
  - [ ] Link another provider
  - [ ] Unlink a provider (ensure you have another login method!)

- [ ] **Dashboard**:
  - [ ] View account status
  - [ ] See linked providers
  - [ ] Check login count

- [ ] **Admin Panel** (if admin user):
  - [ ] View all users
  - [ ] Search users
  - [ ] Filter by role
  - [ ] Update user role

## ✅ Security Checks

- [ ] Passwords are hashed (not visible in database)
- [ ] Access tokens are in httpOnly cookies
- [ ] Cannot access /admin without admin role
- [ ] Cannot access /dashboard without login
- [ ] Rate limiting works (try 6+ failed logins)

## 🎉 Success Criteria

You're ready to go when:

- [ ] Application runs without errors
- [ ] Can register and login locally
- [ ] Can login with Google
- [ ] Can login with Facebook
- [ ] Can link/unlink providers
- [ ] Profile updates work
- [ ] Admin panel accessible (for admin users)
- [ ] No console errors or warnings

## 📚 Next Steps

After completing the checklist:

1. **Read the Documentation**
   - [ ] Review DOCUMENTATION.md for detailed info
   - [ ] Understand the architecture
   - [ ] Review API endpoints

2. **Customize the Application**
   - [ ] Update colors and branding
   - [ ] Add your logo
   - [ ] Modify welcome messages

3. **Deploy to Production**
   - [ ] Choose hosting platform
   - [ ] Update OAuth redirect URIs
   - [ ] Set production environment variables
   - [ ] Test thoroughly before launch

## ❓ Having Issues?

### Can't start MongoDB?
- Check if MongoDB is installed: `mongod --version`
- Use MongoDB Atlas instead (cloud option)

### OAuth redirect mismatch?
- Ensure redirect URIs match exactly
- Include `http://` or `https://`
- No trailing slashes

### Port already in use?
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

### Token errors?
- Check JWT_SECRET is set in .env
- Ensure .env file is in root directory
- Restart the server after changing .env

### Can't login with Google/Facebook?
- Verify credentials in .env
- Check redirect URIs in console
- Add yourself as test user
- Clear browser cookies

## 📞 Support Resources

- **Setup Guide**: SETUP_GUIDE.md
- **Full Documentation**: DOCUMENTATION.md
- **API Reference**: DOCUMENTATION.md (API section)
- **README**: README.md

---

**Pro Tips:**
- Keep your .env file secret and never commit it
- Use strong passwords in production
- Test thoroughly before deploying
- Keep dependencies updated
- Monitor logs regularly

**Status**: 
- [ ] Setup Complete
- [ ] Application Running
- [ ] All Tests Passed
- [ ] Ready for Development

🎊 **Congratulations on setting up your OAuth2 MERN application!** 🎊
