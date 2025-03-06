import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CART_API_URL = "http://localhost:4003/api/cart";
const PRODUCT_API_URLGetInfo = "http://localhost:4004/api/product";

const fakeUserId = "user123";

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [products, setProducts] = useState({}); // Lưu thông tin sản phẩm theo productId
    const [warning, setWarning] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setError("");
            const res = await axios.get(`${CART_API_URL}/${fakeUserId}`);
            const cartData = res.data;
            setCart(cartData);

            if (cartData.items.length > 0) {
                await fetchProductDetails(cartData.items.map(item => item.productId));
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            alert(error.response?.data?.message || error.message);

            console.error("Lỗi khi tải giỏ hàng:", error.message);
        }
    };

    const fetchProductDetails = async (productIds) => {
        try {
            setError("");
            // Gọi API theo từng sản phẩm song song
            const responses = await Promise.all(
                productIds.map(id => axios.get(`${PRODUCT_API_URLGetInfo}/${id}`))
            );
            const productData = responses.reduce((acc, res) => {
                acc[res.data._id] = res.data;
                return acc;
            }, {});
            setProducts(productData);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            alert(error.response?.data?.message || error.message);

            console.error("Lỗi khi tải chi tiết sản phẩm:", error.message);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            setError("");
            const res = await axios.put(`${CART_API_URL}/update`, {
                userId: fakeUserId,
                productId,
                quantity: newQuantity,
            });
            setCart(res.data.cart);
            if (res.data.warning) {
                setWarning(res.data.warning);
            } else {
                setWarning("");
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            setError(errMsg);
            alert(errMsg);
            console.error("Lỗi khi cập nhật giỏ hàng:", error.message);
        }
    };

    const handleRemoveItem = async (productId) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?");
        if (!confirmDelete) return;

        try {
            setError("");
            const res = await axios.delete(`${CART_API_URL}/remove`, {
                data: { userId: fakeUserId, productId },
            });
            setCart(res.data.cart);
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            setError(errMsg);
            alert(errMsg);
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error.message);
        }
    };

    const handleClearCart = async () => {
        const confirmClear = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
        if (!confirmClear) return;

        try {
            setError("");
            const res = await axios.delete(`${CART_API_URL}/clear/${fakeUserId}`);
            setCart(res.data.cart);
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            setError(errMsg);
            alert(errMsg);
            console.error("Lỗi khi xóa giỏ hàng:", error.message);
        }
    };

    if (!cart) {
        return (
            <div className="container mx-auto p-4">
                <p>Đang tải giỏ hàng...</p>
                <Link to="/" className="text-blue-500 underline">Quay lại sản phẩm</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
                <Link to="/productlist" className="bg-blue-500 text-white py-2 px-4 rounded">
                    Quay lại sản phẩm
                </Link>
            </div>
            {/* Hiển thị thông báo lỗi nếu có */}
            {error && (
                <div className="bg-red-200 text-red-700 p-2 mb-4 rounded">
                    {error}
                </div>
            )}
            {/* Hiển thị cảnh báo nếu có */}
            {warning && (
                <div className="bg-yellow-200 text-yellow-800 p-2 mb-4 rounded">
                    {warning}
                </div>
            )}
            {cart.items.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <div>
                    <table className="min-w-full border mb-4">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2">Sản phẩm</th>
                                <th className="border px-4 py-2">Giá</th>
                                <th className="border px-4 py-2">Số lượng</th>
                                <th className="border px-4 py-2">Tổng</th>
                                <th className="border px-4 py-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map((item) => {
                                const product = products[item.productId];
                                return (
                                    <tr key={item.productId}>
                                        <td className="border px-4 py-2 flex items-center">
                                            <img
                                                src={product?.image || "https://via.placeholder.com/50"}
                                                alt={product?.name}
                                                className="w-12 h-12 mr-2"
                                                style={{ width: '30px' }}
                                            />
                                            <span>{product?.name || "Sản phẩm"}</span>
                                        </td>
                                        <td className="border px-4 py-2">
                                            {product?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || "N/A"}
                                        </td>
                                        <td className="border px-4 py-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                onChange={(e) =>
                                                    handleUpdateQuantity(item.productId, Number(e.target.value))
                                                }
                                                className="border p-1 w-16"
                                            />
                                        </td>
                                        <td className="border px-4 py-2">
                                            {(product?.price * item.quantity)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || "N/A"}
                                        </td>
                                        <td className="border px-4 py-2">
                                            <button
                                                onClick={() => handleRemoveItem(item.productId)}
                                                className="bg-red-500 text-white py-1 px-2 rounded"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button
                        onClick={handleClearCart}
                        className="bg-yellow-500 text-white py-2 px-4 rounded"
                    >
                        Xóa sạch giỏ hàng
                    </button>
                </div>
            )}
        </div>
    );
}
