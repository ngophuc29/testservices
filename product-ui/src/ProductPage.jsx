import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Form, Button, Spinner, Alert, Image } from "react-bootstrap";

const API_BASE = "http://localhost:4004/api"; // API Backend

function App() {
    const [allProducts, setAllProducts] = useState([]); // Dữ liệu gốc từ API
    const [products, setProducts] = useState([]); // Dữ liệu sau khi lọc
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [editingProductId, setEditingProductId] = useState(null);
    const [filters, setFilters] = useState({
        name: "",
        price: "",
        brand: "",
        category: "",
        color: ""
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
        image: null,
    });
    const [preview, setPreview] = useState(null);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios
            .get(`${API_BASE}/products-new`)
            .then((res) => {
                setAllProducts(res.data.data || []);
                setProducts(res.data.data || []);
            })
            .catch(() => setError("Lỗi khi lấy sản phẩm!"))
            .finally(() => setLoading(false));
    };

    // Lọc sản phẩm trên client
    useEffect(() => {
        let filtered = allProducts.filter((p) =>
            Object.keys(filters).every((key) =>
                filters[key] === "" ||
                (key === "price"
                    ? p[key] <= Number(filters[key])
                    : p[key].toLowerCase().includes(filters[key].toLowerCase())
                )
            )
        );
        setProducts(filtered);
    }, [filters, allProducts]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            const file = files[0];
            setNewProduct({ ...newProduct, image: file });

            // Hiển thị preview ảnh
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setNewProduct({ ...newProduct, [name]: type === "checkbox" ? checked : value });
        }
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Thêm hoặc cập nhật sản phẩm
    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationErrors({});

        if (editingProductId) {
            axios
                .put(`${API_BASE}/product/${editingProductId}`, newProduct)
                .then(() => {
                    alert("Cập nhật sản phẩm thành công!");
                    resetForm();
                    fetchProducts();
                })
                .catch((err) => handleValidationErrors(err));
        } else {
            axios
                .post(`${API_BASE}/create-product`, newProduct)
                .then(() => {
                    alert("Thêm sản phẩm thành công!");
                    resetForm();
                    fetchProducts();
                })
                .catch((err) => handleValidationErrors(err));
        }
    };

    const handleValidationErrors = (err) => {
        if (err.response && err.response.data.errors) {
            setValidationErrors(err.response.data.errors);
        } else {
            alert("Có lỗi xảy ra!");
        }
    };

    // // Sửa sản phẩm
    // const handleEdit = (product) => {
    //   setEditingProductId(product._id);
    //   setNewProduct({ ...product });
    //   setPreview(product.image || null);
    // };
    // Sửa sản phẩm: chỉ lấy các trường cần chỉnh sửa
    const handleEdit = (product) => {
        const { _id, rating, reviews, createdAt, updatedAt, __v, ...editableFields } = product;
        setEditingProductId(product._id);
        setNewProduct(editableFields);
        setPreview(product.image || null);
    };


    // Xóa sản phẩm
    const handleDelete = (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
            axios
                .delete(`${API_BASE}/product/${productId}`)
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
            <h2>Danh sách sản phẩm</h2>

            <Form className="mb-4">
                {["name", "brand", "category", "color"].map((field) => (
                    <Form.Group key={field} className="mb-2">
                        <Form.Label>{field.toUpperCase()}</Form.Label>
                        <Form.Control type="text" name={field} value={filters[field]} onChange={handleFilterChange} />
                    </Form.Group>
                ))}
                <Form.Group className="mb-2">
                    <Form.Label>Giá (≤)</Form.Label>
                    <Form.Control type="number" name="price" value={filters.price} onChange={handleFilterChange} />
                </Form.Group>
            </Form>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
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
                        {products.length > 0 ? (
                            products.map((p, index) => (
                                <tr key={p._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {p.image ? <Image src={p.image} width="50" height="50" rounded /> : "❌"}
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.brand}</td>
                                    <td>{p.category}</td>
                                    <td>{p.price}</td>
                                    <td>
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(p)}>Sửa</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>Xóa</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">Không có sản phẩm nào</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            <h2>{editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>

            <Form onSubmit={handleSubmit}>
                {Object.keys(newProduct).map((key) =>
                    key !== "image" && (
                        <Form.Group key={key} className="mb-2">
                            <Form.Label>{key.toUpperCase()}</Form.Label>
                            <Form.Control type="text" name={key} value={newProduct[key]} onChange={handleChange} required />
                        </Form.Group>
                    )
                )}
                <Button type="submit">{editingProductId ? "Cập nhật" : "Thêm sản phẩm"}</Button>
            </Form>
        </Container>
    );
}

export default App;
