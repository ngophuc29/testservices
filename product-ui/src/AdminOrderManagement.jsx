import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Spinner, Button, Alert } from "react-bootstrap";

const ORDER_API_URL = "http://localhost:4005/api/orders";

export default function AdminOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // Lấy danh sách đơn hàng (Admin)
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(ORDER_API_URL);
                setOrders(response.data);
            } catch (err) {
                setError("Lỗi khi lấy danh sách đơn hàng");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Hàm cập nhật trạng thái đơn hàng (Admin)
    const handleChangeStatus = async (orderId, newStatus) => {
        try {
            setActionLoading(true);
            await axios.put(`${ORDER_API_URL}/${orderId}`, { status: newStatus });
            const response = await axios.get(ORDER_API_URL);
            setOrders(response.data);
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái đơn hàng");
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // Hàm chỉnh sửa đơn hàng (ví dụ mở modal, chuyển trang,...)
    const handleEdit = (orderId) => {
        alert(`Chỉnh sửa đơn hàng ${orderId}`);
    };

    // Hàm hủy đơn hàng (Admin sử dụng controller riêng)
    // Cho phép hủy khi đơn hàng ở trạng thái "pending", "confirmed" hoặc "completed"
    const handleAdminCancelOrder = async (orderId, currentStatus) => {
        if (
            !(currentStatus === "pending" || currentStatus === "confirmed" || currentStatus === "completed")
        ) {
            alert("Chỉ đơn hàng chưa giao (pending, confirmed) hoặc đã hoàn thành (completed) mới có thể hủy.");
            return;
        }
        if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
            try {
                setActionLoading(true);
                await axios.post(`${ORDER_API_URL}/admin/cancel/${orderId}`);
                alert("Đơn hàng đã được hủy bởi Admin");
                const response = await axios.get(ORDER_API_URL);
                setOrders(response.data);
            } catch (err) {
                alert("Lỗi khi hủy đơn hàng");
                console.error(err);
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Hàm xóa đơn hàng (Admin)
    // Chỉ cho phép xóa nếu đơn hàng có trạng thái "cancelled"
    const handleDelete = async (orderId, currentStatus) => {
        if (currentStatus !== "cancelled") {
            alert("Đơn hàng phải có trạng thái 'cancelled' mới được xóa");
            return;
        }
        if (
            window.confirm(
                "Bạn có chắc muốn xóa đơn hàng này không? Thao tác này sẽ xóa hoàn toàn đơn hàng."
            )
        ) {
            try {
                setActionLoading(true);
                await axios.delete(`${ORDER_API_URL}/admin/delete/${orderId}`);
                alert("Đơn hàng đã được xóa bởi Admin");
                const response = await axios.get(ORDER_API_URL);
                setOrders(response.data);
            } catch (err) {
                alert("Lỗi khi xóa đơn hàng");
                console.error(err);
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <Container className="text-center p-4">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="p-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="p-4">
            <h2 className="mb-4">Quản lý đơn hàng (Admin)</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái hiện tại</th>
                        <th>Ngày tạo</th>
                        <th>Cập nhật trạng thái</th>
                        <th>Chỉnh sửa</th>
                        <th>Hủy</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.customer.name}</td>
                            <td>
                                {order.finalTotal.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </td>
                            <td>{order.status}</td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                            <td>
                                {order.status === "pending" && (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleChangeStatus(order._id, "confirmed")}
                                        disabled={actionLoading}
                                    >
                                        Xác nhận đơn hàng
                                    </button>
                                )}
                                {order.status === "confirmed" && (
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleChangeStatus(order._id, "completed")}
                                        disabled={actionLoading}
                                    >
                                        Hoàn thành đơn hàng
                                    </button>
                                )}
                            </td>
                            <td>
                                {(order.status === "pending" || order.status === "confirmed") ? (
                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => handleEdit(order._id)}
                                        disabled={actionLoading}
                                    >
                                        Chỉnh sửa
                                    </button>
                                ) : (
                                    <button className="btn btn-info btn-sm" disabled>
                                        Chỉnh sửa
                                    </button>
                                )}
                            </td>
                            <td>
                                {(order.status === "pending" ||
                                    order.status === "confirmed" ||
                                    order.status === "completed") ? (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleAdminCancelOrder(order._id, order.status)}
                                        disabled={actionLoading}
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button className="btn btn-danger btn-sm" disabled>
                                        Hủy
                                    </button>
                                )}
                            </td>
                            <td>
                                {order.status === "cancelled" ? (
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(order._id, order.status)}
                                        disabled={actionLoading}
                                    >
                                        Xóa
                                    </button>
                                ) : (
                                    <button className="btn btn-outline-danger btn-sm" disabled>
                                        Xóa
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}
