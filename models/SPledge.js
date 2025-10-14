const mongoose = require("mongoose");

/* 🌿 Master List of SPledges
   --------------------------------------------------
   These pledges are visible to all users.
   Each pledge defines:
   - Text of the pledge
   - Gift reward
   - Associated image
   - Reward points
*/
const SPledgeSchema = new mongoose.Schema(
  {
    pledgeText: {
      type: String,
      required: true,
      trim: true,
    },
    gift: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "/uploads/default.jpg",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/* 🧍 User-Specific SPledge Tracking
   --------------------------------------------------
   Tracks which user has taken which pledge.
   Includes:
   - Reference to the user and pledge
   - Completion status
*/
const UserSPledgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pledge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SPledge",
      required: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure one pledge per user (avoid duplicates)
UserSPledgeSchema.index({ user: 1, pledge: 1 }, { unique: true });

/* 🏆 SP Awards
   --------------------------------------------------
   Represents badges or milestones users earn.
*/
const SAwardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Register models
const SPledge = mongoose.model("SPledge", SPledgeSchema);
const UserSPledge = mongoose.model("UserSPledge", UserSPledgeSchema);
const SAward = mongoose.model("SAward", SAwardSchema);

module.exports = { SPledge, UserSPledge, SAward };
