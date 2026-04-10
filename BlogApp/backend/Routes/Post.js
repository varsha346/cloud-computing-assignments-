import express from "express";
import {
  createPost,
  getAllPosts,
  getPosts,
  updatePost,
  deletePost,
} from "../Controllers/Post.js";
import { authMiddleware } from "../Middleware/Auth.js";

const router = express.Router();

router.get("/all", getAllPosts);

router.use(authMiddleware);

router.post("/", createPost);
router.get("/", getPosts);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;