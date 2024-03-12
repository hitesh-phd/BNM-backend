import mongoose, { Schema } from "mongoose";

const gstDataSchema = new Schema(
  {
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      index: true,
      default: null,
    },
    mobileNumber: {
      type: Number,
    },
    ownerFullName: {
      type: String,
      default: null,
    },
    hqLocation: {
      type: String,
      default: null,
    },
    serviceLocation: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },
    service: {
      type: String,
      default: null,
    },
    yearOfEstablishment: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const gstData = mongoose.model("gstData", gstDataSchema);
