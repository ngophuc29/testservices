const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Tạo đơn hàng
router.post("/create", orderController.createOrder);

// Lấy đơn hàng theo id
router.get("/:orderId", orderController.getOrderById);

// Lấy đơn hàng của user
router.get("/user/:userId", orderController.getOrdersByUser);

// Lấy tất cả đơn hàng (Admin)
router.get("/", orderController.getAllOrders);

// Cập nhật đơn hàng (Admin)
router.put("/:orderId", orderController.updateOrder);

// Hủy đơn hàng
router.post("/cancel/:orderId", orderController.cancelOrder);
// Hủy đơn hàng (Admin) - cho phép hủy bất kỳ đơn hàng nào
router.post("/admin/cancel/:orderId", orderController.adminCancelOrder);

// Xóa đơn hàng (Admin) - xóa hoàn toàn đơn hàng khỏi CSDL
router.delete("/admin/delete/:orderId", orderController.adminDeleteOrder);
module.exports = router;
