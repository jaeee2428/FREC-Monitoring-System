const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, invalid token' });
        }
    }

    next();
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, no authentication' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized for this role' });
        }
        next();
    };
};

const requireUser = (req, res, next) => {
    if (!req.user && !req.body.actorId) {
        return res.status(401).json({ error: 'Not authorized, no user context' });
    }
    next();
};

module.exports = { protect, authorizeRoles, requireUser };
