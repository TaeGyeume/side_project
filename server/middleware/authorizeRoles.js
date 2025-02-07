const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !roles.some(role => req.user.roles.includes(role))) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    next();
  };
};

module.exports = authorizeRoles;
