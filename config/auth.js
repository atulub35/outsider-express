const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT configuration
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // In production, use environment variable
};

// Passport JWT Strategy
const strategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Here you would typically fetch the user from your database
        // For now, we'll just return the payload
        return done(null, payload);
    } catch (error) {
        return done(error, false);
    }
});

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email 
        },
        jwtOptions.secretOrKey,
        { expiresIn: '24h' }
    );
};

// Helper function to hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Helper function to compare passwords
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = {
    strategy,
    generateToken,
    hashPassword,
    comparePassword
}; 