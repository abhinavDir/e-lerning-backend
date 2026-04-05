require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dns = require("dns");

const seedData = require("./utils/seeder");

// DNS Fix (MongoDB Atlas issue fix)
dns.setDefaultResultOrder("ipv4first");

const app = express();

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(cors({
  origin: "*", // production me specific frontend URL daalna
}));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ================= DEBUG CHECK =================
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing!");
}

// ================= MONGODB CONNECT =================
mongoose.set("bufferCommands", false);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    seedData();
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// ================= HEALTH ROUTE =================
app.get("/", (req, res) => {
  res.json({
    status: "Active",
    server: "Backend Running 🚀",
    env: process.env.NODE_ENV || "development"
  });
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/enroll", require("./routes/enrollment"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/recommendations", require("./routes/recommendation"));
app.use("/api/code", require("./routes/code"));
app.use("/api/chat", require("./routes/chat"));

// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message
  });
});

// ================= SERVER START =================
app.listen(PORT, () => {
  console.log("\n🚀 SERVER STARTED SUCCESSFULLY");
  console.log(`🌐 PORT: ${PORT}`);
  console.log(`⚙️ MODE: ${process.env.NODE_ENV || "development"}\n`);
});