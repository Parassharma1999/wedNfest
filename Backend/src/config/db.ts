import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  await mongoose
    .connect(
      (process.env.DB_URL ?? "")
        .replace("DB_USERNAME", process.env.DB_USERNAME ?? "")
        .replace("DB_PASSWORD", process.env.DB_PASSWORD ?? "")
        .replace("DB_NAME", process.env.DB_NAME ?? "")
    )
    .then(() => console.log("Database connected"))
    .catch((err) => {
      console.log("error while connect DB ---> ", err);
      process.exit(1);
    });
};
