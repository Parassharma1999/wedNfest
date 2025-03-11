import { Request, Response } from "express";
import jwt, { JwtPayload, sign } from "jsonwebtoken";
import validator from "validator";
import dotenv from "dotenv";
import {
  forgotPasswordSendEmail,
  registerVendorService,
  resetPasswordService,
  sendVerificationEmail,
  userSignupService,
  verifyEmail,
  verifyForgotPasswordService,
} from "../services/authService";
dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET;

const getAccessToken = (payload: string): string => {
  const token = jwt.sign({ payload }, ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
  return token;
};

export const userSignup = async (req: Request, res: Response) => {
  try {
    const newUser = await userSignupService(req.body);

    res.status(200).send({
      status: 200,
      message:
        "Signup successful. Verification email has been sent, Please verify your email.",
      data: newUser,
    });
  } catch (err: any) {
    res.status(404).send({
      status: 400,
      message: err.message,
    });
  }
};

export const vendorRegister = async (req: Request, res: Response) => {
  try {
    const vendor = await registerVendorService(req.body);

    res.status(200).send({
      status: 200,
      message:
        "Thank you for Registering, We will connect soon with you with further steps",
      data: vendor,
    });
  } catch (err: any) {
    res.status(404).send({
      status: 400,
      message: err.message,
    });
  }
};

export const verifyUserEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token) throw new Error("Error verifying email");
    console.log("verifyUserEmail = ", token);
    const verified = await verifyEmail(token);
    if (verified) {
      res.status(200).send({
        success: true,
        message: "Email verified successfully. You can log in now.",
      });
    }
  } catch (error: any) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) throw new Error("Invalid Email");

    const { isEmailSend, token } = await sendVerificationEmail(email);
    if (isEmailSend) {
      res.status(200).send({
        success: true,
        message: "Verification email has been sent, Please verify your email.",
        token: token,
      });
    }
  } catch (error: any) {
    res.status(200).send({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const token = getAccessToken(req.body);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 360000),
      httpOnly: true,
    });
    res.status(200).send({
      success: true,
      message: "LogIn successful",
      token: token,
    });
  } catch (error: any) {
    res.status(404).send({
      status: 400,
      message: error.message,
    });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { isMailSend, email } = await forgotPasswordSendEmail(req.body);
    if (isMailSend) {
      res.status(200).send({
        status: true,
        message: `Reset password mail has been sent to ${email}, will get expire after 15 mins`,
      });
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error: any) {
    res.status(404).send({
      success: false,
      message: error.message,
    });
  }
};

export const verifyForgotPassword = async (req: Request, res: Response) => {
  try {
    const newToken = await verifyForgotPasswordService(req.params);
    if (newToken) {
      res.cookie("token", newToken);
      res.status(200).send({
        success: true,
        message: "Email verified successfully",
        token: newToken,
      });
    } else throw new Error("Something went wrong");
  } catch (error: any) {
    res.status(400).send({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong, Please try again",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await resetPasswordService(req.body, req.params);
    res.status(201).send({
      success: true,
      message: "Password update successful",
    });
  } catch (error: any) {
    res.status(400).send({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong, Try again",
    });
  }
};
