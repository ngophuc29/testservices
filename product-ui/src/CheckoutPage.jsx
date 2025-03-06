import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ORDER_API_URL = "http://localhost:4005/api/orders/create";

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { items: selectedItems = [] } = location.state || {};

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
    });
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerNote, setCustomerNote] = useState("");

    const shippingFees = {
        standard: 30000,
        express: 50000,
    };

    const totalProductPrice = selectedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const shippingFee = shippingFees[shippingMethod] || 0;
    const finalTotal = totalProductPrice + shippingFee;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleOrderSubmit = async () => {
        if (
            !customerInfo.name.trim() ||
            !customerInfo.address.trim() ||
            !customerInfo.phone.trim() ||
            !customerInfo.email.trim()
        ) {
            alert("Vui lòng nhập đầy đủ thông tin khách hàng.");
            return;
        }

        const orderPayload = {
            userId: "user123",
            customer: {
                name: customerInfo.name,
                address: customerInfo.address,
                phone: customerInfo.phone,
                email: customerInfo.email
            },
            items: selectedItems.map((item) => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            totalProductPrice: totalProductPrice,
            shipping: {
                method: shippingMethod,
                fee: shippingFee,
                status: "processing",
                trackingNumber: ""
            },
            payment: {
                method: paymentMethod,
                status: "pending"
            },
            finalTotal: finalTotal,
            notes: {
                customerNote: customerNote,
                sellerNote: ""
            },
            status: "pending"
        };

        try {
            const response = await axios.post(ORDER_API_URL, orderPayload);
            alert("Đơn hàng đã được đặt thành công!");
            navigate("/order-success", { state: { order: response.data.order } });
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            alert("Lỗi khi đặt hàng: " + errMsg);
            console.error("Lỗi khi đặt hàng:", error.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h1>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Thông tin sản phẩm</h2>
                {selectedItems.length === 0 ? (
                    <p>Không có sản phẩm nào được chọn.</p>
                ) : (
                    <ul className="border p-4 rounded space-y-2">
                        {selectedItems.map((item) => (
                            <li key={item.productId} className="flex items-center space-x-4 border-b pb-2">
                                <img
                                    src={item.image || "https://via.placeholder.com/50"}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                    style={{ width: "40px", height: "40px" }}
                                />
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p>
                                        {item.quantity} x{" "}
                                        {item.price.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </p>
                                </div>
                                <p className="font-bold">
                                    {(item.price * item.quantity).toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Tên khách hàng"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="border p-2 w-full mb-2"
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ giao hàng"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="border p-2 w-full mb-2"
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="border p-2 w-full mb-2"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="border p-2 w-full mb-2"
                />
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="border p-2 w-full mb-2"
                >
                    <option value="cash">Thanh toán khi nhận hàng</option>
                    <option value="credit">Thẻ tín dụng</option>
                    <option value="bank">Chuyển khoản</option>
                </select>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Phương thức vận chuyển</h2>
                <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="border p-2 w-full mb-2"
                >
                    <option value="standard">Giao hàng tiêu chuẩn (30.000 VND)</option>
                    <option value="express">Giao hàng nhanh (50.000 VND)</option>
                </select>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold">Ghi chú đơn hàng</h2>
                <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Ghi chú đơn hàng (khách hàng)"
                    className="border p-2 w-full mb-2"
                ></textarea>
            </div>

            <div className="border p-4 rounded mb-4">
                <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
                <p>
                    Tổng tiền sản phẩm:{" "}
                    <strong>
                        {totalProductPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </strong>
                </p>
                <p>
                    Phí vận chuyển:{" "}
                    <strong>
                        {shippingFee.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </strong>
                </p>
                <p className="text-lg font-bold">
                    Tổng thanh toán:{" "}
                    <strong>
                        {finalTotal.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </strong>
                </p>
            </div>

            <button onClick={handleOrderSubmit} className="bg-green-500 text-white py-2 px-4 rounded w-full">
                Xác nhận đặt hàng
            </button>
        </div>
    );
}
