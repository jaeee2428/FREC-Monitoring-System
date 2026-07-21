const jwt = require('jsonwebtoken');

// Mock user data for now (will be replaced with real DB later)
const ROLE_NAMES = {
    1: 'Student',
    2: 'Adviser',
    3: 'IT Admin',
    4: 'Program Chair',
    5: 'Dean',
    6: 'Reviewer (FREC)'
}

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request object
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Not authorized, invalid token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized for this role' });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
