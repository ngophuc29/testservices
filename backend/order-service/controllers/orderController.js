const Order = require("../models/Order");
const axios = require("axios");

const CART_API_URL = "http://localhost:4003/api/cart";
const INVENTORY_API = "http://localhost:4000/api/inventory";
const PRODUCT_SERVICE_URLImport = "http://localhost:4004/api/product";
// 📌 Tạo đơn hàng
exports.createOrder = async (req, res) => {
    try {
        const { userId, customer, items, shipping, payment, finalTotal, notes } = req.body;

        if (!userId || !customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        // Lấy danh sách sản phẩm từ Inventory
        const productIds = items.map(item => item.productId);
        const { data: inventoryData } = await axios.post(`${INVENTORY_API}/bulk`, { productIds });

        if (!inventoryData || inventoryData.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy sản phẩm trong kho" });
        }

        // Kiểm tra tồn kho
        for (let item of items) {
            const invItem = inventoryData.find(i => i.productId.toString() === item.productId.toString());
            if (!invItem || invItem.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ hàng` });
            }
        }

        // Xác nhận trừ số lượng trong kho
        const confirmRes = await axios.post(`${INVENTORY_API}/confirm`, { items });
        if (!confirmRes.data.success) {
            return res.status(400).json({ message: "Xác nhận tồn kho thất bại" });
        }

        // Tạo đơn hàng
        const order = new Order({
            userId,
            customer,
            items,
            shipping,
            payment,
            finalTotal,
            notes
        });
        await order.save();

        // Xóa giỏ hàng của user sau khi đặt hàng thành công
        await axios.delete(`${CART_API_URL}/clear/${userId}`);

        res.json({ message: "Đơn hàng đã được tạo", order });
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("userId");
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy danh sách đơn hàng của user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Lấy tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("userId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Cập nhật đơn hàng (Admin)
// Cho phép cập nhật các trường như status, shipping, payment, sellerNote,...
exports.updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body; // Ví dụ: { status: "completed", shipping: { ... }, payment: { ... } }
        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        res.json({ message: "Đơn hàng đã được cập nhật", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Cho phép hủy nếu đơn hàng chưa được xác nhận (status là "pending")
        if (order.status !== "pending") {
            return res.status(400).json({ message: "Chỉ đơn hàng chưa xác nhận mới có thể hủy" });
        }

        // Cập nhật trạng thái đơn hàng thành "cancelled"
        order.status = "cancelled";
        await order.save();

        // Gọi API Inventory để hoàn trả số lượng hàng về kho
        await axios.post(`${INVENTORY_API}/release`, { items: order.items });

        res.json({ message: "Đơn hàng đã bị hủy", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
 
// 📌 Hủy đơn hàng bởi Admin (không ràng buộc trạng thái)
// exports.adminCancelOrder = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

//         // Cập nhật trạng thái đơn hàng thành "cancelled"
//         order.status = "cancelled";
//         await order.save();

//         // Duyệt qua từng mặt hàng và restore stock trong Inventory Service
//         for (const item of order.items) {
//             try {
//                 // Gọi API restore để cộng lại số lượng vào tồn kho
//                 await axios.put(`${INVENTORY_API}/restore`, {
//                     productId: item.productId.toString(),
//                     quantity: item.quantity
//                 });
//                 // Sau đó, đồng bộ lại stock ở Product Service
//                 const invRes = await axios.get(`${INVENTORY_API}/product/${item.productId.toString()}`);
//                 if (invRes.data) {
//                     await axios.put(`${PRODUCT_SERVICE_URLImport}/${item.productId.toString()}`, {
//                         stock: invRes.data.quantity
//                     });
//                 }
//             } catch (err) {
//                 console.error(`Lỗi khi restore stock cho sản phẩm ${item.productId.toString()}:`, err.response?.data || err.message);
//             }
//         }

//         res.json({ message: "Đơn hàng đã được hủy bởi Admin và tồn kho đã được khôi phục", order });
//     } catch (error) {
//         console.error("Lỗi trong adminCancelOrder:", error.message);
//         res.status(500).json({ message: "Lỗi server", error: error.message });
//     }
// };

exports.adminCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Cập nhật trạng thái đơn hàng thành "cancelled"
        order.status = "cancelled";
        await order.save();

        // Duyệt qua từng mặt hàng và restore stock cho từng sản phẩm
        for (const item of order.items) {
            try {
                // Gọi API restore của Inventory Service để cộng thêm số lượng
                await axios.put(`${INVENTORY_API}/restore`, {
                    productId: item.productId.toString(),
                    quantity: item.quantity
                });
                // Sau đó, lấy dữ liệu mới từ Inventory qua endpoint GET /product/:productId
                const invRes = await axios.get(`${INVENTORY_API}/product/${item.productId.toString()}`);
                if (invRes.data) {
                    // Cập nhật lại stock trong Product Service dựa trên số liệu mới từ Inventory
                    await axios.put(`${PRODUCT_SERVICE_URLImport}/${item.productId.toString()}`, {
                        stock: invRes.data.quantity
                    });
                }
            } catch (err) {
                console.error(
                    `Lỗi khi restore stock cho sản phẩm ${item.productId.toString()}:`,
                    err.response?.data || err.message
                );
            }
        }

        res.json({ message: "Đơn hàng đã được hủy bởi Admin; tồn kho và Product Service đã được restore", order });
    } catch (error) {
        console.error("Lỗi trong adminCancelOrder:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};








// 📌 Xóa đơn hàng bởi Admin (AdminDeleteOrder)
// Lưu ý: Trước khi xóa, nếu đơn hàng chưa bị hủy, bạn có thể gọi API Inventory để hoàn trả hàng về kho.
exports.adminDeleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

        // Nếu đơn hàng chưa bị hủy, thực hiện hoàn trả hàng về kho
        if (order.status !== "cancelled") {
            try {
                const releaseRes = await axios.post(`${INVENTORY_API}/release`, { items: order.items });
                if (!releaseRes.data.success) {
                    return res.status(400).json({ message: "Hoàn trả hàng về kho thất bại" });
                }
            } catch (err) {
                console.error("Lỗi khi gọi API release:", err.message);
                return res.status(500).json({ message: "Lỗi khi hoàn trả hàng về kho", error: err.message });
            }
        }

        // Xóa đơn hàng khỏi CSDL
        await Order.findByIdAndDelete(orderId);
        res.json({ message: "Đơn hàng đã được xóa bởi Admin" });
    } catch (error) {
        console.error("Lỗi trong adminDeleteOrder:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

