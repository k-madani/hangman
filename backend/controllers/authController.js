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
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const safeUser = (user) => ({
    id:        user._id,
    username:  user.username,
    email:     user.email,
    stats:     user.stats,
    createdAt: user.createdAt
});

// ── Auth Controllers ──────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });
        if (password.length < 8)
            return res.status(400).json({ message: 'Password must be at least 8 characters' });

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
        if (err.code === 11000)
            return res.status(409).json({ message: 'Email or username is already taken' });
        console.error('Register error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        const isMatch = user ? await user.comparePassword(password) : false;
        if (!user || !isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });

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
        setRefreshCookie(res, refreshToken);
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

// ── Stats Controllers ─────────────────────────────────────────────────────────

exports.saveSingleResult = async (req, res) => {
    try {
        const { score, rounds, category } = req.body;
        if (score === undefined || !rounds)
            return res.status(400).json({ message: 'score and rounds are required' });

        // Use findByIdAndUpdate to safely upsert nested stats
        // $inc handles missing fields automatically (starts from 0)
        const won = score > rounds / 2;

        const newGame = {
            score,
            rounds,
            category: category || 'Custom',
            playedAt: new Date()
        };

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $inc: {
                    'stats.single.gamesPlayed': 1,
                    'stats.single.wins':        won ? 1 : 0,
                    'stats.single.losses':      won ? 0 : 1,
                },
                $push: {
                    'stats.single.recentGames': {
                        $each:     [newGame],
                        $position: 0,          // prepend
                        $slice:    10           // keep latest 10
                    }
                }
            },
            { new: true, upsert: false }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user: safeUser(user) });
    } catch (err) {
        console.error('saveSingleResult error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.saveMultiResult = async (req, res) => {
    try {
        const { myScore, opponentScore, opponentUsername, rounds, result } = req.body;
        if (myScore === undefined || opponentScore === undefined || !rounds || !result)
            return res.status(400).json({ message: 'myScore, opponentScore, rounds and result are required' });

        const newGame = {
            opponentUsername: opponentUsername || 'Unknown',
            myScore,
            opponentScore,
            rounds,
            result,
            playedAt: new Date()
        };

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $inc: {
                    'stats.multi.gamesPlayed': 1,
                    'stats.multi.wins':        result === 'win'  ? 1 : 0,
                    'stats.multi.losses':      result === 'loss' ? 1 : 0,
                    'stats.multi.ties':        result === 'tie'  ? 1 : 0,
                },
                $push: {
                    'stats.multi.recentGames': {
                        $each:     [newGame],
                        $position: 0,
                        $slice:    5           // keep latest 5
                    }
                }
            },
            { new: true, upsert: false }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user: safeUser(user) });
    } catch (err) {
        console.error('saveMultiResult error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};