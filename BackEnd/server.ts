import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./src/utils/db";
require("dotenv").config();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
// create server
app.listen(process.env.PORT, () => {
  console.log(`server is listening on ${process.env.PORT}`);
  connectDB();
});
