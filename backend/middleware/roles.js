const config = require('../config');

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: "Unauthorized",
                details: "User not authenticated"
            });
        }

        const userRole = req.user.role || config.ROLES.USER;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: "Forbidden",
                details: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                userRole: userRole
            });
        }

        next();
    };
}

module.exports = roleMiddleware;