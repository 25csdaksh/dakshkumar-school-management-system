export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user info' });
    }

    // Role could be a populated Role document or a direct string/reference
    const roleName = req.user.role?.name || req.user.role;

    if (!roles.includes(roleName)) {
      return res.status(403).json({
        message: `Role (${roleName}) is not authorized to access this resource`
      });
    }

    next();
  };
};

export default authorize;
