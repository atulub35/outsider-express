const passport = require('passport');
const { strategy } = require('../config/auth');

// Initialize passport with JWT strategy
passport.use(strategy);

// Authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

// Authorization middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
}; 