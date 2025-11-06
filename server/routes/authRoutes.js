const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter, oauthLimiter } = require('../middleware/rateLimiter');

// Local authentication routes
router.post('/register', authLimiter, validateRegister, authController.register.bind(authController));
router.post('/login', authLimiter, validateLogin, authController.login.bind(authController));
router.post('/logout', optionalAuth, authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Current user
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

// OAuth routes
router.get('/oauth/:provider', oauthLimiter, authController.initiateOAuth.bind(authController));
router.get('/oauth/:provider/callback', authController.oauthCallback.bind(authController));

// Provider linking/unlinking
router.post('/link/:provider', authenticate, oauthLimiter, authController.linkProvider.bind(authController));
router.delete('/unlink/:provider', authenticate, authController.unlinkProvider.bind(authController));

module.exports = router;
