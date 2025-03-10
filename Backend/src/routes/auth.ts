import { Router } from "express";
import {
  forgetPassword,
  loginUser,
  resendVerificationEmail,
  resetPassword,
  userSignup,
  vendorRegister,
  verifyForgotPassword,
  verifyUserEmail,
} from "../controllers/authController";
import {
  loginMiddleware,
  userSignupMiddleware,
  vendorRegisterMiddleware,
} from "../middlewares/authMiddleware";

export const authRouter = Router();

authRouter.post("/signup/user", userSignupMiddleware, userSignup);
authRouter.post("/signup/vendor", vendorRegisterMiddleware, vendorRegister);
authRouter.post("/login", loginMiddleware, loginUser);
authRouter.post("/forgot-password", forgetPassword);
authRouter.get("/reset-password/:token", verifyForgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.get("/verify-email/:token", verifyUserEmail);
authRouter.post("/resend-email-verification", resendVerificationEmail);
