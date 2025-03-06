const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "config/config.env" });
}
app.use(cors({ origin: "*", credentials: true }));

// Routes import
const authRoutes = require("./routes/auth");
const commentRoutes = require("./routes/comments");
const likeRoutes = require("./routes/likes");
const postRoutes = require("./routes/posts");
const relationshipRoutes = require("./routes/relationships");
const storieRoutes = require("./routes/stories");
const userRoutes = require("./routes/users");
const audioRoutes = require("./routes/audio");
// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// cors cofiguration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

app.use("/api/v1", authRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1", likeRoutes);
app.use("/api/v1", postRoutes);
app.use("/api/v1", relationshipRoutes);
app.use("/api/v1", storieRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", audioRoutes);
// error middileware
app.use(errorMiddleware);

module.exports = app;
