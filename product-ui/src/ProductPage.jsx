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

    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        brand: "",
        category: "",
        price: "",
        discount: 0,
        color: "",
        new: false,
        stock: 0,
        rating: 0,
        reviews: 0,
        image: null, // URL ảnh sẽ được cập nhật sau khi upload
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
                    product.color.toLowerCase().includes(filters.color.toLowerCase())) &&
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

    // Xử lý thay đổi input
    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (!file) return;
            // Hiển thị ảnh preview
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            // Chuyển file sang base64 nhưng chưa upload ngay
            const base64 = await convertToBase64(file);
            setImageBase64(base64);
        } else if (type === "checkbox") {
            setNewProduct({ ...newProduct, [name]: checked });
        } else {
            setNewProduct({ ...newProduct, [name]: value });
        }
    };

    // Chuyển file thành base64
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
        const updatedProduct = { ...newProduct, image: imageUrl };

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
        setNewProduct(product);
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
        <Container className="mt-4">
            {/* FORM LỌC SẢN PHẨM */}
            <Form className="mb-4">
                <Form.Group className="mb-2">
                    <Form.Label>NAME</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>BRAND</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        value={filters.brand}
                        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
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
                <Form.Group className="mb-2">
                    <Form.Label>COLOR</Form.Label>
                    <Form.Control
                        type="text"
                        name="color"
                        value={filters.color}
                        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>Giá (≤)</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={filters.price}
                        onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                    />
                </Form.Group>
            </Form>

            <h2>Danh sách sản phẩm</h2>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Ảnh</th>
                        <th>Tên</th>
                        <th>Thương hiệu</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, index) => (
                        <tr key={p._id}>
                            <td>{index + 1}</td>
                            <td>{p.image ? <Image src={p.image} width="50" height="50" rounded /> : "❌"}</td>
                            <td>{p.name}</td>
                            <td>{p.brand}</td>
                            <td>{p.category}</td>
                            <td>{p.price}</td>
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

            <h2>{editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                    <Form.Label>TÊN</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>MÔ TẢ</Form.Label>
                    <Form.Control
                        type="text"
                        name="description"
                        value={newProduct.description}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>THƯƠNG HIỆU</Form.Label>
                    <Form.Control
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
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
                <Form.Group className="mb-2">
                    <Form.Label>GIÁ</Form.Label>
                    <Form.Control
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>DISCOUNT</Form.Label>
                    <Form.Control
                        type="number"
                        name="discount"
                        value={newProduct.discount}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>COLOR</Form.Label>
                    <Form.Control
                        type="text"
                        name="color"
                        value={newProduct.color}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>NEW</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="new"
                        checked={newProduct.new}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>STOCK</Form.Label>
                    <Form.Control
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>RATING</Form.Label>
                    <Form.Control
                        type="number"
                        name="rating"
                        value={newProduct.rating}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>REVIEWS</Form.Label>
                    <Form.Control
                        type="number"
                        name="reviews"
                        value={newProduct.reviews}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>HÌNH ẢNH</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    {preview && <Image src={preview} alt="Preview" width={100} />}
                    {uploading && <Spinner animation="border" />}
                </Form.Group>
                <Button type="submit" disabled={uploading}>
                    {editingProductId ? "Cập nhật" : "Thêm sản phẩm"}
                </Button>
            </Form>
        </Container>
    );
}

export default App;
