import { AxiosResponse } from "axios";
import instance from "./axios";

export interface Notification {
  id: number;
  userId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

export const getAllNotifications = async (
  userId: string | number
): Promise<Notification[]> => {
  const res: AxiosResponse<Notification[]> = await instance.get(
    `/notifications/${userId}`
  );
  return res.data;
};
