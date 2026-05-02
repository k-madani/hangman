const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Strict rate limit on login to block brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15-minute window
    max: 5,                      // 5 attempts per window per IP
    message: { message: 'Too many login attempts. Please wait 15 minutes and try again.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Slightly more generous limit on register
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1-hour window
    max: 10,
    message: { message: 'Too many accounts created. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register', registerLimiter, authController.register);
router.post('/login',    loginLimiter,    authController.login);
router.post('/refresh',                   authController.refresh);
router.post('/logout',                    authController.logout);
router.get('/me',        protect,         authController.getMe);

module.exports = router;