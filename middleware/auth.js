const jwt = require("jsonwebtoken");

/**
 * ✅ Middleware: Authenticate any logged-in user
 */
const auth = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login to continue.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

/**
 * ✅ Middleware: Restrict access to admin routes only
 */
const adminOnly = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Admin access denied.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied. You do not have permission.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin check failed:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Admin access denied.",
    });
  }
};

module.exports = auth;
module.exports.adminOnly = adminOnly;
