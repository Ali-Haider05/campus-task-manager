const role = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};

export default role;
