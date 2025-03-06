const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cartRoutes = require("./routes/cartRoutes");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: process.env.FONTEND_URL || "*", // Nếu không có biến môi trường, cho phép tất cả
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Sử dụng middleware để parse JSON
app.use(bodyParser.json());

// Sử dụng routes cho Cart Service
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 4003;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/cartService?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB for Cart Service");
    app.listen(PORT, () =>
      console.log(`Cart Service is running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
