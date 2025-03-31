const jwt = require("jsonwebtoken");
const client = require("../config/redis-config");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token is missing from Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const storedToken = await client.get(`token:${decoded.id}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};

module.exports = { authenticateToken, restrictTo };
