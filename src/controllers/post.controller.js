import { Post } from "../models/post.model";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiError } from "../utils/ApiError";

const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const creator = req.user?._id;
  const mediaLocalPath = req.file?.path;

  let mediaUrl = "";
  if (mediaLocalPath) {
    const media = await uploadOnCloudinary(mediaLocalPath);
    if (!media.url) throw new ApiError(400, "Error while uploading media");
    mediaUrl = media.url;
  }

  const post = await Post.create({
    creator,
    title,
    content,
    media: mediaUrl,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, post._id, "Post created successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  // Check if the user is the creator of the post
  if (post.creator.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to delete this post");
  }

  await post.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  const post = await Post.findById(postId);

  // Check if the user is the creator of the post
  if (post.creator.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to update this post");
  }

  post.title = title || post.title;
  post.content = content || post.content;
  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post._id, "Post updated successfully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Get the user's following list using aggregation
  const currentUserProfile = await User.aggregate([
    {
      $match: {
        _id: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "follower",
        as: "following",
      },
    },
    {
      $unwind: "$following",
    },
    {
      $replaceRoot: { newRoot: "$following" },
    },
    {
      $project: {
        following: "$company",
      },
    },
  ]);

  const followingIds = currentUserProfile.map((profile) => profile.following);

  // Find posts from users the current user is following
  const followingPosts = await Post.find({ creator: { $in: followingIds } })
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Find other posts
  const otherPosts = await Post.find({ creator: { $nin: followingIds } })
    .skip(startIndex - followingPosts.length) // Adjust the skip based on the number of followingPosts
    .limit(limit - followingPosts.length)
    .sort({ createdAt: -1 });

  const totalPosts = await Post.countDocuments();

  // Concatenate the followingPosts and otherPosts
  const posts = followingPosts.concat(otherPosts);

  // Pagination information
  const pagination = {
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, { posts, pagination }, "Posts fetched successfully")
    );
});

export { createPost, deletePost, updatePost, getAllPosts };
