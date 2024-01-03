import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      limit: 200,
      required: true,
    },
    content: {
      type: String,
      limit: 1000,
      required: true,
    },
    media: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Post = new mongoose.model("Post", postSchema);
