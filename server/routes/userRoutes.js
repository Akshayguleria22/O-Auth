const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// User profile routes
router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, validateProfileUpdate, userController.updateProfile.bind(userController));

// Provider management
router.get('/providers', authenticate, userController.getLinkedProviders.bind(userController));

// Auth logs
router.get('/auth-logs', authenticate, userController.getAuthLogs.bind(userController));

// Account deletion
router.delete('/account', authenticate, userController.deleteAccount.bind(userController));

// Admin routes
router.get('/all', authenticate, authorize('admin'), userController.getAllUsers.bind(userController));
router.patch('/:userId/role', authenticate, authorize('admin'), userController.updateUserRole.bind(userController));

module.exports = router;
