require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

// ------------------- ROUTES -------------------
const EPledgeRoutes = require("./routes/EPledgeRoutes");
const SPledgeRoutes = require("./routes/SPledgeRoutes");
const GPledgeRoutes = require("./routes/GPledgeRoutes");
const AuthRoutes = require("./routes/auth");
const RankingRoutes = require("./routes/RankingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- API ROUTES -------------------
app.use("/api/auth", AuthRoutes);
app.use("/api/epledges", EPledgeRoutes);
app.use("/api/spledges", SPledgeRoutes);
app.use("/api/gpledges", GPledgeRoutes);
app.use("/api/rankings", RankingRoutes); // Rankings API

// ------------------- MONGODB CONNECTION -------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    // Start server after successful DB connection
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ success: false, message: err.message });
});
