const axios = require("axios");

// URL của Product Service (đổi nếu cần)
const PRODUCT_SERVICE_URL = "http://localhost:4004/api/products";
const PRODUCT_SERVICE_URLImport = "http://localhost:4004/api/product";

const LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo tồn kho thấp

// 1️⃣ API lấy toàn bộ sản phẩm từ Product Service (để kiểm tra stock)
exports.getAllProducts = async (req, res) => {
    try {
        const response = await axios.get(PRODUCT_SERVICE_URL);
        const products = response.data.data;

        if (!Array.isArray(products)) {
            return res.status(500).json({
                message: "Dữ liệu không hợp lệ từ Product Service",
                receivedData: response.data
            });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: error.message });
    }
};

// 2️⃣ API lấy danh sách tồn kho từ Product Service
exports.getInventory = async (req, res) => {
    try {
        const response = await axios.get(PRODUCT_SERVICE_URL);
        const products = response.data.data;

        const inventoryWithWarning = products.map(product => ({
            productId: product._id,
            stock: product.stock,
            lowStock: product.stock <= LOW_STOCK_THRESHOLD
        }));

        res.json(inventoryWithWarning);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy tồn kho", error: error.message });
    }
};

// 3️⃣ API lấy stock theo danh sách productId
exports.getStockByProductIds = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ message: "Danh sách productIds không hợp lệ" });
        }

        const response = await axios.get(PRODUCT_SERVICE_URL);
        const products = response.data.data.filter(product => productIds.includes(product._id));

        res.json(products.map(p => ({ productId: p._id, stock: p.stock })));
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy tồn kho theo danh sách", error: error.message });
    }
};

// 4️⃣ API kiểm tra sản phẩm còn hàng không (truy vấn Product Service)
exports.getProductStock = async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE_URLImport}/${req.params.productId}`);
        const product = response.data;

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.json({ inStock: product.stock > 0, stock: product.stock });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi kiểm tra tồn kho", error: error.message });
    }
};

// 5️⃣ API thống kê tổng số lượng hàng tồn kho từ Product Service
exports.getStockStats = async (req, res) => {
    try {
        const response = await axios.get(PRODUCT_SERVICE_URL);
        const products = response.data.data;

        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

        res.json({ totalStock });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thống kê tồn kho", error: error.message });
    }
};
// 6️⃣ API nhập hàng - tăng stock trong Product Service
exports.importStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity <= 0) {
            return res.status(400).json({ message: "❌ Dữ liệu không hợp lệ" });
        }

        console.log("📌 Nhập hàng cho Product ID:", productId);

        // Lấy thông tin sản phẩm từ Product Service
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URLImport}/${productId}`);
        console.log("🔍 Dữ liệu sản phẩm nhận được:", productResponse.data);

        const product = productResponse.data;

        if (!product || product.stock == null) {
            return res.status(404).json({ message: "❌ Sản phẩm không tồn tại hoặc thiếu stock" });
        }

        // Kiểm tra kiểu dữ liệu `stock`
        if (typeof product.stock !== "number") {
            console.error("🚨 Lỗi: stock không phải là số", product);
            return res.status(500).json({ message: "❌ stock không hợp lệ", stockType: typeof product.stock });
        }

        // Tăng stock
        const newStock = product.stock + quantity;
        console.log("📌 Stock mới:", newStock);

        // Cập nhật stock trong Product Service
        const updateResponse = await axios.put(`${PRODUCT_SERVICE_URLImport}/${productId}`, {
            stock: newStock
        });

        console.log("🔄 Kết quả cập nhật:", updateResponse.data);

        if (!updateResponse.data.data || updateResponse.data.data.stock == null) {
            return res.status(500).json({ message: "❌ Không thể cập nhật stock" });
        }

        res.status(200).json({
            message: "✅ Nhập hàng thành công!",
            newStock: updateResponse.data.data.stock
        });
    } catch (error) {
        console.error("🚨 Lỗi nhập hàng:", error.response?.data || error.message);
        res.status(500).json({
            message: "❌ Lỗi server khi nhập hàng",
            error: error.message
        });
    }
};


