# MERN OAuth2 Social Login

A complete, production-ready MERN stack application with OAuth2 social login integration for Google and Facebook. Features secure authentication with PKCE, JWT sessions, account linking, and comprehensive security hardening.

## 🚀 Features

### Authentication & Authorization
- ✅ **OAuth2 Social Login** - Google and Facebook integration
- ✅ **Authorization Code Flow + PKCE** - Maximum security
- ✅ **JWT Sessions** - httpOnly cookies with SameSite protection
- ✅ **Refresh Token Strategy** - Automatic token refresh
- ✅ **Local Authentication** - Email/password registration and login
- ✅ **Account Linking/Unlinking** - Connect multiple providers
- ✅ **Role-Based Access Control** - User, Admin, Moderator roles

### Security
- ✅ **CSRF Protection** - Cookie-based flow protection
- ✅ **Rate Limiting** - Prevent abuse and brute force
- ✅ **Input Validation** - Express-validator integration
- ✅ **Helmet.js** - Security headers
- ✅ **CORS Configuration** - Strict origin validation
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **State & Nonce Validation** - OAuth flow protection

### Features
- ✅ **Profile Management** - Update user information
- ✅ **Provider Sync** - Pull name/avatar from providers
- ✅ **Admin Panel** - User management and role assignment
- ✅ **Auth Logging** - Comprehensive audit trail
- ✅ **Session Management** - Server-side token invalidation
- ✅ **Responsive Design** - Mobile-friendly UI

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Google OAuth2 credentials
- Facebook OAuth2 credentials

## 🛠️ Installation

### 1. Clone the repository
```bash
cd "c:\Users\HP VICTUS\Desktop\Kanika"
```

### 2. Install dependencies

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd client
npm install
cd ..
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
copy .env.example .env
```

Edit `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mern-oauth2

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth2
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Security
COOKIE_SECRET=your-cookie-secret-key-change-this
CSRF_SECRET=your-csrf-secret-key-change-this
```

## 🔑 OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. Configure OAuth redirect URIs in Settings
5. Add redirect URI: `http://localhost:5000/api/auth/facebook/callback`
6. Copy App ID and App Secret to `.env`
7. Make app public or add test users

## 🚀 Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
npm run dev
```

Or run separately:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

### Production Mode

Build the frontend:
```bash
npm run build
```

Start the server:
```bash
npm start
```

## 📁 Project Structure

```
mern-oauth2-social-login/
├── server/
│   ├── config/
│   │   └── oauth.js              # OAuth configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── userController.js     # User management
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── validation.js         # Input validation
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── AuthLog.js            # Auth logging
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   └── oauthService.js       # OAuth integration
│   ├── utils/
│   │   ├── jwt.js                # JWT utilities
│   │   ├── logger.js             # Winston logger
│   │   └── seedUsers.js          # Seed script
│   └── server.js                 # Express app
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js          # Axios instance
│   │   │   └── index.js          # API endpoints
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── SocialLoginButtons.js
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Settings.js
│   │   │   ├── AdminPanel.js
│   │   │   └── AuthError.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

- **PKCE Flow** - Protection against authorization code interception
- **State Parameter** - CSRF protection for OAuth flows
- **httpOnly Cookies** - XSS protection for tokens
- **SameSite Cookies** - CSRF protection
- **Rate Limiting** - Brute force protection
- **Helmet.js** - Security headers
- **Input Validation** - SQL injection and XSS prevention
- **Password Complexity** - Strong password requirements
- **Audit Logging** - Track all authentication events

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `GET /api/auth/oauth/:provider` - Initiate OAuth flow
- `GET /api/auth/:provider/callback` - OAuth callback
- `POST /api/auth/link/:provider` - Link provider to account
- `DELETE /api/auth/unlink/:provider` - Unlink provider

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/providers` - Get linked providers
- `GET /api/users/auth-logs` - Get authentication logs
- `DELETE /api/users/account` - Delete account
- `GET /api/users/all` - Get all users (admin)
- `PATCH /api/users/:userId/role` - Update user role (admin)

## 🧪 Testing

Seed test users:
```bash
npm run seed
```

Test users:
- **Admin:** admin@example.com / Admin123!
- **User:** user@example.com / User123!

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `CLIENT_URL` | Frontend URL | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes |
| `FACEBOOK_APP_ID` | Facebook app ID | Yes |
| `FACEBOOK_APP_SECRET` | Facebook app secret | Yes |

## 📝 License

MIT

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

**Note:** This is a complete working implementation. Just add your OAuth credentials in the `.env` file and you're ready to go!
