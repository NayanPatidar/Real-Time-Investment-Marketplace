import instance from "./axios";

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getAllNotifications = async (
  userId: string | number
): Promise<Notification[]> => {
  const res = await instance.get(`/notifications/${userId}`);
  return res.data;
};
