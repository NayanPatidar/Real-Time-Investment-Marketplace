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
  timestamp: string; // or Date if you're using Date objects
  user: Author;
  likes: number;
  parentId: number | null;
  replies?: Comment[];
}

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
