import validator from "validator";
import { Request, Response, NextFunction } from "express";
import { userModel, vendorRegisterModel } from "../model/userModel";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
interface loginRequest extends Request {
  body: any;
  user?: any;
}

interface authRequest extends Request {
  user?: any;
}

export const userSignupMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    if (!email || !validator.isEmail(email))
      throw new Error("Invalid email entered");
    else if (
      !password ||
      validator.isEmpty(password, { ignore_whitespace: true }) ||
      !validator.isLength(password, { min: 8 })
    )
      throw new Error("Password minimum length should be 8");
    else if (
      !firstName ||
      validator.isEmpty(password, { ignore_whitespace: true })
    )
      throw new Error("First Name is required");
    else if (
      !lastName ||
      validator.isEmpty(lastName, { ignore_whitespace: true })
    )
      throw new Error("Last Name is required");
    else {
      next();
    }
  } catch (error: unknown) {
    error instanceof Error
      ? res.status(404).send({
          status: 404,
          message: error.message,
        })
      : res.status(404).send({
          status: 404,
          message: "An unknown error occured",
        });
  }
};

export const vendorRegisterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    email,
    firstName,
    lastName,
    businessName,
    businessCategory,
    phone,
    state,
  } = req.body;
  try {
    if (!email || !validator.isEmail(email))
      throw new Error("Invalid email entered");
    else if (
      !firstName ||
      validator.isEmpty(firstName, { ignore_whitespace: true })
    )
      throw new Error("First Name is required");
    else if (
      !lastName ||
      validator.isEmpty(lastName, { ignore_whitespace: true })
    )
      throw new Error("Last Name is required");
    else if (
      !businessName ||
      validator.isEmpty(businessName, { ignore_whitespace: true })
    )
      throw new Error("Business Name is required");
    else if (
      !businessCategory ||
      validator.isEmpty(businessCategory, { ignore_whitespace: true })
    )
      throw new Error("business Catergory is required");
    else if (!phone || !validator.isMobilePhone(phone, "en-IN"))
      throw new Error("Invalid Phone number");
    else if (!state || validator.isEmpty(state, { ignore_whitespace: true }))
      throw new Error("State is required");
    else {
      next();
    }
  } catch (error: unknown) {
    error instanceof Error
      ? res.status(404).send({
          status: 404,
          message: error.message,
        })
      : res.status(404).send({
          status: 404,
          message: "An unknown error occured",
        });
  }
};

export const loginMiddleware = async (
  req: loginRequest,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    if (!email || validator.isEmpty(email))
      throw new Error("Email is required");
    else if (!password || validator.isEmpty(password))
      throw new Error("Password is required");
    else {
      var user = await userModel.findOne({ email });
      if (!user) user = await vendorRegisterModel.findOne({ email });
      console.log("User = ", user);
      if (!user || !user.password) throw new Error("Invalid credentials");
      else {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          req.body.user = user;
          next();
        } else {
          throw new Error("Invalid credentials");
        }
      }
    }
  } catch (error: unknown) {
    res.status(400).send({
      status: 400,
      message:
        error instanceof Error ? error.message : "Something went wrong...",
    });
  }
};

export const authMiddleware = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.split(" ")[1];
    if (!token) throw new Error("Unauthorized access");
    const isVerified = jwt.verify(token, process.env.ACCESS_SECRET as string);
    req.user = isVerified;
    next();
  } catch (error: any) {
    res.status(404).send({
      status: 404,
      message: "Invalid credentials",
    });
  }
};
