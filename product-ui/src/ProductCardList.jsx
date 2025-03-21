import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PRODUCT_API_URL = "http://localhost:4004/api/products";
// Giả sử Cart Service của bạn có endpoint /api/cart/add
const CART_API_URL = "http://localhost:4003/api/cart/add";

// UserId giả dùng cho demo
const fakeUserId = "64e65e8d3d5e2b0c8a3e9f12";

export default function ProductCardList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Lấy danh sách sản phẩm từ API
    const fetchProducts = async () => {
        try {
            const res = await axios.get(PRODUCT_API_URL);
            // Giả sử dữ liệu trả về có dạng: { data: { data: [...] } }
            setProducts(res.data.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error.message);
        }
    };

    // Xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async (productId) => {
        try {
            const res = await axios.post(CART_API_URL, {
                userId: fakeUserId,
                productId,
                quantity: 1
            });
            console.log("Thêm vào giỏ hàng thành công", res.data);
            // Có thể hiển thị thông báo thành công cho người dùng tại đây
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng", error.response?.data || error.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Thanh điều hướng: tiêu đề và link xem giỏ hàng */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                <Link to="/cart" className="bg-green-500 text-white py-2 px-4 rounded">
                    Xem Giỏ Hàng
                </Link>
                <Link to="/order" className="bg-green-500 text-white py-2 px-4 rounded">
                    Xem Đơn Hàng
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product._id} className="bg-white shadow rounded overflow-hidden">
                        <img
                            src={product.image || "https://via.placeholder.com/150"}
                            alt={product.name}
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                                {product.description || "Mô tả sản phẩm"}
                            </p>
                            {product.price && (
                                <p className="text-red-500 font-bold mb-4">
                                    {product.price.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </p>
                            )}
                            <button
                                onClick={() => handleAddToCart(product._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
