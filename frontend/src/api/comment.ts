import instance from "./axios";

export interface Author {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: Author;
}

export const getProposalComments = async (
  proposalId: string | number
): Promise<Comment[]> => {
  const res = await instance.get(`/proposals/comments/${proposalId}`);
  return res.data;
};

export const postProposalComment = async (
  proposalId: string | number,
  content: string
): Promise<Comment> => {
  const res = await instance.post(`/proposals/comments/${proposalId}`, {
    content,
  });
  return res.data;
};
