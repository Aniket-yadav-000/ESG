const mongoose = require("mongoose");

/* ------------------ E-Pledge ------------------ */
const EPledgeSchema = new mongoose.Schema({
  pledgeText: { type: String, required: true, trim: true },
  gift: { type: String, trim: true, default: "" },
  imageUrl: { type: String, trim: true, default: "/uploads/default.jpg" },
  points: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

/* ------------------ S-Pledge ------------------ */
const SPledgeSchema = new mongoose.Schema({
  pledgeText: { type: String, required: true, trim: true },
  gift: { type: String, trim: true, default: "" },
  imageUrl: { type: String, trim: true, default: "/uploads/default.jpg" },
  points: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

/* ------------------ G-Pledge ------------------ */
const GPledgeSchema = new mongoose.Schema({
  pledgeText: { type: String, required: true, trim: true },
  gift: { type: String, trim: true, default: "" },
  imageUrl: { type: String, trim: true, default: "/uploads/default.jpg" },
  points: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

/* ------------------ User Pledge Tracking ------------------ */
const UserPledgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pledge: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'pledgeModel' },
  pledgeModel: { type: String, enum: ["EPledge", "SPledge", "GPledge"], required: true },
  isCompleted: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  pledgeType: { type: String, enum: ["e", "s", "g"], required: true },
}, { timestamps: true });

// Prevent duplicate pledges per user
UserPledgeSchema.index({ user: 1, pledge: 1 }, { unique: true });

/* ------------------ Register Models ------------------ */
const EPledge = mongoose.models.EPledge || mongoose.model("EPledge", EPledgeSchema);
const SPledge = mongoose.models.SPledge || mongoose.model("SPledge", SPledgeSchema);
const GPledge = mongoose.models.GPledge || mongoose.model("GPledge", GPledgeSchema);
const UserPledge = mongoose.models.UserPledge || mongoose.model("UserPledge", UserPledgeSchema);

module.exports = { EPledge, SPledge, GPledge, UserPledge };
