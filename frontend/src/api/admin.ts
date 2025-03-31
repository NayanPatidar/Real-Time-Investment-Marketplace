import instance from "./axios";

interface Author {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  timestamp: string;
  user: Author;
  likes: number;
  parentId: number | null;
  replies?: Comment[];
}

export const fetchUsers = async (role = "") => {
  const response = await instance.get(
    `/admin/users${role ? `?role=${role}` : ""}`
  );
  return response.data;
};

export const fetchProposals = async (status = "") => {
  const response = await instance.get(
    `/admin/proposals${status ? `?status=${status}` : ""}`
  );
  return response.data;
};

export const updateProposalStatus = async (
  proposalId: number,
  status: string
) => {
  const response = await instance.put(`/admin/proposals/${proposalId}/status`, {
    status,
  });
  return response.data;
};

export const fetchStats = async () => {
  const response = await instance.get("/admin/stats");
  return response.data;
};

export const getProposalComments = async (
  proposalId: string | number
): Promise<Comment[]> => {
  const res = await instance.get(`/proposals/comments/${proposalId}`);
  return res.data;
};

export const postProposalComment = async (
  proposalId: string | number,
  content: string,
  parentId?: number
): Promise<Comment> => {
  const res = await instance.post(`/proposals/comments/${proposalId}`, {
    content,
    parentId,
  });
  return res.data;
};
