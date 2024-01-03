import mongoose, { Schema } from "mongoose";

const postCommentSchema = new Schema(
  {
    commentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      limit: 200,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const PostComment = new mongoose.model("PostComment", postCommentSchema);
