// lib/api/investor.tsp
import instance from "./axios";

export const fetchInvestorDashboard = async () => {
  const response = await instance.get("/investor/dashboard");
  return response.data;
};
