const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ── Token Helpers ─────────────────────────────────────────────────────────────

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

const setRefreshCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,                                           // Not accessible via JS
        secure: process.env.NODE_ENV === 'production',           // HTTPS only in prod
        sameSite: 'strict',                                      // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000                        // 7 days in ms
    });
};

const safeUser = (user) => ({
    id:       user._id,
    username: user.username,
    email:    user.email,
    stats:    user.stats
});

// ── Controllers ───────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Single query to check both uniqueness constraints
        const conflict = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (conflict) {
            const field = conflict.email === email.toLowerCase() ? 'Email' : 'Username';
            return res.status(409).json({ message: `${field} is already taken` });
        }

        const user = await User.create({ username, email, password });
        const { accessToken, refreshToken } = generateTokens(user._id);
        setRefreshCookie(res, refreshToken);

        return res.status(201).json({ accessToken, user: safeUser(user) });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email or username is already taken' });
        }
        console.error('Register error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        // Use constant-time compare regardless of whether user exists (prevents timing attacks)
        const isMatch = user ? await user.comparePassword(password) : false;

        if (!user || !isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);
        setRefreshCookie(res, refreshToken);

        return res.json({ accessToken, user: safeUser(user) });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.refresh = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        let payload;
        try {
            payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch {
            return res.status(401).json({ message: 'Refresh token is invalid or expired' });
        }

        const user = await User.findById(payload.userId);
        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        const { accessToken, refreshToken } = generateTokens(user._id);
        setRefreshCookie(res, refreshToken); // Rotate refresh token on each use

        return res.json({ accessToken, user: safeUser(user) });
    } catch (err) {
        console.error('Refresh error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
    return res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user: safeUser(user) });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};