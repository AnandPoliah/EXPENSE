// backend/src/app.js - CLEANED ROUTING

const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
// Route and Middleware Imports
const authRoutes = require("./routes/authRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const accountRouter = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Configuration & Core Middleware ---
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Route Loading
app.use("/api/v1/auth", loginLimiter, authRoutes); // Public Auth

app.use(authMiddleware); // Apply Auth Middleware globally from here

// All routes below this point are protected.
app.use("/api/v1/categories", categoryRouter); // <-- MUST match the path
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// FR1.3: Profile management example
app.get("/api/v1/profile", (req, res) => {
  res.status(200).json({
    message: "Protected route access confirmed.",
    userId: req.userId,
  });
});

// Final Global Error Handler (This MUST be the last middleware)
app.use(errorHandler); // <--- ONLY ONE TIME HERE

module.exports = app;
