import React, { useState, useEffect } from "react";
import axios from "axios";

const INVENTORY_API_URL = "http://localhost:4000/api/inventory"; // API tồn kho
const IMPORT_API_URL = "http://localhost:4000/api/inventory/import"; // API nhập hàng
const SYNC_API_URL = "http://localhost:4000/api/inventory/syncInventory"; // API đồng bộ

export default function InventoryUI() {
    const [inventory, setInventory] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInventory();
        
    }, []);

    // 🟢 Lấy danh sách tồn kho từ Inventory Service
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(INVENTORY_API_URL);
            setInventory(res.data);
            console.log("data lay dc tu inventory : ",res.data);
            
        } catch (err) {
            setError("Không thể tải danh sách tồn kho");
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
        const item = inventory.find((p) => p.productId === productId);
        setStockInfo(item ? { inStock: item.stock > 0, quantity: item.stock } : null);
    };

    // 🟢 Nhập hàng
    const handleImportStock = async () => {
        if (!productId || quantity <= 0) {
            setError("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ");
            return;
        }

        try {
            setLoading(true);
            await axios.post(IMPORT_API_URL, { productId, quantity });
            fetchInventory(); // Cập nhật danh sách tồn kho
        } catch (err) {
            setError("Lỗi khi nhập hàng");
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Đồng bộ dữ liệu Inventory từ Product Service
    const syncInventory = async () => {
        try {
            setLoading(true);
            await axios.post(SYNC_API_URL);
            fetchInventory();
        } catch (err) {
            setError("Lỗi khi đồng bộ Inventory");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Quản lý Kho</h1>

            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-blue-500">Đang tải...</p>}

            {/* 🔄 Nút đồng bộ */}
            <button onClick={syncInventory} className="bg-yellow-500 text-white p-2 w-full mb-4">
                Đồng bộ Inventory 🔄
            </button>

            {/* Dropdown chọn sản phẩm */}
            <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="border p-2 w-full mb-2"
            >
                <option value="">Chọn sản phẩm</option>
                {inventory.map((item) => (
                    <option key={item.productId} value={item.productId}>
                        {item.productId} - {item.name}- (Tồn kho: {item.stock})
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

            {/* 🔥 Danh sách tồn kho */}
            <h2 className="text-xl font-bold mt-4">Danh sách tồn kho</h2>
            <ul className="border p-2">
                {inventory.map((item) => (
                    <li key={item.productId} className="border-b p-1">
                        <span className="font-bold">{item.name}</span> - {item.stock} sản phẩm trong kho
                        {item.stock < 10 && <span className="text-red-500 ml-2">⚠ Cảnh báo: Tồn kho thấp</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
