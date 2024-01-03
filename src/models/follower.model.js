import mongoose, { Schema } from "mongoose";

const followerSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Follower = new mongoose.model("Follower", followerSchema);
