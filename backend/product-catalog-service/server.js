require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDB");

const app = express();
const port = process.env.PORT || 4004; // Dùng biến môi trường cho port nếu có
const router = require("./routers/index");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

async function startServer() {
  try {
    await connectDB(); 

    app.use(
      cors({
        origin: process.env.FONTEND_URL || "*", // Nếu không có biến môi trường, cho phép tất cả
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    app.use(express.json());

    app.use("/api", router);

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("⛔ Lỗi khi khởi động server:", error);
  }
}

startServer();
