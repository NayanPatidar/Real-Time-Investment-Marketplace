// routes/investorDashboard.js
const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authenticateToken, restrictTo } = require("../middleware/auth");

// GET /api/investor/dashboard
router.get(
  "/dashboard",
  authenticateToken,
  restrictTo("INVESTOR"),
  async (req, res) => {
    try {
      const investorId = req.user.id;

      // Get all investments by the investor
      const acceptedInvestments = await prisma.acceptedInvestor.findMany({
        where: { investorId },
        include: {
          proposal: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalInvested = acceptedInvestments.reduce(
        (acc, inv) => acc + inv.contribution,
        0
      );

      const activeInvestments = acceptedInvestments.filter(
        (inv) =>
          inv.proposal.status === "NEGOTIATING" ||
          inv.proposal.status === "FUNDED"
      ).length;

      const successfulExits = acceptedInvestments.filter(
        (inv) => inv.proposal.status === "FUNDED"
      ).length;

      const averageInvestment =
        acceptedInvestments.length > 0
          ? totalInvested / acceptedInvestments.length
          : 0;

      const investments = acceptedInvestments.map((inv) => ({
        startupName: inv.proposal.title,
        sector: "Technology", // Optional: Add sector to Proposal model if needed
        amount: inv.contribution,
        date: inv.createdAt,
        status:
          inv.proposal.status === "FUNDED"
            ? "Exited"
            : inv.proposal.status === "NEGOTIATING"
            ? "Active"
            : "Pending",
        proposalId: inv.proposal.id,
      }));

      res.status(200).json({
        totalInvested,
        activeInvestments,
        successfulExits,
        averageInvestment,
        investments,
      });
    } catch (err) {
      console.error("Investor dashboard error:", err);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  }
);

module.exports = router;
