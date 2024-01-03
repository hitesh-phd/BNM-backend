import mongoose, { Schema } from "mongoose";

const postLikeSchema = new Schema(
  {
    like: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const PostLike = new mongoose.model("PostLike", postLikeSchema);
