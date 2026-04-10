import { DataTypes } from "sequelize";
import sequelize from "../Config/Db.js";
import User from "./User.js";

const Post = sequelize.define("Post", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
});

// Relation
User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

export default Post;