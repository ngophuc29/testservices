const Product = require("../../models/ProductModel");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Lấy toàn bộ sản phẩm
    // console.log("🛒 Dữ liệu lấy từ DB:", products); // Debug
    res.json({ data: products });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = getProducts;
