import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme !== "Bearer" || !token || !process.env.JWT_SECRET) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authenticate;
