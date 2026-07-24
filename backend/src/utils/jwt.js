const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'miss_rezanna_secret_key_2026_super_secure';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn
    });
};

const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || 'miss_rezanna_secret_key_2026_super_secure';
    return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
