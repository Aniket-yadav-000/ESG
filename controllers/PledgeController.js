const { EPledge, SPledge, GPledge, UserPledge } = require("../models/Pledges");

// Mark a pledge as completed
const completePledge = async (req, res) => {
  const { id } = req.params; // UserPledge id
  try {
    const userPledge = await UserPledge.findById(id).populate('pledge');
    if (!userPledge) return res.status(404).json({ success: false, message: "Pledge not found" });

    if (userPledge.isCompleted) {
      return res.status(400).json({ success: false, message: "Already completed" });
    }

    // Save points and pledgeType
    userPledge.isCompleted = true;
    userPledge.points = userPledge.pledge.points || 0;
    userPledge.pledgeType = userPledge.pledgeModel === "EPledge" ? "e" :
                            userPledge.pledgeModel === "SPledge" ? "s" : "g";

    await userPledge.save();
    res.json({ success: true, data: userPledge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { completePledge };
