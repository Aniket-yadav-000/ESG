const jwt = require("jsonwebtoken");

// General authentication middleware
module.exports = function (req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, email, role }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Separate middleware for admin-only routes
module.exports.adminOnly = function (req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access denied" });
    }
    req.user = decoded; // attach full user info
    next();
  } catch (err) {
    console.error("Admin check failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
