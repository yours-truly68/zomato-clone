import { connectDB } from "../src/config/db.config.js";

export const getRestaurantCollection = async () => {
  const db = await connectDB();
  return db.collection("restaurants");
};

export const getRiderCollection = async () => {
  const db = await connectDB();
  return db.collection("riders");
};

export const getUserCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};
