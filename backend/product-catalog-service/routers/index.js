// routers/index.js
const express = require("express");
const router = express.Router();

const createProduct = require("../controller/createProduct");
const getProductNew = require("../controller/filterProduct/getProductNew");
const getProductBrand = require("../controller/filterProduct/getProductBrand");
const getProductById = require("../controller/getProductById");
const updateProduct = require("../controller/updateProduct");
const deleteProduct = require("../controller/deleteProduct");
const addReview = require("../controller/addReview");
const getAllProducts = require("../controller/getAllProducts");
const uploadImage = require("../controller/uploadImage");
// Route tạo sản phẩm
router.post("/create-product", createProduct);
// Route lấy sản phẩm mới
router.get("/products-new", getProductNew);
// Route lấy sản phẩm theo thương hiệu
router.get("/products-brand/:brand", getProductBrand);
// Route lấy chi tiết sản phẩm theo ID
router.get("/product/:id", getProductById);
// Route cập nhật sản phẩm theo ID
router.put("/product/:id", updateProduct);
// Route xóa sản phẩm theo ID
router.delete("/product/:id", deleteProduct);
// Route thêm đánh giá cho sản phẩm theo ID
router.post("/product/:id/review", addReview);
// Route lấy danh sách tất cả sản phẩm
router.get("/products", getAllProducts);

//route dùng để upload ảnh sản phẩm 
router.post("/productsImage", uploadImage);


module.exports = router;
