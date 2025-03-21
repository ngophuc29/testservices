const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");

// ✅ API lấy danh sách sản phẩm từ Product Service
router.get("/products", inventoryController.getAllProducts);

// ✅ API lấy danh sách tồn kho từ Product Service
router.get("/", inventoryController.getInventory);

// ✅ API kiểm tra tồn kho theo productId
router.get("/:productId", inventoryController.getProductStock);

// ✅ API lấy stock theo danh sách productIds
router.post("/bulk", inventoryController.getStockByProductIds);

// ✅ API thống kê tổng tồn kho
router.get("/stats", inventoryController.getStockStats);
// ✅ API nhập hàng vào kho
router.post("/import", inventoryController.importStock);

// ✅ **API đồng bộ Inventory với Product Service**
router.post("/syncInventory", inventoryController.syncInventory);


// Route đặt chỗ sản phẩm
router.post("/reserve", inventoryController.reserveStock);

// Route giải phóng sản phẩm
router.post("/release", inventoryController.releaseStock);

// Thêm route cho confirm đơn hàng
router.post("/confirm", inventoryController.confirmOrder);


router.put("/restore", inventoryController.restoreStock);

router.get("/product/:productId", inventoryController.getProduct);
module.exports = router;
