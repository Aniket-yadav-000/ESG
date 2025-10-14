const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const ePledgeCtrl = require("../controllers/EPledgeController");
const auth = require("../middleware/auth");

// ------------------- Multer Setup -------------------
const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ------------------- Soft Auth -------------------
const softAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      console.warn("⚠️ Invalid token detected, continuing as guest");
    }
  }
  next();
};

// ------------------- Admin Protection -------------------
const adminOnly = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Admin login required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ success: false, message: "Admin access denied" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ------------------- PUBLIC ROUTES -------------------
router.get("/pledges", softAuth, ePledgeCtrl.getAllPledges);
router.get("/pledges/:id", softAuth, ePledgeCtrl.getPledgeById);
router.get("/awards", softAuth, ePledgeCtrl.getAwards);

// ------------------- ADMIN ROUTES -------------------
router.post("/pledges", adminOnly, upload.single("image"), ePledgeCtrl.createPledge);
router.put("/pledges/:id", adminOnly, upload.single("image"), ePledgeCtrl.updatePledge);
router.delete("/pledges/:id", adminOnly, ePledgeCtrl.deletePledge);
router.post("/awards", adminOnly, ePledgeCtrl.createAward);
router.put("/awards/:id", adminOnly, ePledgeCtrl.updateAward);
router.delete("/awards/:id", adminOnly, ePledgeCtrl.deleteAward);

// ------------------- USER ROUTES -------------------
router.get("/user/completed", auth, ePledgeCtrl.getUserCompletedPledges);
router.post("/pledges/:id/complete", auth, ePledgeCtrl.completePledge);

module.exports = router;
