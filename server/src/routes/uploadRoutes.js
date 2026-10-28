import { Router } from "express";
import { uploadMiddleware, handleUpload } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.post("/", uploadMiddleware.array("files", 5), handleUpload);

export default router;
