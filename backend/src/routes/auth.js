require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const client = require("../config/redis-config");
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
    const cachedUser = await client.get(`user:email:${email}`);

    if (cachedUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await client.set(
        `user:email:${email}`,
        JSON.stringify(existingUser),
        "EX",
        3600
      );
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, name },
    });

    await client.set(`user:id:${user.id}`, JSON.stringify(user), "EX", 3600);
    await client.set(`user:email:${email}`, JSON.stringify(user), "EX", 3600);

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await client.set(`token:${user.id}`, token, "EX", 3600);

    res.status(201).json({ token, user: { id: user.id, email, role } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", validateAuth, async (req, res) => {
  const { email, password } = req.body;
  try {
    const cachedUser = await client.get(`user:email:${email}`);
    let user;

    if (cachedUser) {
      user = JSON.parse(cachedUser);
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await client.set(`user:id:${user.id}`, JSON.stringify(user), "EX", 3600);
      await client.set(`user:email:${email}`, JSON.stringify(user), "EX", 3600);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await client.set(`token:${user.id}`, token, "EX", 3600);

    res.json({ token, user: { id: user.id, email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await client.del(`token:${decoded.id}`);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = router;
