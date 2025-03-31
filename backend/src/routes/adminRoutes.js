// admin-routes.js
require("dotenv").config();
const express = require("express");
const prisma = require("../config/prisma");
const { authenticateToken, restrictTo } = require("../middleware/auth");
const router = express.Router();

router.use(authenticateToken, restrictTo("ADMIN"));

// GET /api/admin/users - Get all users with optional role filter
router.get("/users", async (req, res) => {
  const { role } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// GET /api/admin/proposals - Get all proposals with optional status filter
router.get("/proposals", async (req, res) => {
  const { status } = req.query;
  try {
    const proposals = await prisma.proposal.findMany({
      where: status ? { status } : {},
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        acceptedInvestors: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(proposals);
  } catch (error) {
    console.error("Fetch proposals error:", error);
    res.status(500).json({ message: "Error fetching proposals" });
  }
});

// PUT /api/admin/proposals/:id/status - Update proposal status
router.put("/proposals/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("Update proposal status request:", req.body);

  if (!["UNDER_REVIEW" , "NEGOTIATING" , "FUNDED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const proposal = await prisma.proposal.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    // Notify users about the status change
    req.io.to(`proposal:${id}`).emit("statusUpdate", {
      proposalId: id,
      status,
    });

    res.json(proposal);
  } catch (error) {
    console.error("Update proposal status error:", error);
    res.status(500).json({ message: "Error updating proposal status" });
  }
});

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalFounders,
      totalInvestors,
      totalProposals,
      fundedProposals,
      investmentsSum,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "FOUNDER" } }),
      prisma.user.count({ where: { role: "INVESTOR" } }),
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: "FUNDED" } }),
      prisma.user.aggregate({ _sum: { totalInvestment: true } }),
    ]);

    res.json({
      totalUsers,
      totalFounders,
      totalInvestors,
      totalProposals,
      fundedProposals,
      totalInvestments: investmentsSum._sum.totalInvestment || 0,
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

module.exports = router;
