const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Tạo đơn hàng
router.post("/create", orderController.createOrder);

// Lấy đơn hàng theo id
router.get("/:orderId", orderController.getOrderById);

// Lấy đơn hàng của user
router.get("/user/:userId", orderController.getOrdersByUser);

// Hủy đơn hàng
router.post("/cancel/:orderId", orderController.cancelOrder);

module.exports = router;
