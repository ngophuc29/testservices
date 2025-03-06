const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const orderRoutes = require("./routes/orderRoutes");
const cors = require("cors");

const app = express();

// Kích hoạt CORS trước khi xử lý các request khác
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Chỉ cho phép từ frontend cụ thể
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 4005;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/orderService?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB for Order Service");
    app.listen(PORT, () => console.log(`Order Service is running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
