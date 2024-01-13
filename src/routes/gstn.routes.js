import { Router } from "express";
import { verifyGSTN } from "../controllers/gst.controller";

const router = Router();
router.route("/verify").post(verifyGSTN);

export default router;
