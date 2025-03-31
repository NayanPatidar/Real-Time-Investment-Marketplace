const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const redis = require("../config/redis-config");
const { authenticateToken, restrictTo } = require("../middleware/auth");

// Get all notifications for a user
router.get(
  "/:id",
  authenticateToken,
  restrictTo("FOUNDER", "INVESTOR"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const cacheKey = `notifications:${userId}`;

      const cachedNotifications = await redis.get(cacheKey);

      if (cachedNotifications) {
        return res.status(200).json(JSON.parse(cachedNotifications));
      }
      const notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      await redis.set(cacheKey, JSON.stringify(notifications), "EX", 300);
      
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }
);

module.exports = router;
