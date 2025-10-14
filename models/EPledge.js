const mongoose = require("mongoose");

/* 🌿 Master List of Pledges
   --------------------------------------------------
   These pledges are visible to all users.
   Each pledge defines:
   - Text of the pledge
   - Gift reward
   - Associated image
   - Reward points
*/
const EPledgeSchema = new mongoose.Schema(
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

/* 🧍 User-Specific Pledge Tracking
   --------------------------------------------------
   Tracks which user has taken which pledge.
   Includes:
   - Reference to the user and pledge
   - Completion status
*/
const UserPledgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pledge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EPledge",
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
UserPledgeSchema.index({ user: 1, pledge: 1 }, { unique: true });

/* 🏆 ESG Awards
   --------------------------------------------------
   Represents badges or milestones users earn.
*/
const EAwardSchema = new mongoose.Schema(
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
const EPledge = mongoose.model("EPledge", EPledgeSchema);
const UserPledge = mongoose.model("UserPledge", UserPledgeSchema);
const EAward = mongoose.model("EAward", EAwardSchema);

module.exports = { EPledge, UserPledge, EAward };
