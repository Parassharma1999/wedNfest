import { hash } from "bcrypt";
import { userModel, vendorRegisterModel } from "../model/userModel";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import validator from "validator";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL;

const mailTranspoter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Use 465 for SSL or 587 for TLS
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

const getJWTAccessToken = (payload: string): string => {
  const token = jwt.sign({ payload }, ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
  return token;
};

export const userSignupService = async (data: any) => {
  const { email, password, firstName, lastName } = data;
  const user = await userModel.findOne({
    email,
  });

  if (user) throw new Error("user already exists");

  const newUser = await userModel.create({
    email,
    password: await hash(password, 10),
    firstName,
    lastName,
  });
  const { isEmailSend } = await sendVerificationEmail(email);
  console.log("isEmailSend = ", isEmailSend);
  if (isEmailSend) return newUser;
};

export const registerVendorService = async (data: any) => {
  const {
    email,
    firstName,
    lastName,
    businessName,
    businessCategory,
    phone,
    state,
  } = data;
  const isExist = await vendorRegisterModel.findOne({ email });
  if (isExist) throw new Error("User already exists with us");

  const vendor = await vendorRegisterModel.create({
    email,
    firstName,
    lastName,
    businessName,
    businessCategory,
    phone,
    state,
  });
  return vendor;
};

export const sendVerificationEmail = async (email: string) => {
  if (!email) throw new Error("Invalid Email");
  const user = await userModel.findOne({ email });
  if (user?.verified) throw new Error("Email is already verified");

  const token = getJWTAccessToken(email);
  const emailSend = await mailTranspoter.sendMail({
    from: EMAIL_USERNAME,
    to: email,
    subject: "Email verification request",
    html: `
            <h1>Welcome to wedNfest!</h1>
            <p>Verify you by clicking below link: </p>
            <p>${FRONTEND_URL}/verify-email/${token}</p>
            `,
  });
  return { isEmailSend: emailSend, token: token };
};

export const verifyEmail = async (token: string) => {
  const verified: any = jwt.verify(token, ACCESS_SECRET as string);
  if (verified) {
    const user = await userModel.updateOne(
      {
        email: verified.payload,
      },
      { verified: true }
    );
    if (!user) throw new Error("User not found");
    return user;
  }
};

export const forgotPasswordSendEmail = async (data: any) => {
  const { email } = data;
  if (!email) throw new Error("Email is required");

  if (!validator.isEmail(email)) throw new Error("Email is invalid");

  let user = await userModel.findOne({ email });
  if (!user) {
    user = await vendorRegisterModel.findOne({ email });
  }
  if (!user)
    throw new Error("Email is not registered with us, please sign up first");

  const resetToken = getJWTAccessToken(email);
  const mailOptions = {
    from: EMAIL_USERNAME,
    to: email,
    subject: "Password Reset Request",
    html: `
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${FRONTEND_URL}/reset-password/${resetToken}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `,
  };
  return { isMailSend: await mailTranspoter.sendMail(mailOptions), email };
};

export const verifyForgotPasswordService = async (data: any) => {
  const { token } = data;
  const verified = jwt.verify(token, ACCESS_SECRET as string);
  console.log("forgot pass = ", verified, token);
  if (verified) {
    const newToken = jwt.sign(
      { payload: (verified as JwtPayload).payload },
      ACCESS_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    return newToken;
  } else {
    throw new Error("Something went wrong, Try again");
  }
};

export const resetPasswordService = async (
  { password }: any,
  { token }: any
) => {
  if (!token) throw new Error("Unauthorized access");
  const isVerified = jwt.verify(token, process.env.ACCESS_SECRET as string);
  if (isVerified) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updateOne(
      { email: (isVerified as JwtPayload).payload },
      { password: hashedPassword }
    );
  }
};
