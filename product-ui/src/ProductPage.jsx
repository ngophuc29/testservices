import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Form, Button, Spinner, Alert, Image } from "react-bootstrap";

const API_BASE = "http://localhost:4004/api"; // API Backend
const CLOUDINARY_UPLOAD_API = "http://localhost:4004/api/productsImage"; // API Upload ảnh

function App() {
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [filters, setFilters] = useState({
        name: "",
        price: "",
        brand: "",
        category: "",
        color: "",
    });

    // Khởi tạo newProduct, trong đó details và color là chuỗi nhập (sẽ chuyển thành mảng khi submit)
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        details: "", // Nhập nhiều dòng, mỗi dòng là 1 thông số
        brand: "",
        category: "",
        price: "",
        discount: 0,
        color: "", // Nhập các màu, cách nhau bởi dấu phẩy (ví dụ: "Red, Blue, Green")
        new: false,
        stock: 0,
        rating: 0,
        reviews: 0,
        image: null, // URL ảnh sau khi upload
    });

    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);

    // Lọc sản phẩm theo filters
    useEffect(() => {
        let filteredProducts = allProducts.filter((product) => {
            return (
                (!filters.name ||
                    product.name.toLowerCase().includes(filters.name.toLowerCase())) &&
                (!filters.brand ||
                    product.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
                (!filters.category ||
                    product.category.toLowerCase().includes(filters.category.toLowerCase())) &&
                (!filters.color ||
                    (Array.isArray(product.color)
                        ? product.color.join(", ").toLowerCase().includes(filters.color.toLowerCase())
                        : product.color.toLowerCase().includes(filters.color.toLowerCase()))) &&
                (!filters.price || product.price <= Number(filters.price))
            );
        });
        setProducts(filteredProducts);
    }, [filters, allProducts]);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get(`${API_BASE}/products-new`)
            .then((res) => {
                setAllProducts(res.data.data || []);
                setProducts(res.data.data || []);
            })
            .catch(() => setError("Lỗi khi lấy sản phẩm!"))
            .finally(() => setLoading(false));
    };

    // Xử lý thay đổi input trong form thêm/sửa sản phẩm
    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (!file) return;
            // Hiển thị ảnh preview
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            // Chuyển file sang base64
            const base64 = await convertToBase64(file);
            setImageBase64(base64);
        } else if (type === "checkbox") {
            setNewProduct({ ...newProduct, [name]: checked });
        } else {
            setNewProduct({ ...newProduct, [name]: value });
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // Upload ảnh lên Cloudinary
    const uploadToCloudinary = async (base64) => {
        setUploading(true);
        try {
            const response = await axios.post(CLOUDINARY_UPLOAD_API, { image: base64 });
            setNewProduct({ ...newProduct, image: response.data.url });
            alert("Upload ảnh thành công!");
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            alert("Lỗi khi upload ảnh!");
        } finally {
            setUploading(false);
        }
    };

    // Thêm hoặc cập nhật sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = newProduct.image;
        if (imageBase64) {
            try {
                const response = await axios.post(CLOUDINARY_UPLOAD_API, { image: imageBase64 });
                imageUrl = response.data.url;
            } catch (error) {
                alert("Lỗi khi upload ảnh!");
                setUploading(false);
                return;
            }
        }
        // Chuyển đổi details từ chuỗi thành mảng (tách theo dòng mới) và color thành mảng (tách theo dấu phẩy)
        const detailsArray = newProduct.details
            .split("\n")
            .map(item => item.trim())
            .filter(item => item);
        const colorArray = newProduct.color
            .split(",")
            .map(item => item.trim())
            .filter(item => item);
        const updatedProduct = { ...newProduct, image: imageUrl, details: detailsArray, color: colorArray };

        if (editingProductId) {
            axios.put(`${API_BASE}/product/${editingProductId}`, updatedProduct)
                .then(() => {
                    alert("Cập nhật sản phẩm thành công!");
                    resetForm();
                    fetchProducts();
                })
                .catch(() => alert("Lỗi khi cập nhật sản phẩm!"))
                .finally(() => setUploading(false));
        } else {
            axios.post(`${API_BASE}/create-product`, updatedProduct)
                .then(() => {
                    alert("Thêm sản phẩm thành công!");
                    resetForm();
                    fetchProducts();
                })
                .catch(() => alert("Lỗi khi thêm sản phẩm!"))
                .finally(() => setUploading(false));
        }
    };

    // Sửa sản phẩm
    const handleEdit = (product) => {
        setEditingProductId(product._id);
        setNewProduct({
            ...product,
            // Chuyển đổi details từ mảng thành chuỗi multiline
            details: Array.isArray(product.details) ? product.details.join("\n") : product.details,
            // Chuyển đổi color từ mảng thành chuỗi cách nhau bởi dấu phẩy
            color: Array.isArray(product.color) ? product.color.join(", ") : product.color,
        });
        setPreview(product.image || null);
    };


    // Xóa sản phẩm
    const handleDelete = (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
            axios.delete(`${API_BASE}/product/${productId}`)
                .then(() => {
                    alert("Xóa sản phẩm thành công!");
                    fetchProducts();
                })
                .catch(() => alert("Lỗi khi xóa sản phẩm!"));
        }
    };

    // Reset form
    const resetForm = () => {
        setEditingProductId(null);
        setNewProduct({
            name: "",
            description: "",
            details: "",
            brand: "",
            category: "",
            price: "",
            discount: 0,
            color: "",
            new: false,
            stock: 0,
            rating: 0,
            reviews: 0,
            image: null,
        });
        setPreview(null);
    };

    return (
        <Container style={{ marginTop: "20px" }}>
            {/* FORM LỌC SẢN PHẨM */}
            <Form style={{ marginBottom: "20px" }}>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>NAME</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        placeholder="Nhập tên sản phẩm..."
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>BRAND</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        placeholder="Nhập thương hiệu..."
                        value={filters.brand}
                        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>CATEGORY</Form.Label>
                    <Form.Select
                        name="category"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">Chọn danh mục</option>
                        <option value="Custome Build">Custome Build</option>
                        <option value="MSI Laptop">MSI Laptop</option>
                        <option value="Desktops">Desktops</option>
                        <option value="Gaming Monitors">Gaming Monitors</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>COLOR</Form.Label>
                    <Form.Control
                        type="text"
                        name="color"
                        placeholder="Nhập màu (ví dụ: Red, Blue)"
                        value={filters.color}
                        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>Giá (≤)</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        placeholder="Nhập giá tối đa..."
                        value={filters.price}
                        onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                    />
                </Form.Group>
            </Form>

            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Danh sách sản phẩm</h2>
            {loading && <Spinner animation="border" style={{ display: "block", margin: "auto" }} />}
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
                <thead style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                    <tr>
                        <th>#</th>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Thương hiệu</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Color</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ textAlign: "center" }}>
                    {products.map((p, index) => (
                        <tr key={p._id}>
                            <td>{index + 1}</td>
                            <td>{p.image ? <Image src={p.image} width="50" height="50" rounded /> : "❌"}</td>
                            <td>{p.name}</td>
                            <td>{p.brand}</td>
                            <td>{p.category}</td>
                            <td>{p.price}</td>
                            <td>
                                {Array.isArray(p.color)
                                    ? p.color.map((color, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                backgroundColor: color,
                                                width: "20px",
                                                height: "20px",
                                                display: "inline-block",
                                                marginRight: "5px",
                                                border: "1px solid #ccc",
                                            }}
                                            title={color}
                                        />
                                    ))
                                    : (
                                        <div
                                            style={{
                                                backgroundColor: p.color,
                                                width: "20px",
                                                height: "20px",
                                                border: "1px solid #ccc",
                                            }}
                                            title={p.color}
                                        />
                                    )
                                }
                            </td>

                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEdit(p)}>
                                    Sửa
                                </Button>{" "}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>
                                    Xóa
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h2 style={{ marginTop: "30px" }}>{editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>TÊN</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>MÔ TẢ</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={newProduct.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>DETAILS (mỗi dòng là 1 thông số)</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="details"
                        placeholder="Nhập thông tin chi tiết, mỗi dòng là 1 thông số"
                        value={newProduct.details}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>THƯƠNG HIỆU</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>DANH MỤC</Form.Label>
                    <Form.Select
                        name="category"
                        value={newProduct.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        <option value="Custome Build">Custome Build</option>
                        <option value="MSI Laptop">MSI Laptop</option>
                        <option value="Desktops">Desktops</option>
                        <option value="Gaming Monitors">Gaming Monitors</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>GIÁ</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>DISCOUNT</Form.Label>
                    <Form.Control
                        type="number"
                        name="discount"
                        value={newProduct.discount}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>COLOR (nhập cách nhau bởi dấu phẩy)</Form.Label>
                    <Form.Control
                        type="text"
                        name="color"
                        value={newProduct.color}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>NEW</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="new"
                        checked={newProduct.new}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>STOCK</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>RATING</Form.Label>
                    <Form.Control
                        type="number"
                        name="rating"
                        value={newProduct.rating}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>REVIEWS</Form.Label>
                    <Form.Control
                        type="number"
                        name="reviews"
                        value={newProduct.reviews}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>HÌNH ẢNH</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleChange} />
                    {preview && <Image src={preview} alt="Preview" width="100" style={{ marginTop: "10px" }} />}
                    {uploading && <Spinner animation="border" style={{ marginTop: "10px" }} />}
                </Form.Group>
                <Button type="submit" disabled={uploading} style={{ marginTop: "10px" }}>
                    {editingProductId ? "Cập nhật" : "Thêm sản phẩm"}
                </Button>
            </Form>
        </Container>);
}
export default App;  
