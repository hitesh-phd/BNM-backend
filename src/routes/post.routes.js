import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
} from "../controllers/post.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();
router.route("/allPosts").get(verifyJWT, getAllPosts);
router.route("/create").post(verifyJWT, upload.single("media"), createPost);
router.route("/delete").delete(verifyJWT, deletePost);
router.route("/update").patch(verifyJWT, updatePost);

export default router;
