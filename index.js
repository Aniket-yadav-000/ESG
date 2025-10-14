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

// ------------------- CORS CONFIG -------------------
// ✅ Enable cross-origin cookies for frontend (Netlify + localhost)
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development
      "https://inquisitive-fenglisu-810df6.netlify.app", // Deployed frontend
    ],
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- TEST ROUTE -------------------
app.get("/", (req, res) => {
  res.send("🌱 ESG Backend Server is Running Smoothly!");
});

// ------------------- API ROUTES -------------------
app.use("/api/auth", AuthRoutes);
app.use("/api/epledges", EPledgeRoutes);
app.use("/api/spledges", SPledgeRoutes);
app.use("/api/gpledges", GPledgeRoutes);
app.use("/api/rankings", RankingRoutes);

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  console.error("⚠️ Global Error Handler:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// ------------------- MONGODB CONNECTION -------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    // ------------------- START SERVER -------------------
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        "🔗 Backend URL:",
        process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`
      );
    });
  })
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// ------------------- PRODUCTION HTTPS COOKIE NOTE -------------------
// In production, ensure the frontend uses HTTPS and cookies have:
// secure: true
// sameSite: "None"
// This allows cross-domain authentication with Netlify frontend.
