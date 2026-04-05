const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('--- Incoming Request Authed ---');
    console.log('Path:', req.path);
    console.log('AuthHeader:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authentication token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'undefined') {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!decoded) {
      return res.status(401).json({ error: 'Token verification failed, authorization denied' });
    }

    req.user = decoded; // Contains id and role
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Role (${req.user.role}) is not allowed to access this resource` 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
