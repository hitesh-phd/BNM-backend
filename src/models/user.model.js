import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { compare } from "bcrypt";

const userSchema = new Schema(
  {
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          let emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    isMailVerified: {
      type: Boolean,
      default: false,
    },
    ownerFullName: {
      type: String,
      required: true,
    },
    hqLocation: {
      type: String,
    },
    serviceLocation: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      validate: {
        validator: function (v) {
          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid password!`,
      },
    },
    industry: {
      type: Schema.Types.ObjectId,
      ref: "Industry",
    },
    service: {
      type: String,
      trim: true,
    },
    yearOfEstablishment: {
      type: String,
    },
    socialLink: [
      {
        insta: { type: String },
        fb: { type: String },
        twitter: { type: String },
        thread: { type: String },
        yt: { type: String },
      },
    ],
    avatar: {
      type: String, // Cloudinary URL
    },
    coverImage: {
      type: String, // Cloudinary URL
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      companyName: this.companyName,
      gstNumber: this.gstNumber,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = new mongoose.model("User", userSchema);
