const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(", ")} can access this route.`,
      });
    }
    next();
  };
};

export { authorizeRole };
