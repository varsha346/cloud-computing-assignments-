import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./Config/Db.js";

import authRoutes from "./Routes/Auth.js";
import postRoutes from "./Routes/Post.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync();

    app.listen(process.env.PORT, () =>
      console.log(`Server running on ${process.env.PORT}`)
    );
  } catch (err) {
    console.error(err);
  }
};

start();