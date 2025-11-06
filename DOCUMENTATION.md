# Project Documentation

## Architecture Overview

This is a full-stack MERN (MongoDB, Express, React, Node.js) application implementing OAuth2 social login with Google and Facebook.

### Technology Stack

**Backend:**
- Node.js v14+
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Passport.js alternative - Custom OAuth implementation

**Frontend:**
- React 18
- React Router v6 - Navigation
- Axios - HTTP client
- React Toastify - Notifications
- React Icons - UI icons

**Security:**
- Helmet.js - Security headers
- CORS - Cross-origin protection
- Express Rate Limit - Rate limiting
- Express Validator - Input validation
- Cookie Parser - Secure cookies

### OAuth2 Flow Diagram

```
User → Frontend → Backend → OAuth Provider → Backend → Frontend → User
  |                  |            |              |          |
  1. Click          2. Generate  3. Redirect    4. Code    5. Token
     "Login"           PKCE         to Google      Back      Exchange
                       State
```

## Database Schema

### User Model

```javascript
{
  email: String (required, unique),
  password: String (hashed, optional),
  firstName: String,
  lastName: String,
  displayName: String,
  profilePicture: String,
  role: String (user|admin|moderator),
  providers: [{
    providerId: String,
    providerType: String (google|facebook),
    email: String,
    displayName: String,
    profilePicture: String,
    accessToken: String,
    refreshToken: String,
    linkedAt: Date
  }],
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  loginCount: Number,
  metadata: {
    signupSource: String,
    ipAddress: String,
    userAgent: String
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### AuthLog Model

```javascript
{
  userId: ObjectId (ref: User),
  email: String,
  action: String (login|logout|register|oauth_login|...),
  provider: String (local|google|facebook),
  success: Boolean,
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
  correlationId: String,
  metadata: Mixed,
  timestamp: Date
}
```

## API Reference

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... }
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
Sets httpOnly cookies: accessToken, refreshToken
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... }
  }
}
```

#### Initiate OAuth Flow
```
GET /api/auth/oauth/:provider?redirectPath=/dashboard

Response:
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

#### OAuth Callback
```
GET /api/auth/:provider/callback?code=...&state=...

Response:
Redirects to CLIENT_URL with tokens in cookies
```

#### Refresh Token
```
POST /api/auth/refresh

Response:
Sets new httpOnly cookies
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

#### Link Provider
```
POST /api/auth/link/:provider
Authorization: Required (JWT)

Response:
{
  "success": true,
  "data": {
    "authUrl": "https://..."
  }
}
```

#### Unlink Provider
```
DELETE /api/auth/unlink/:provider
Authorization: Required (JWT)

Response:
{
  "success": true,
  "message": "google account unlinked successfully",
  "data": {
    "user": { ... }
  }
}
```

### User Endpoints

#### Get Profile
```
GET /api/users/profile
Authorization: Required (JWT)

Response:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

#### Update Profile
```
PUT /api/users/profile
Authorization: Required (JWT)
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "displayName": "Jane S."
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

#### Get Auth Logs
```
GET /api/users/auth-logs?limit=20&skip=0
Authorization: Required (JWT)

Response:
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {
      "total": 45,
      "limit": 20,
      "skip": 0
    }
  }
}
```

## Security Implementation

### 1. OAuth2 PKCE Flow

**PKCE (Proof Key for Code Exchange)** prevents authorization code interception attacks.

```javascript
// Generate code verifier and challenge
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Store verifier server-side
// Send challenge in authorization request
// Verify on token exchange
```

### 2. State Parameter

Prevents CSRF attacks on OAuth flow:

```javascript
const state = crypto.randomBytes(32).toString('hex');
// Store state server-side with expiry
// Validate on callback
```

### 3. JWT Token Strategy

**Access Token:**
- Short-lived (15 minutes)
- Contains user ID, email, role
- Stored in httpOnly cookie
- Used for API authentication

**Refresh Token:**
- Long-lived (7 days)
- Stored in httpOnly cookie
- Used to obtain new access token
- Tracked in database for revocation

### 4. Cookie Security

```javascript
const cookieOptions = {
  httpOnly: true,          // Prevents XSS
  secure: true,            // HTTPS only (production)
  sameSite: 'lax',        // CSRF protection
  path: '/',
  maxAge: 15 * 60 * 1000  // 15 minutes
};
```

### 5. Rate Limiting

```javascript
// General API: 100 requests per 15 minutes
// Auth endpoints: 5 requests per 15 minutes
// OAuth endpoints: 10 requests per 15 minutes
```

### 6. Input Validation

All inputs are validated using express-validator:
- Email format
- Password complexity (min 8 chars, uppercase, lowercase, number, special)
- String length limits
- SQL injection prevention
- XSS prevention

## Frontend Architecture

### Context API

**AuthContext** manages authentication state:
- User data
- Authentication status
- Login/logout functions
- OAuth initiation
- Provider linking/unlinking

### Protected Routes

