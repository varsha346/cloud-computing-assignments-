import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// ✅ UPLOAD route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    res.json({ message: "File uploaded successfully", key: params.Key });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// ✅ GET FILES route (fixed - no duplicate)
app.get("/files", async (req, res) => {
  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
      })
    );

    const files = (data.Contents || []).map((file) => ({
      key: file.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      size: file.Size,
      lastModified: file.LastModified,
    }));

    res.json(files);
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// ✅ DELETE route (was missing)
app.delete("/files/:key", async (req, res) => {
  try {
    // key may contain slashes, so decode it
    const key = decodeURIComponent(req.params.key);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );

    res.json({ message: "File deleted successfully", key });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
