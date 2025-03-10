import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function OrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = "user123"; // Thay bằng userId thực tế từ localStorage hoặc context

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
    }, []);

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
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}
