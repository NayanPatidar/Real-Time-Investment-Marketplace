require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const router = express.Router();

const validateAuth = (req, res, next) => {
  const { email, password, role } = req.body;
  console.log("Request body:", req.body);

  if (
    !email ||
    !password ||
    (req.path === "/signup" && !["FOUNDER", "INVESTOR", "ADMIN"].includes(role))
  ) {
    console.log("Missing fields in request body");

    return res.status(400).json({ message: "Missing Fields" });
  }
  next();
};

router.post("/signup", validateAuth, async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, name },
    });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, user: { id: user.id, email, role } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", validateAuth, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user: { id: user.id, email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
