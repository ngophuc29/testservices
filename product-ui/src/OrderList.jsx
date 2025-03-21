import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function OrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(false);
    const userId = "64e65e8d3d5e2b0c8a3e9f12"; // Thay bằng userId thực tế từ localStorage hoặc context

    // Lấy danh sách đơn hàng của user
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`http://localhost:4005/api/orders/user/${userId}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [userId]);

    // Hàm hủy đơn hàng (chỉ khi đơn hàng chưa được xác nhận)
    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
            try {
                setCancelLoading(true);
                await axios.post(`http://localhost:4005/api/orders/cancel/${orderId}`);
                alert("Đơn hàng đã được hủy thành công");
                // Cập nhật lại danh sách đơn hàng sau khi hủy
                const response = await axios.get(`http://localhost:4005/api/orders/user/${userId}`);
                setOrders(response.data);
            } catch (error) {
                const errMsg = error.response?.data?.message || error.message;
                alert("Lỗi khi hủy đơn hàng: " + errMsg);
                console.error(error);
            } finally {
                setCancelLoading(false);
            }
        }
    };

    return (
        <Container style={{ marginTop: "20px", maxWidth: "900px" }}>
            <Link to="/productlist" className="bg-blue-500 text-white py-2 px-4 rounded">
                Quay lại sản phẩm
            </Link>
            <h2 style={{ marginBottom: "20px", textAlign: "center", color: "#333" }}>Đơn hàng của bạn</h2>
            {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spinner animation="border" />
                </div>
            ) : orders.length === 0 ? (
                <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>Chưa có đơn hàng nào.</p>
            ) : (
                <Table
                    striped
                    bordered
                    hover
                    style={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <thead style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                        <tr>
                            <th>#</th>
                            <th>Mã đơn hàng</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày đặt</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order._id} style={{ textAlign: "center" }}>
                                <td>{index + 1}</td>
                                <td style={{ fontWeight: "bold", color: "#333" }}>{order._id}</td>
                                <td style={{ textAlign: "left", padding: "10px" }}>
                                    {order.items.map((item) => (
                                        <div key={item.productId} style={{ padding: "5px 0" }}>
                                            <span style={{ fontWeight: "bold" }}>{item.name}</span> (x{item.quantity})
                                        </div>
                                    ))}
                                </td>
                                <td style={{ fontWeight: "bold", color: "#d9534f" }}>
                                    {order.finalTotal.toLocaleString()} VND
                                </td>
                                <td>
                                    <Badge
                                        style={{
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            borderRadius: "5px",
                                        }}
                                        bg={order.status === "pending" ? "warning" : "success"}
                                    >
                                        {order.status}
                                    </Badge>
                                </td>
                                <td style={{ fontSize: "14px", color: "#555" }}>
                                    {new Date(order.createdAt).toLocaleString()}
                                </td>
                                <td>
                                    {/* Hiển thị nút "Hủy" chỉ khi đơn hàng có trạng thái "pending" */}
                                    {order.status === "pending" ? (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order._id)}
                                            disabled={cancelLoading}
                                        >
                                            {cancelLoading ? "Đang hủy..." : "Hủy"}
                                        </Button>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}
