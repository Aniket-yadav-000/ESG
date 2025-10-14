const { GPledge, UserGPledge, GAward } = require("../models/GPledge");
const { sendRewardEmail } = require("../utils/mailer");
const fs = require("fs");
const path = require("path");

// ------------------- GLOBAL CONFIG -------------------
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ------------------- PLEDGE CRUD (ADMIN) -------------------
const createPledge = async (req, res) => {
  try {
    const { pledgeText, gift, points } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg";

    const newPledge = await GPledge.create({ pledgeText, gift, points, imageUrl });
    newPledge.imageUrl = `${BASE_URL}${newPledge.imageUrl}`;
    res.status(201).json({ success: true, data: newPledge });
  } catch (err) {
    console.error("❌ Error creating pledge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPledges = async (req, res) => {
  try {
    const pledges = await GPledge.find().sort({ createdAt: 1 });
    const userId = req.user?.id;

    const formatted = pledges.map((p) => ({
      ...p.toObject(),
      imageUrl: p.imageUrl ? `${BASE_URL}${p.imageUrl}` : `${BASE_URL}/uploads/default.jpg`,
    }));

    if (userId) {
      const userPledges = await UserGPledge.find({ user: userId });
      const completedMap = new Map(userPledges.map((p) => [p.pledge.toString(), p]));

      const merged = formatted.map((p) => ({
        ...p,
        isCompleted: completedMap.get(p._id.toString())?.isCompleted || false,
      }));

      return res.json({ success: true, data: merged });
    }

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error fetching pledges:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPledgeById = async (req, res) => {
  try {
    const pledge = await GPledge.findById(req.params.id);
    if (!pledge) return res.status(404).json({ success: false, message: "Pledge not found" });

    pledge.imageUrl = pledge.imageUrl ? `${BASE_URL}${pledge.imageUrl}` : `${BASE_URL}/uploads/default.jpg`;
    res.json({ success: true, data: pledge });
  } catch (err) {
    console.error("❌ Error fetching pledge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePledge = async (req, res) => {
  try {
    const { pledgeText, gift, points } = req.body;
    const updateData = { pledgeText, gift, points };
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const updated = await GPledge.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Pledge not found" });

    updated.imageUrl = updated.imageUrl ? `${BASE_URL}${updated.imageUrl}` : `${BASE_URL}/uploads/default.jpg`;
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating pledge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deletePledge = async (req, res) => {
  try {
    const pledge = await GPledge.findById(req.params.id);
    if (!pledge) return res.status(404).json({ success: false, message: "Pledge not found" });

    const imgPath = path.join(__dirname, "..", pledge.imageUrl);
    if (pledge.imageUrl && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await pledge.deleteOne();
    await UserGPledge.deleteMany({ pledge: pledge._id });

    res.json({ success: true, message: "Pledge deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting pledge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- USER COMPLETION -------------------
const completePledge = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Login required to complete pledge" });

    const pledgeId = req.params.id;
    const pledge = await GPledge.findById(pledgeId);
    if (!pledge) return res.status(404).json({ success: false, message: "Pledge not found" });

    let userPledge = await UserGPledge.findOne({ user: userId, pledge: pledgeId });
    if (!userPledge) userPledge = new UserGPledge({ user: userId, pledge: pledgeId });

    if (userPledge.isCompleted)
      return res.json({ success: true, message: "Pledge already completed", data: userPledge });

    userPledge.isCompleted = true;
    await userPledge.save();

    const userEmail = req.user?.email;
    if (userEmail) await sendRewardEmail(userEmail, pledge.pledgeText, pledge.gift, pledge.points);

    res.json({ success: true, message: "Pledge completed & reward email sent successfully!", data: userPledge });
  } catch (err) {
    console.error("❌ Error completing pledge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserCompletedPledges = async (req, res) => {
  try {
    const userId = req.user.id;

    const completed = await UserGPledge.find({ user: userId, isCompleted: true }).populate({
      path: "pledge",
      select: "pledgeText gift points imageUrl",
    });

    const formatted = completed.map((item) => ({
      _id: item._id,
      isCompleted: item.isCompleted,
      pledge: {
        ...item.pledge.toObject(),
        imageUrl: item.pledge?.imageUrl
          ? `${BASE_URL}${item.pledge.imageUrl}`
          : `${BASE_URL}/uploads/default.jpg`,
      },
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error fetching completed pledges:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- AWARD CRUD (ADMIN) -------------------
const createAward = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    const award = await GAward.create({ title, description, icon });
    res.status(201).json({ success: true, data: award });
  } catch (err) {
    console.error("❌ Error creating award:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAwards = async (req, res) => {
  try {
    const awards = await GAward.find().sort({ createdAt: 1 });
    res.json({ success: true, data: awards });
  } catch (err) {
    console.error("❌ Error fetching awards:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAward = async (req, res) => {
  try {
    const updated = await GAward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Award not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating award:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAward = async (req, res) => {
  try {
    const deleted = await GAward.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Award not found" });
    res.json({ success: true, message: "Award deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting award:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------- EXPORT -------------------
module.exports = {
  createPledge,
  getAllPledges,
  getPledgeById,
  updatePledge,
  deletePledge,
  completePledge,
  getUserCompletedPledges,
  createAward,
  getAwards,
  updateAward,
  deleteAward,
};
