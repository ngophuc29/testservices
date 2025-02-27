import React, { useState, useEffect } from "react";
import axios from "axios";

const PRODUCT_API_URL = "http://localhost:4000/api/inventory/products"; // API lấy sản phẩm
const IMPORT_API_URL = "http://localhost:4000/api/inventory/import"; // API nhập hàng

export default function InventoryUI() {
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    // 🟢 Lấy danh sách sản phẩm (gồm cả stock)
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(PRODUCT_API_URL);
            setProducts(res.data);
        } catch (err) {
            setError("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    // 🟠 Kiểm tra tồn kho
    const checkStock = () => {
        if (!productId) {
            setError("Vui lòng chọn sản phẩm");
            return;
        }
        const product = products.find((p) => p._id === productId);
        setStockInfo(product ? { inStock: product.stock > 0, quantity: product.stock } : null);
    };

    // 🟢 Nhập hàng (tăng stock)
    const handleImportStock = async () => {
        if (!productId || quantity <= 0) {
            setError("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ");
            return;
        }

        try {
            setLoading(true);
            await axios.post(IMPORT_API_URL, { productId, quantity });
            fetchProducts(); // Cập nhật danh sách sản phẩm sau khi nhập hàng
        } catch (err) {
            setError("Lỗi khi nhập hàng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Quản lý Kho</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-blue-500">Đang tải...</p>}

            {/* Dropdown chọn sản phẩm */}
            <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="border p-2 w-full mb-2"
            >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                    <option key={product._id} value={product._id}>
                        {product.name}
                    </option>
                ))}
            </select>

            <input
                type="number"
                placeholder="Nhập số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border p-2 w-full mb-2"
            />

            <div className="flex flex-wrap gap-2">
                <button onClick={checkStock} className="bg-blue-500 text-white p-2 w-1/2">Kiểm tra tồn kho</button>
                <button onClick={handleImportStock} className="bg-green-500 text-white p-2 w-1/2">Nhập hàng</button>
            </div>

            {stockInfo && (
                <div className="mt-4 p-2 border">
                    <p><strong>Tồn kho:</strong> {stockInfo.quantity} sản phẩm</p>
                    {!stockInfo.inStock && <p className="text-red-500">⚠ Hết hàng</p>}
                </div>
            )}

            {/* 🔥 Danh sách toàn bộ sản phẩm */}
            <h2 className="text-xl font-bold mt-4">Danh sách sản phẩm</h2>
            <ul className="border p-2">
                {products.map((product) => (
                    <li key={product._id} className="border-b p-1">
                        <span className="font-bold">{product.name}</span> - {product.stock} sản phẩm trong kho
                        {product.stock < 10 && <span className="text-red-500 ml-2">⚠ Cảnh báo: Tồn kho thấp</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
