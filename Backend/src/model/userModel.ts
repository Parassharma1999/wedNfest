import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface user extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified: Boolean;
  role: string;
}

interface vendor extends Document {
  firstName: string;
  lastName: string;
  businessName: string;
  businessCategory: string;
  phone: string;
  email: string;
  state: string;
}

const userAuthSchema = new Schema<user>({
  firstName: {
    type: String,
    required: true,
    lowercase: true,
    validate: (data: string) => {
      if (validator.isEmpty(data.trim())) {
        throw new Error("First name should be of atleast 2 characters");
      }
    },
  },
  lastName: {
    type: String,
    lowercase: true,
    required: true,
    validate: (data: string) => {
      if (validator.isEmpty(data.trim())) {
        throw new Error("Last name should be of atleast 2 characters");
      }
    },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate: (data: string) => {
      if (!validator.isEmail(data)) {
        throw new Error("Ivalid credentials" + data);
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: (data: string) => {
      validator.isLength(data, { min: 8 });
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    lowercase: true,
    enum: {
      values: ["user"],
      message: "Role type {VALUE} is invalid",
    },
  },
});

const vendorRegisterSchema = new Schema<vendor>({
  firstName: {
    type: String,
    required: true,
    lowercase: true,
    validate: (data: string) => {
      if (validator.isEmpty(data.trim())) {
        throw new Error("First name is requried");
      }
    },
  },
  lastName: {
    type: String,
    lowercase: true,
    required: true,
    validate: (data: string) => {
      if (validator.isEmpty(data.trim())) {
        throw new Error("First name is requried");
      }
    },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate: (data: string) => {
      if (!validator.isEmail(data)) {
        throw new Error(`Email ${data} is not valid`);
      }
    },
  },
  businessName: {
    type: String,
    required: true,
    lowercase: true,
    validate: (data: string) => {
      if (validator.isEmpty(data.trim())) {
        throw new Error("Business Name is requried");
      }
    },
  },
  businessCategory: {
    type: String,
    required: true,
    lowercase: true,
    enum: {
      values: [
        "caterers",
        "bakers",
        "djs",
        "photographers",
        "videographers",
        "hair & makeup",
        "musicians",
      ],
      message: "Invalid for the value {VALUE}",
    },
  },
  phone: {
    type: String,
    required: true,
    validate: (data: string) => {
      if (!validator.isMobilePhone(data, "en-IN"))
        throw new Error("Phone number is invalid");
    },
  },
  state: {
    type: String,
    required: true,
    lowercase: true,
    enum: {
      values: [
        "andhra pradesh",
        "arunachal pradesh",
        "assam",
        "bihar",
        "chhattisgarh",
        "goa",
        "gujarat",
        "haryana",
        "himachal pradesh",
        "jharkhand",
        "karnataka",
        "kerala",
        "madhya pradesh",
        "maharashtra",
        "manipur",
        "meghalaya",
        "mizoram",
        "nagaland",
        "odisha",
        "punjab",
        "rajasthan",
        "sikkim",
        "tamil nadu",
        "telangana",
        "tripura",
        "uttar pradesh",
        "uttarakhand",
        "west bengal",
        "andaman and nicobar islands",
        "chandigarh",
        "dadra and nagar haveli and daman and diu",
        "delhi",
        "lakshadweep",
        "ladakh",
        "jammu and kashmir",
        "puducherry",
      ],
      message: "Invalid for the value {VALUE}",
    },
  },
});

export const userModel = model("Users", userAuthSchema);
export const vendorRegisterModel = model("Vendors", vendorRegisterSchema);
