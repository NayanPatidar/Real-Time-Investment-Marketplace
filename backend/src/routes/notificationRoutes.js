const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authenticateToken, restrictTo } = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  restrictTo("FOUNDER", "INVESTOR"),
  async (req, res) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }
);

module.exports = router;
