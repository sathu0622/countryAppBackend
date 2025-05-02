const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET = "supersecretkey"; // Move this to .env ideally

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Contains { id: ... }
    next();
  });
}

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, likedCountries: [] });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch {
    res.status(400).json({ error: "Email already in use" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token, message: "Login successful" });
});

// Like or Unlike a country
router.post("/like", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { countryName } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(401).send("User not found");

  if (!user.likedCountries.includes(countryName)) {
    user.likedCountries.push(countryName);
  } else {
    user.likedCountries = user.likedCountries.filter(c => c !== countryName); // Toggle
  }

  await user.save();
  res.send({ message: "Updated likes", likedCountries: user.likedCountries });
});

// Get liked countries
router.get("/likes", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return res.status(401).send("User not found");

  res.send(user.likedCountries || []);
});

module.exports = router;