```jsx
<ProtectedRoute roles={['admin']}>
  <AdminPanel />
</ProtectedRoute>
```

### API Integration

Axios instance with:
- Credentials included
- Automatic token refresh on 401
- Request/response interceptors
- Error handling

## Development Workflow

### 1. Local Development

```bash
npm run dev  # Runs both backend and frontend
```

### 2. Database Seeding

```bash
npm run seed  # Creates test users
```

### 3. Logging

**Winston logger** writes to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

### 4. Error Handling

Centralized error handler:
- Mongoose validation errors
- JWT errors
- Duplicate key errors
- Custom application errors

## Testing Guide

### Manual Testing Checklist

**Registration:**
- [ ] Register with email/password
- [ ] Validate password requirements
- [ ] Check duplicate email handling

**Login:**
- [ ] Login with credentials
- [ ] Invalid credentials handling
- [ ] Rate limiting on failed attempts

**OAuth:**
- [ ] Google login
- [ ] Facebook login
- [ ] First-time user creation
- [ ] Returning user login
- [ ] Account linking
- [ ] Profile sync

**Session Management:**
- [ ] Token refresh
- [ ] Logout
- [ ] Multiple devices
- [ ] Token expiration

**Profile:**
- [ ] View profile
- [ ] Update profile
- [ ] View linked providers

**Settings:**
- [ ] Link provider
- [ ] Unlink provider
- [ ] Cannot unlink last method

**Admin:**
- [ ] View all users
- [ ] Update user roles
- [ ] Search/filter users

## Deployment Guide

### Environment Setup

1. **MongoDB Atlas**
   - Create cluster
   - Whitelist IPs
   - Get connection string

2. **Update OAuth Redirect URIs**
   - Google: Add production URL
   - Facebook: Add production URL

3. **Environment Variables**
   - Set NODE_ENV=production
   - Update CLIENT_URL
   - Update callback URLs
   - Generate strong secrets

### Deployment Platforms

**Heroku:**
```bash
heroku create your-app-name
heroku addons:create mongolab
heroku config:set JWT_SECRET=...
git push heroku main
```

**Vercel (Frontend):**
```bash
cd client
vercel --prod
```

**Railway (Backend):**
```bash
railway login
railway init
railway up
```

## Monitoring & Maintenance

### Logs

Check logs regularly:
```bash
# View recent logs
tail -f logs/combined.log

# View errors
tail -f logs/error.log
```

### Database Maintenance

```javascript
// Clean up expired tokens (runs on user save)
user.refreshTokens = user.refreshTokens.filter(
  rt => rt.expiresAt > new Date()
);

// Auth logs auto-delete after 90 days (TTL index)
```

### Performance Optimization

1. **Database Indexes**
   - Email (unique)
   - Provider ID + Type
   - Created date
   - Auth log timestamp

2. **Caching** (future enhancement)
   - Redis for PKCE/state storage
   - Session caching

3. **CDN** (future enhancement)
   - Static assets
   - Profile pictures

## Future Enhancements

### Planned Features

1. **Email Verification**
   - Send verification email
   - Verify token
   - Resend email

2. **Password Reset**
   - Request reset link
   - Validate token
   - Reset password

3. **Two-Factor Authentication**
   - TOTP (Google Authenticator)
   - SMS verification
   - Backup codes

4. **More OAuth Providers**
   - GitHub
   - Twitter/X
   - LinkedIn
   - Microsoft

5. **Session Management**
   - View active sessions
   - Revoke sessions
   - Device tracking

6. **Advanced Admin Features**
   - User analytics
   - Activity dashboard
   - Bulk operations

## Best Practices

### Code Organization

- **Separation of Concerns**: Controllers, Services, Models
- **DRY Principle**: Reusable utilities and middleware
- **Error Handling**: Consistent error responses
- **Logging**: Structured logging with correlation IDs

### Security

- **Never commit secrets**: Use .env files
- **Validate all inputs**: Never trust user input
- **Use prepared statements**: Prevent SQL injection
- **Sanitize outputs**: Prevent XSS
- **Keep dependencies updated**: Regular security updates

### Performance

- **Use indexes**: Optimize database queries
- **Limit payload size**: Prevent DoS
- **Implement caching**: Reduce database load
- **Compress responses**: Reduce bandwidth

## Troubleshooting

### Common Issues

**Problem:** OAuth redirect mismatch
**Solution:** Ensure redirect URIs match exactly in provider console and .env

**Problem:** CORS errors
**Solution:** Check CLIENT_URL in .env matches frontend origin

**Problem:** Token expired continuously
**Solution:** Check system time, ensure JWT_SECRET is consistent

**Problem:** Cannot unlink provider
**Solution:** Ensure user has password or another provider linked

## Contributing

Guidelines for contributing:

1. Fork the repository
2. Create feature branch
3. Follow code style
4. Write tests
5. Submit pull request

## License

MIT License - See LICENSE file

---

**Documentation Version:** 1.0.0
**Last Updated:** 2024
