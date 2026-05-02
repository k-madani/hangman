const jwt = require('jsonwebtoken');

/**
 * Protects routes that require authentication.
 * Reads the Bearer token from the Authorization header,
 * verifies it, and attaches `req.userId` for downstream controllers.
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized — no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

module.exports = { protect };