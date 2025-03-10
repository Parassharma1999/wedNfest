import express from "express";
import { authRouter } from "./routes/auth";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();
app.listen(process.env.PORT || 3003, () => {
  console.log(`Server is listening at Port ${process.env.PORT}`);
});

app.use("/api/v1/", authRouter);
