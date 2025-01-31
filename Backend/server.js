import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import connectDb from "./db/connectDB.js";
import userRoute from "./routes/user.routes.js";
import { v2 as cloudinary } from "cloudinary"; // Fixed typo (cloundinary -> cloudinary)
import postRoute from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import path from "path"; // ✅ Import missing path module
import { fileURLToPath } from "url"; // Required to resolve __dirname in ES modules

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: "5mb" })); // ✅ Removed duplicate express.json()
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());

// ✅ Correct way to handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Register routes properly
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoutes);

// ✅ Serve frontend correctly in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// ✅ Start server after connecting to DB
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port number ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to DB:", err);
});
