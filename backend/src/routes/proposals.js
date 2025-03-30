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
        include: {
          founder: { select: { email: true } },
          acceptedInvestors: {
            where: { investorId: req.user.id },
            select: { contribution: true },
          },
        },
      });

      const enrichedProposals = proposals.map((p) => ({
        ...p,
        investorContribution: p.acceptedInvestors.reduce(
          (sum, a) => sum + a.contribution,
          0
        ),
      }));

      const investorStats = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          totalInvestment: true,
          activeInvestments: true,
        },
      });

      res.json({
        proposals: enrichedProposals,
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

router.get("/comments/:id", authenticateToken, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { proposalId: parseInt(req.params.id) },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

router.post("/comments/:id", authenticateToken, async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        proposalId: parseInt(req.params.id),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Error adding comment" });
  }
});

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
            name: true,
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
        acceptedInvestors: {
          where: {
            investorId: req.user.role === "INVESTOR" ? req.user.id : undefined,
          },
          select: { contribution: true },
        },
      },
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // FOUNDER can only access their own proposal
    if (req.user.role === "FOUNDER" && proposal.founder.id !== req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const investorContribution =
      proposal.acceptedInvestors?.reduce(
        (sum, entry) => sum + entry.contribution,
        0
      ) || 0;

    res.json({
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      fundingGoal: proposal.fundingGoal,
      currentFunding: proposal.currentFunding,
      status: proposal.status,
      createdAt: proposal.createdAt,
      founder: proposal.founder,
      comments: proposal.comments,
      investorContribution,
    });
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
      // Step 1: Get proposal
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const newTotal = proposal.currentFunding + amount;

      // Step 2: Prevent overfunding
      if (newTotal > proposal.fundingGoal) {
        return res
          .status(400)
          .json({ message: "Investment exceeds funding goal" });
      }

      // Step 3: Check for existing investment
      const existingInvestment = await prisma.acceptedInvestor.findFirst({
        where: {
          proposalId,
          investorId: req.user.id,
        },
      });

      if (existingInvestment) {
        // Step 4a: Update contribution
        await prisma.acceptedInvestor.update({
          where: { id: existingInvestment.id },
          data: {
            contribution: { increment: amount },
          },
        });
      } else {
        // Step 4b: Create new investment record
        await prisma.acceptedInvestor.create({
          data: {
            proposalId,
            investorId: req.user.id,
            contribution: amount,
          },
        });

        // Step 5: Increment activeInvestments (only on first investment in this proposal)
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            activeInvestments: { increment: 1 },
          },
        });
      }

      // Step 6: Update proposal currentFunding and status
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          currentFunding: { increment: amount },
          status:
            newTotal >= proposal.fundingGoal
              ? "FUNDED"
              : proposal.status === "APPROVED"
              ? "NEGOTIATING"
              : proposal.status,
        },
      });

      // Step 7: Update total investment for user
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          totalInvestment: { increment: amount },
        },
      });

      res.status(200).json({ message: "Investment successful" });
    } catch (error) {
      console.error("Investment error:", error);
      res.status(500).json({ message: "Server error during investment" });
    }
  }
);

// GET /api/proposals/:id/messages
router.get(
  "/:id/messages",
  authenticateToken,
  restrictTo("investor", "founder", "admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const messages = await prisma.message.findMany({
        where: {
          proposalId: parseInt(id),
        },
        orderBy: {
          timestamp: "asc",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }
);

module.exports = router;
