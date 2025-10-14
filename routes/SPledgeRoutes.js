const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const sPledgeCtrl = require("../controllers/SPledgeController");
const auth = require("../middleware/auth");

// ------------------- Multer Setup -------------------
const uploadDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    ),
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
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Admin login required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Admin access denied" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ------------------- PUBLIC ROUTES -------------------
router.get("/pledges", softAuth, sPledgeCtrl.getAllPledges);
router.get("/pledges/:id", softAuth, sPledgeCtrl.getPledgeById);
router.get("/awards", softAuth, sPledgeCtrl.getAwards);

// ------------------- ADMIN ROUTES -------------------
// Added direct `/api/spledges` POST route for flexibility
router.post("/", adminOnly, upload.single("image"), sPledgeCtrl.createPledge);

router.post("/pledges", adminOnly, upload.single("image"), sPledgeCtrl.createPledge);
router.put("/pledges/:id", adminOnly, upload.single("image"), sPledgeCtrl.updatePledge);
router.delete("/pledges/:id", adminOnly, sPledgeCtrl.deletePledge);

router.post("/awards", adminOnly, sPledgeCtrl.createAward);
router.put("/awards/:id", adminOnly, sPledgeCtrl.updateAward);
router.delete("/awards/:id", adminOnly, sPledgeCtrl.deleteAward);

// ------------------- USER ROUTES -------------------
router.get("/user/completed", auth, sPledgeCtrl.getUserCompletedPledges);
router.post("/pledges/:id/complete", auth, sPledgeCtrl.completePledge);

module.exports = router;
