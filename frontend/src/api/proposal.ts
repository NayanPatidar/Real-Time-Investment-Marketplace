// src/api/proposal.ts

import instance from "./axios";

// Create a new proposal (Founders only)
export const createProposal = async (data: {
  title: string;
  description: string;
  fundingGoal: number;
}) => {
  const res = await instance.post("/proposals", data);
  return res.data;
};

// Get all proposals (Investor/Admin)
export const getAllProposals = async () => {
  const res = await instance.get("/proposals");
  return res.data;
};

// Get a single proposal (any role)
export const getProposalById = async (id: string | number) => {
  const res = await instance.get(`/proposals/${id}`);
  return res.data;
};

// Update proposal status (Investor/Admin)
export const updateProposalStatus = async (
  id: string | number,
  status: "UNDER_REVIEW" | "NEGOTIATING" | "FUNDED"
) => {
  const res = await instance.put(`/proposals/${id}`, { status });
  return res.data;
};

// Add a comment to a proposal (Founder/Investor)
export const addCommentToProposal = async (
  proposalId: string | number,
  content: string
) => {
  const res = await instance.post(`/proposals/${proposalId}/comments`, {
    content,
  });
  return res.data;
};

export const getMyProposals = async () => {
  const res = await instance.get("/proposals/myproposals");
  return res.data;
};

export const investInProposal = async (data: {
  proposalId: number | string;
  amount: number;
}) => {
  const res = await instance.post("/proposals/invest", data);
  return res.data;
};
