const express = require("express");
const router = express.Router();
const { UserPledge } = require("../models/EPledge");
const { UserSPledge } = require("../models/SPledge");
const { UserGPledge } = require("../models/GPledge");

// 🏆 Combined ESG Rankings Route
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Fetch all completed pledges from all categories
    const [eCompleted, sCompleted, gCompleted] = await Promise.all([
      UserPledge.find({ isCompleted: true })
        .populate("user", "name email")
        .populate("pledge", "points"),
      UserSPledge.find({ isCompleted: true })
        .populate("user", "name email")
        .populate("pledge", "points"),
      UserGPledge.find({ isCompleted: true })
        .populate("user", "name email")
        .populate("pledge", "points"),
    ]);

    const combined = {};

    // 2️⃣ Process E Pledges
    eCompleted.forEach((p) => {
      if (!p.user || !p.pledge) return;
      const userId = p.user._id.toString();
      if (!combined[userId]) {
        combined[userId] = {
          name: p.user.name || "Unknown",
          email: p.user.email || "N/A",
          e: 0,
          s: 0,
          g: 0,
        };
      }
      combined[userId].e += p.pledge.points || 0;
    });

    // 3️⃣ Process S Pledges
    sCompleted.forEach((p) => {
      if (!p.user || !p.pledge) return;
      const userId = p.user._id.toString();
      if (!combined[userId]) {
        combined[userId] = {
          name: p.user.name || "Unknown",
          email: p.user.email || "N/A",
          e: 0,
          s: 0,
          g: 0,
        };
      }
      combined[userId].s += p.pledge.points || 0;
    });

    // 4️⃣ Process G Pledges
    gCompleted.forEach((p) => {
      if (!p.user || !p.pledge) return;
      const userId = p.user._id.toString();
      if (!combined[userId]) {
        combined[userId] = {
          name: p.user.name || "Unknown",
          email: p.user.email || "N/A",
          e: 0,
          s: 0,
          g: 0,
        };
      }
      combined[userId].g += p.pledge.points || 0;
    });

    // 5️⃣ Convert combined data into an array
    const finalArray = Object.keys(combined).map((key) => ({
      id: key,
      name: combined[key].name,
      email: combined[key].email,
      e: combined[key].e,
      s: combined[key].s,
      g: combined[key].g,
      total: combined[key].e + combined[key].s + combined[key].g,
    }));

    // 6️⃣ Sort by total points descending
    finalArray.sort((a, b) => b.total - a.total);

    // ✅ Send response
    res.json({ success: true, data: finalArray });
  } catch (err) {
    console.error("Ranking Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch rankings" });
  }
});

module.exports = router;
