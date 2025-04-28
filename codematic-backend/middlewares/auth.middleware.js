const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    // Future: Verify token/session here
    next();
  };
  
  module.exports = {
    authenticate
  };
  