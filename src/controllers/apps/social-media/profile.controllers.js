import mongoose from "mongoose";
import { User } from "../../../models/apps/auth/user.models.js";
import { SocialFollow } from "../../../models/apps/social-media/follow.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";

/**
 *
 * @param {string} userId
 * @param {import("express").Request} req
 * @description A utility function, which querys the {@link User} model and returns the profile with account details
 */
const getUserSocialProfile = async (userId, req) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  let profile = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        refreshToken: 0,
        forgotPasswordToken: 0,
        forgotPasswordExpiry: 0,
        emailVerificationToken: 0,
        emailVerificationExpiry: 0,
        password: 0,
      },
    },
    {
      $lookup: {
        from: "socialfollows",
        localField: "_id",
        foreignField: "followerId",
        as: "following", // users that are followed by current user
      },
    },
    {
      $lookup: {
        from: "socialfollows",
        localField: "_id",
        foreignField: "followeeId",
        as: "followedBy", // users that are following the current user
      },
    },
    {
      $addFields: {
        followersCount: { $size: "$followedBy" },
        followingCount: { $size: "$following" },
      },
    },
    {
      $project: {
        followedBy: 0,
        following: 0,
      },
    },
  ]);

  let isFollowing = false;

  if (req.user?._id && req.user?._id?.toString() !== userId.toString()) {
    // Check if there is a logged in user and logged in user is NOT same as the profile that is being loaded
    // In such case we will check if the logged in user follows the loaded profile user
    const followInstance = await SocialFollow.findOne({
      followerId: req.user?._id, // logged in user. If this is null `isFollowing` will be false
      followeeId: userId,
    });
    isFollowing = followInstance ? true : false;
  }

  const userProfile = profile[0];

  if (!userProfile) {
    throw new ApiError(404, "User profile does not exist");
  }
  return { ...userProfile, isFollowing };
};

const getMySocialProfile = asyncHandler(async (req, res) => {
  let profile = await getUserSocialProfile(req.user._id, req);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile fetched successfully"));
});

// Public route
const getProfileByUserName = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const userProfile = await getUserSocialProfile(user._id, req);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully")
    );
});

const updateSocialProfile = asyncHandler(async (req, res) => {
  const {
    companyName,
    mobileNumber,
    ownerFullName,
    hqLocation,
    serviceLocation,
    yearOfEstablishment,
    socialLink,
  } = req.body;

  let profile = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        companyName,
        mobileNumber,
        ownerFullName,
        hqLocation,
        serviceLocation,
        yearOfEstablishment,
        socialLink,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  profile = await getUserSocialProfile(req.user._id, req);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  const userId = req.user?._id;

  const user = await User.findById(userId);
  let publicId = null;
  if (user.coverImage.public_id) {
    publicId = user.coverImage.public_id;
  }

  if (!coverImageLocalPath)
    throw new ApiError(400, "coverImage file is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath, publicId);

  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading cover image");
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        "coverImage.url": coverImage.url,
        "coverImage.public_id": coverImage.public_id,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "user coverImage updated successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  // Check if user has uploaded an avatar
  const avatarLocalPath = req.file?.path;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  let publicId = null;
  if (user.avatar.public_id) {
    publicId = user.avatar.public_id;
  }

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing");
  const avatar = await uploadOnCloudinary(avatarLocalPath, publicId);

  if (!avatar.url)
    throw new ApiError(400, "Error while uploading avatar image");
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        "avatar.url": avatar.url,
        "avatar.public_id": avatar.public_id,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

export {
  getMySocialProfile,
  getProfileByUserName,
  updateSocialProfile,
  updateCoverImage,
  updateAvatar,
};
