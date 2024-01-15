import { Router } from "express";
import { verifyGSTNController } from "../../../controllers/apps/verify-gstn/gstn.controllers.js";
const router = Router();

router.route("/").post(verifyGSTNController);

export default router;
