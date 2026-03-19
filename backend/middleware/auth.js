const jwt = require('jsonwebtoken');
const config = require('../config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ 
      error: "Missing or invalid Authorization header",
      details: "Format should be: Bearer <token>"
    });
  }

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET);

    req.user = {
      id: payload.sub,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      role: payload.role || config.ROLES.USER
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expired",
        details: "Please refresh your token or login again"
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Invalid token",
        details: "Token signature is invalid"
      });
    }
    
    return res.status(401).json({ 
      error: "Authentication failed",
      details: err.message
    });
  }
}

module.exports = authMiddleware;