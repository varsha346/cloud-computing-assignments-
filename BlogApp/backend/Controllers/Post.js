import Post from "../Models/Post.js";
import User from "../Models/User.js";

export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      userId: req.userId,
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.userId },
      order: [["id", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "DESC"]],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    await Post.update(req.body, {
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.destroy({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};