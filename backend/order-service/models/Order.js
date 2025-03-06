const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
    total: { type: Number, required: true } // Tổng giá trị của sản phẩm (quantity * price)
});

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    items: [OrderItemSchema],
    totalProductPrice: { type: Number, required: true }, // Tổng giá trị sản phẩm
    shipping: {
        method: { type: String, required: true }, // Phương thức giao hàng
        fee: { type: Number, required: true }, // Phí vận chuyển
        status: { type: String, enum: ["processing", "shipped", "delivered"], default: "processing" },
        trackingNumber: { type: String, default: "" }
    },
    payment: {
        method: { type: String, required: true },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
    },
    finalTotal: { type: Number, required: true }, // Tổng tiền cuối cùng sau khi tính phí vận chuyển
    notes: {
        customerNote: { type: String, default: "" },
        sellerNote: { type: String, default: "" }
    },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
