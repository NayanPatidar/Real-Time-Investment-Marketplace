require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { restrictTo, authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Only founders can create proposals
router.post("/", authenticateToken, restrictTo("FOUNDER"), async (req, res) => {
  const { title, description, fundingGoal } = req.body;
  if (!title || !description || !fundingGoal) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        fundingGoal: parseFloat(fundingGoal),
        founderId: req.user.id,
      },
    });
    res.status(201).json(proposal);
  } catch (error) {
    console.error("Create proposal error:", error);
    res.status(500).json({ message: "Error creating proposal" });
  }
});

// Get all proposals (Investor/Admin)
router.get(
  "/",
  authenticateToken,
  restrictTo("INVESTOR", "ADMIN"),
  async (req, res) => {
    try {
      const proposals = await prisma.proposal.findMany({
        include: { founder: { select: { email: true } } },
      });

      const investorStats = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          totalInvestment: true,
          activeInvestments: true,
        },
      });

      res.json({
        proposals,
        investorStats,
      });
    } catch (error) {
      console.error("Fetch proposals error:", error);
      res.status(500).json({ message: "Error fetching proposals" });
    }
  }
);

// Get proposals of the currently logged-in founder
router.get(
  "/myproposals",
  authenticateToken,
  restrictTo("FOUNDER"),
  async (req, res) => {
    try {
      const proposals = await prisma.proposal.findMany({
        where: {
          founderId: req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.json(proposals);
    } catch (error) {
      console.error("Fetch founder proposals error:", error);
      res.status(500).json({ message: "Error fetching your proposals" });
    }
  }
);

// Get single proposal (Founder/Investor/Admin)
router.get("/:id(\\d+)", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
      include: {
        founder: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    if (req.user.role === "FOUNDER" && proposal.founder.id !== req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    res.json(proposal);
  } catch (error) {
    console.error("Fetch proposal error:", error);
    res.status(500).json({ message: "Error fetching proposal" });
  }
});

// Update proposal status (Investor/Admin)
router.put(
  "/:id",
  authenticateToken,
  restrictTo("investor", "admin"),
  async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    if (!["UNDER_REVIEW", "NEGOTIATING", "FUNDED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    try {
      const proposal = await prisma.proposal.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      req.io
        .to(`proposal:${id}`)
        .emit("statusUpdate", { proposalId: id, status });
      res.json(proposal);
    } catch (error) {
      console.error("Update proposal error:", error);
      res.status(500).json({ message: "Error updating proposal" });
    }
  }
);

// Add comment (Investor/Founder)
router.post(
  "/:id/comments",
  authenticateToken,
  restrictTo("investor", "founder"),
  async (req, res) => {
    const { content } = req.body;
    const { id } = req.params;
    if (!content) return res.status(400).json({ message: "Content required" });
    try {
      const comment = await prisma.comment.create({
        data: { proposalId: parseInt(id), userId: req.user.id, content },
      });
      req.io.to(`proposal:${id}`).emit("newComment", comment);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Error adding comment" });
    }
  }
);

// POST /api/proposals/invest
router.post(
  "/invest",
  authenticateToken,
  restrictTo("INVESTOR"),
  async (req, res) => {
    const { proposalId, amount } = req.body;

    if (!proposalId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid investment data" });
    }

    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { acceptedInvestors: true },
      });

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const currentTotal = proposal.currentFunding;
      const newTotal = currentTotal + amount;

      // Prevent overfunding
      if (newTotal > proposal.fundingGoal) {
        return res
          .status(400)
          .json({ message: "Investment exceeds funding goal" });
      }

      // 1. Add investor record
      await prisma.acceptedInvestor.create({
        data: {
          proposalId,
          investorId: req.user.id,
          contribution: amount,
        },
      });

      // 2. Update currentFunding
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          currentFunding: {
            increment: amount,
          },
          status:
            newTotal >= proposal.fundingGoal
              ? "FUNDED"
              : proposal.status === "APPROVED"
              ? "NEGOTIATING"
              : proposal.status,
        },
      });

      // 3. Update investor stats (optional)
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          totalInvestment: { increment: amount },
          activeInvestments: { increment: 1 },
        },
      });

      res.status(200).json({ message: "Investment successful" });
    } catch (error) {
      console.error("Investment error:", error);
      res.status(500).json({ message: "Server error during investment" });
    }
  }
);

module.exports = router;
