const Order = require("../models/Order");
const axios = require("axios");

// Địa chỉ Cart Service và Inventory Service
const CART_API_URL = "http://localhost:4003/api/cart";
const INVENTORY_API = "http://localhost:4000/api/inventory";

// Tạo đơn hàng từ giỏ hàng của user
exports.createOrder = async (req, res) => {
    try {
        const {
            userId,
            customer,
            items,
            totalProductPrice,
            shipping,
            payment,
            finalTotal,
            notes,
            status
        } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "UserId không hợp lệ" });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống" });
        }

        // Lấy danh sách productIds từ items
        const productIds = items.map(item => item.productId);
        const bulkRes = await axios.post(`${INVENTORY_API}/bulk`, { productIds });
        const inventoryData = bulkRes.data;

        // Kiểm tra tồn kho cho từng sản phẩm
        for (let item of items) {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            if (!invItem || invItem.stock < item.quantity) {
                return res.status(400).json({ message: `Không đủ hàng cho sản phẩm ${item.productId}` });
            }
        }

        // Gọi Inventory API confirm để trừ số lượng hàng
        const confirmRes = await axios.post(`${INVENTORY_API}/confirm`, { items });
        if (!confirmRes.data.success) {
            return res.status(400).json({ message: "Xác nhận đơn hàng thất bại do lỗi tồn kho" });
        }

        // Xây dựng lại items với trường name bắt buộc
        const orderItems = items.map(item => {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            return {
                productId: item.productId,
                name: invItem?.name || item.name, // Sử dụng tên từ Inventory API hoặc từ item nếu có
                quantity: item.quantity,
                price: invItem?.price || item.price,
                total: (invItem?.price || item.price) * item.quantity
            };
        });

        // Tạo đơn hàng với đầy đủ thông tin
        const order = new Order({
            userId,
            customer,
            items: orderItems,
            totalProductPrice,
            shipping,
            payment,
            finalTotal,
            notes,
            status
        });
        await order.save();

        // Xóa giỏ hàng sau khi đặt hàng thành công
        await axios.delete(`${CART_API_URL}/clear/${userId}`);

        res.json({ message: "Đơn hàng đã được tạo thành công", order });
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
    }
};



// Lấy đơn hàng theo id
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: error.message });
    }
};

// Lấy đơn hàng của user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy đơn hàng của user", error: error.message });
    }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        if (order.status !== "confirmed") {
            return res.status(400).json({ message: "Chỉ đơn hàng đã được xác nhận mới có thể hủy" });
        }
        // Cập nhật trạng thái đơn hàng
        order.status = "cancelled";
        await order.save();
        // Gọi Inventory API release để hoàn lại số lượng hàng (giả sử /release nhận payload { items: [...] })
        await axios.post(`${INVENTORY_API}/release`, { items: order.items });
        res.json({ message: "Đơn hàng đã được hủy", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi hủy đơn hàng", error: error.message });
    }
};
