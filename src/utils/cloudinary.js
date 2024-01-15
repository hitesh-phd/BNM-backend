import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { removeLocalFile } from "./helpers.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, publicId = null) => {
  try {
    if (!localFilePath) return null;
    if (publicId) {
      // If public_id is present, update the file on Cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
        public_id: publicId,
        resource_type: "auto",
      });

      console.log("File updated on Cloudinary", response.url);

      // Remove locally saved temp file
      removeLocalFile(localFilePath);

      return response;
    } else {
      //upload file
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });

      console.log("file uploaded successfully", response.url);
      removeLocalFile(localFilePath);
      return response;
    }
  } catch (error) {
    removeLocalFile(localFilePath); // remove locally saved temp file as upload operation got failed
    return null;
  }
};

const removeFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    // Extract public_id from the Cloudinary URL

    // Remove the file from Cloudinary
    const deletionResponse = await cloudinary.uploader.destroy(publicId);

    console.log("File removed from Cloudinary", deletionResponse);
    return deletionResponse;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
