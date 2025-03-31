import instance from "./axios";

export const createRazorpayOrder = async (amount: number) => {
    const response = await instance
    .post("/razorpay/create-order", {
      amount,
    });
    return response.data;
  };