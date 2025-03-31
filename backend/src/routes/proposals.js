require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { restrictTo, authenticateToken } = require("../middleware/auth");
const client = require("../config/redis-config");
const router = express.Router();

// Only founders can create proposals
router.post("/", authenticateToken, restrictTo("FOUNDER"), async (req, res) => {
  const { title, description, fundingGoal, category } = req.body;
  if (!title || !description || !fundingGoal || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        fundingGoal: parseFloat(fundingGoal),
        founderId: req.user.id,
        category,
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
          founder: {
            select: { id: true, name: true, email: true },
          },
          acceptedInvestors: {
            include: {
              investor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const enrichedProposals = proposals.map((proposal) => {
        const investorContribution = proposal.acceptedInvestors
          .filter((a) => a.investor.id === req.user.id)
          .reduce((sum, a) => sum + a.contribution, 0);

        const allInvestments = proposal.acceptedInvestors.map((a) => ({
          id: a.investor.id,
          name: a.investor.name,
          email: a.investor.email,
          contribution: a.contribution,
        }));

        return {
          ...proposal,
          investorContribution,
          allInvestors: allInvestments,
        };
      });

      const investorStats = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          totalInvestment: true,
          activeInvestments: true,
        },
      });

      const responseData = {
        proposals: enrichedProposals,
        investorStats,
      };

      res.json(responseData);
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
        include: {
          founder: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
      where: { 
        proposalId: parseInt(req.params.id),
        parentId: null // Only fetch top-level comments
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
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
  const { content, parentId } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        proposalId: parseInt(req.params.id),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
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

// GET /api/proposals/:id
router.get("/:id(\\d+)", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

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
          select: {
            investorId: true,
            contribution: true,
          },
        },
      },
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // FOUNDER can only access their own proposal
    if (role === "FOUNDER" && proposal.founder.id !== userId) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const contributions = proposal.acceptedInvestors || [];

    const yourContribution =
      contributions.find((inv) => inv.investorId === userId)?.contribution || 0;

    const othersContribution = contributions
      .filter((inv) => inv.investorId !== userId)
      .reduce((sum, inv) => sum + inv.contribution, 0);

    const totalContribution = yourContribution + othersContribution;

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
      contributions: {
        yourContribution,
        othersContribution,
        totalContribution,
      },
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
  restrictTo("INVESTOR", "ADMIN"),
  async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;    
    console.log();
    
    if (!["UNDER_REVIEW" , "NEGOTIATING" , "FUNDED"].includes(status)) {
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
  restrictTo("INVESTOR", "FOUNDER"),
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
      console.log("Proposal:", proposal);

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      const allContributions = await prisma.acceptedInvestor.aggregate({
        where: { proposalId },
        _sum: { contribution: true },
      });

      const currentSum = allContributions._sum.contribution || 0;
      const newTotal = currentSum + amount;

      if (newTotal > proposal.fundingGoal) {
        return res.status(400).json({
          message: "Investment exceeds funding goal",
        });
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

      const myproposal = await prisma.proposal.findUnique({
        where: { id: parseInt(proposalId) },
      });

      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          currentFunding: newTotal,
          status:
            newTotal >= proposal.fundingGoal
              ? "FUNDED"
              : proposal.status === "UNDER_REVIEW"
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

      await prisma.notification.create({
        data: {
          userId: proposal.founderId,
          type: "INVESTMENT",
          content: `${req.user.name} has invested $${amount} in your proposal "${proposal.title}"`,
        },
      });

      await client.del(`notifications:${proposal.founderId}`);

      req.io.to(`user:${proposal.founderId}`).emit("notification", {
        message: `${req.user.name} has invested $${amount}`,
      });
      console.log("Notification sent to founder:", proposal.founderId);

      res.status(200).json({ message: "Investment successful" });
    } catch (error) {
      console.error("Investment error:", error);
      res.status(500).json({ message: "Server error during investment" });
    }
  }
);

// GET /api/proposals/:id/messages?receiverId=123
router.get(
  "/:id/messages",
  authenticateToken,
  restrictTo("INVESTOR", "FOUNDER", "ADMIN"),
  async (req, res) => {
    const { id } = req.params;
    const { receiverId } = req.query;

    if (!receiverId) {
      return res
        .status(400)
        .json({ message: "Missing required receiverId query param" });
    }

    const proposalId = parseInt(id);
    const senderId = req.user.id;
    const receiver = parseInt(receiverId);

    // Deterministic chatRoomId
    const chatRoomId = `proposal:${proposalId}:chat:${[senderId, receiver]
      .sort((a, b) => a - b)
      .join("_")}`;

    const redisKey = `chat:${chatRoomId}`;

    try {
      // 1️⃣ Try fetching from Redis
      const cachedMessages = await client.lRange(redisKey, 0, -1);
      if (cachedMessages.length > 0) {
        const messages = cachedMessages.map((msg) => JSON.parse(msg));
        return res.status(200).json(messages);
      }

      // 2️⃣ Fallback: Fetch from Prisma (PostgreSQL)
      const messages = await prisma.message.findMany({
        where: {
          proposalId,
          chatRoomId,
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

      if (messages.length > 0) {
        const pipeline = client.multi();
        messages.forEach((msg) =>
          pipeline.rPush(redisKey, JSON.stringify(msg))
        );
        pipeline.expire(redisKey, 3600); // Optional TTL: 1 hour
        await pipeline.exec();
      }

      res.status(200).json(messages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }
);

// GET /api/proposals/:id/investors
router.get("/:id/investors", authenticateToken, async (req, res) => {
  const proposalId = parseInt(req.params.id);
  const founderId = req.user.id;

  try {
    // Find all messages where the current user (founder) is the receiver
    const messages = await prisma.message.findMany({
      where: {
        proposalId,
        receiverId: founderId,
      },
      select: {
        senderId: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      distinct: ["senderId"], // Only unique investors
    });

    // Filter only senders with role "INVESTOR"
    const investors = messages
      .filter((msg) => msg.sender.role === "INVESTOR")
      .map((msg) => msg.sender);

    res.status(200).json(investors);
  } catch (error) {
    console.error("Failed to fetch investors who sent messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/proposals/:id/investor-contributions
router.get(
  "/:id/investor-contributions",
  authenticateToken,
  async (req, res) => {
    const proposalId = parseInt(req.params.id);

    try {
      const investors = await prisma.acceptedInvestor.findMany({
        where: { proposalId },
        include: {
          investor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Assign unique color to each investor (deterministically or randomly)
      const colors = [
        "#6366F1",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
        "#22D3EE",
      ];

      const response = investors.map((entry, index) => ({
        id: entry.investor.id,
        name: entry.investor.name || entry.investor.email,
        email: entry.investor.email,
        contribution: entry.contribution,
        color: colors[index % colors.length],
      }));

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching investor contributions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
