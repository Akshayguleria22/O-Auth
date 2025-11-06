# OAuth2 Social Login - Frontend

React + Vite application with Google & Facebook OAuth2 integration, built with Tailwind CSS.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run at `http://localhost:3000`

## 📁 Project Structure

```
client/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance with interceptors
│   │   └── index.js          # API endpoint functions
│   ├── components/
│   │   ├── Navbar.jsx        # Navigation bar
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── SocialLoginButtons.jsx # OAuth buttons
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication state
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── Dashboard.jsx     # User dashboard
│   │   ├── Profile.jsx       # Profile management
│   │   ├── Settings.jsx      # Account settings & provider linking
│   │   ├── AdminPanel.jsx    # Admin user management
│   │   └── AuthError.jsx     # OAuth error handling
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles (Tailwind)
├── public/
├── .env                      # Environment variables
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json
```

## 🎨 Features

### Authentication
- ✅ Email/Password registration with validation
- ✅ Local login with JWT tokens
- ✅ Google OAuth2 social login
- ✅ Facebook OAuth2 social login
- ✅ Automatic token refresh
- ✅ Protected routes with role-based access

### User Features
- ✅ Profile management (name, display name)
- ✅ Link/unlink multiple OAuth providers
- ✅ View authentication logs
- ✅ Account deletion

### Admin Features
- ✅ User management dashboard
- ✅ Role assignment (user/admin)
- ✅ View all users and their providers
- ✅ User search functionality

## 🔐 Authentication Flow

### Registration & Login
1. User registers with email/password or clicks OAuth button
2. For OAuth: Backend generates PKCE code verifier and auth URL
3. User authorizes on provider (Google/Facebook)
4. Provider redirects to backend callback with auth code
5. Backend exchanges code for tokens using PKCE verifier
6. Backend creates/links user account and sets JWT cookies
7. Frontend redirects to dashboard

### Token Management
- Access tokens (15 min expiry) stored in httpOnly cookies
- Refresh tokens (7 day expiry) for automatic renewal
- Axios interceptor automatically refreshes expired tokens
- Logout revokes all refresh tokens

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Pages & Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Home | Public | Landing page with features |
| `/login` | Login | Public | Login form + OAuth buttons |
| `/register` | Register | Public | Registration form + OAuth |
| `/dashboard` | Dashboard | Protected | User stats & activity logs |
| `/profile` | Profile | Protected | Edit profile information |
| `/settings` | Settings | Protected | Link/unlink OAuth accounts |
| `/admin` | AdminPanel | Admin only | User management |
| `/auth/error` | AuthError | Public | OAuth error messages |

## 🔌 API Integration

All API calls are centralized in `src/api/index.js`:

```javascript
import { authAPI, userAPI } from './api';

// Authentication
await authAPI.login({ email, password });
await authAPI.register(userData);
await authAPI.logout();
await authAPI.getCurrentUser();
await authAPI.initiateOAuth('google');
await authAPI.linkProvider('facebook');
await authAPI.unlinkProvider('google');

// User management
await userAPI.getProfile();
await userAPI.updateProfile(data);
await userAPI.getLinkedProviders();
await userAPI.getAuthLogs();
await userAPI.deleteAccount();
await userAPI.getAllUsers(); // Admin only
await userAPI.updateUserRole(userId, role); // Admin only
```

## 🎨 Styling with Tailwind CSS

### Custom Theme Colors

```javascript
// tailwind.config.js
colors: {
  primary: {
    100: '#e9dcf9',
    500: '#667eea', // Main purple
    600: '#5568d3',
  },
  secondary: {
    100: '#e7d4ea',
    500: '#764ba2', // Dark purple
    600: '#653a8a',
  }
}
```

### Custom Components

Pre-built component classes in `index.css`:
- `.btn`, `.btn-primary`, `.btn-secondary` - Button styles
- `.input` - Form input styling
- `.card` - Container with shadow
- `.spinner` - Loading animation

## 🔒 Security Features

- ✅ JWT tokens in httpOnly cookies (XSS protection)
- ✅ CSRF protection with SameSite cookies
- ✅ Automatic token refresh
- ✅ OAuth2 PKCE flow
- ✅ State validation for OAuth callbacks
- ✅ Input validation on forms
- ✅ Protected routes with authentication check

## 🐛 Troubleshooting

### CORS Issues
Make sure backend allows your frontend origin:
```javascript
// Backend server.js
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

### OAuth Errors
1. Check redirect URIs in Google/Facebook console
2. Verify backend OAuth credentials in `.env`
3. Check browser console for error details

### Token Issues
- Clear browser cookies and localStorage
- Check if backend is running on port 5000
- Verify proxy configuration in `vite.config.js`

## 📦 Dependencies

### Core
- `react` ^19.1.1 - UI library
- `react-dom` ^19.1.1 - React DOM renderer
- `react-router-dom` - Client-side routing
- `axios` - HTTP client

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `@tailwindcss/vite` - Vite plugin
- `react-icons` - Icon library
- `react-toastify` - Toast notifications

### Build Tools
- `vite` ^7.1.7 - Build tool
- `@vitejs/plugin-react` - React support

## 🚀 Production Build

### Build the app
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

The build output will be in the `dist` folder.

### Environment Variables for Production

Update `.env` for production:
```env
VITE_API_URL=https://your-backend-api.com/api
```

## 📝 Notes

- All pages are responsive and mobile-friendly
- Tailwind CSS provides consistent styling
- Toast notifications for user feedback
- Loading states for better UX
- Form validation with error messages
- Profile pictures from OAuth providers displayed
- Authentication logs show recent activity

## 🤝 Backend Integration

This frontend requires the backend server running on `http://localhost:5000`.

See the main project README for backend setup instructions.
