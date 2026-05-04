const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts. Please wait 15 minutes and try again.' },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: 'Too many accounts created. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register',            registerLimiter, authController.register);
router.post('/login',               loginLimiter,    authController.login);
router.post('/refresh',                              authController.refresh);
router.post('/logout',                               authController.logout);
router.get ('/me',                  protect,         authController.getMe);
router.post('/save-single-result',  protect,         authController.saveSingleResult);
router.post('/save-multi-result',   protect,         authController.saveMultiResult);

module.exports = router;