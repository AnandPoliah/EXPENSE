const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Helper to generate a token
const createToken = (id) => {
  return jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // 1. Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // 2. Hash password (NFR1)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user in DB
    const newUser = await userModel.create(name, email, passwordHash);

    // 4. Generate JWT
    const token = createToken(newUser.id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser.id, email: newUser.email, name },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 2. Compare password hash
    const isMatch = await bcrypt.compare(password, user.password_hash); // NFR1
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 3. Generate JWT (FR1.2)
    const token = createToken(user.id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// C:\reactworkplace\Expense\backend\src\controllers\authController.js

// ... existing code ...

// GET /api/v1/user/profile (FR1.3)
exports.getProfile = async (req, res) => {
  // req.userId is supplied by the authMiddleware (even the bypassed version)
  try {
    // You might fetch full user details here, but for a simple test:
    res.status(200).json({
      id: req.userId,
      message: "Profile access confirmed (Auth bypass active).",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile." });
  }
};
