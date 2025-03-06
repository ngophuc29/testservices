const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Thêm sản phẩm vào giỏ
router.post("/add", cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
router.put("/update", cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ
router.delete("/remove", cartController.removeFromCart);

// Lấy giỏ hàng của user theo userId
router.get("/:userId", cartController.getCart);

// Xóa sạch giỏ hàng của user
router.delete("/clear/:userId", cartController.clearCart);

// Kiểm tra giỏ hàng (so sánh số lượng với tồn kho)
router.get("/check/:userId", cartController.checkCart);

module.exports = router;
