import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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
      // fs.unlinkSync(localFilePath);

      return response;
    } else {
      //upload file
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });

      console.log("file uploaded successfully", response.url);
      // fs.unlinkSync(localFilePath);
      return response;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove locally saved temp file as upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
