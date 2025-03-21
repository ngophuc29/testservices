import React, { useState, useEffect } from "react";
import axios from "axios";

const ORDER_API_URL = "http://localhost:4005/api/orders";

// Giả sử userId đã có (đảm bảo dùng ObjectId hợp lệ, ví dụ: "64e65e8d3d5e2b0c8a3e9f12")
const FAKE_USER_ID = "64e65e8d3d5e2b0c8a3e9f12";

export default function OrderDashboard() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Lấy danh sách đơn hàng của user
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${ORDER_API_URL}/user/${FAKE_USER_ID}`);
                setOrders(response.data);
            } catch (err) {
                setError("Không thể lấy danh sách đơn hàng");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Xem chi tiết đơn hàng
    const handleViewDetails = async (orderId) => {
        try {
            const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
            setSelectedOrder(response.data);
        } catch (err) {
            alert("Lỗi khi lấy chi tiết đơn hàng");
            console.error(err);
        }
    };

    // Hủy đơn hàng
    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
            try {
                await axios.post(`${ORDER_API_URL}/cancel/${orderId}`);
                alert("Đơn hàng đã được hủy thành công");
                // Cập nhật lại danh sách đơn hàng sau khi hủy
                const response = await axios.get(`${ORDER_API_URL}/user/${FAKE_USER_ID}`);
                setOrders(response.data);
            } catch (err) {
                const errMsg = err.response?.data?.message || err.message;
                alert("Lỗi khi hủy đơn hàng: " + errMsg);
                console.error(err);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Danh sách đơn hàng của bạn</h1>

            {loading ? (
                <p>Đang tải...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : orders.length === 0 ? (
                <p>Không có đơn hàng nào.</p>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Mã đơn</th>
                            <th className="border px-4 py-2">Trạng thái</th>
                            <th className="border px-4 py-2">Tổng tiền</th>
                            <th className="border px-4 py-2">Ngày tạo</th>
                            <th className="border px-4 py-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="border px-4 py-2">{order._id}</td>
                                <td className="border px-4 py-2">{order.status}</td>
                                <td className="border px-4 py-2">
                                    {order.finalTotal.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(order.createdAt).toLocaleString()}
                                </td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleViewDetails(order._id)}
                                        className="bg-blue-500 text-white px-2 py-1 mr-2"
                                    >
                                        Xem chi tiết
                                    </button>
                                    {/* Chỉ cho phép hủy nếu trạng thái là "confirmed" */}
                                    {order.status === "confirmed" && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="bg-red-500 text-white px-2 py-1"
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Hiển thị chi tiết đơn hàng nếu được chọn */}
            {selectedOrder && (
                <div className="mt-8 border p-4">
                    <h2 className="text-xl font-bold mb-2">Chi tiết đơn hàng</h2>
                    <p>
                        <strong>Mã đơn:</strong> {selectedOrder._id}
                    </p>
                    <p>
                        <strong>Trạng thái:</strong> {selectedOrder.status}
                    </p>
                    <p>
                        <strong>Tổng tiền:</strong>{" "}
                        {selectedOrder.finalTotal.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </p>
                    <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <h3 className="mt-4 font-semibold">Thông tin khách hàng</h3>
                    <p>
                        <strong>Tên:</strong> {selectedOrder.customer.name}
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong> {selectedOrder.customer.address}
                    </p>
                    <p>
                        <strong>SĐT:</strong> {selectedOrder.customer.phone}
                    </p>
                    <p>
                        <strong>Email:</strong> {selectedOrder.customer.email}
                    </p>
                    <h3 className="mt-4 font-semibold">Sản phẩm</h3>
                    <ul>
                        {selectedOrder.items.map((item) => (
                            <li key={item.productId}>
                                {item.name} - {item.quantity} x{" "}
                                {item.price.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="bg-gray-500 text-white px-2 py-1 mt-4"
                    >
                        Đóng
                    </button>
                </div>
            )}
        </div>
    );
}
