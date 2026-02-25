import { useEffect, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "./api/productsApi";
import "./App.css";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    rating: "",
    imageUrl: ""
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = ["all", ...new Set(items.map(item => item.category))];

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await getProducts();
      setItems(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      rating: "",
      imageUrl: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      rating: product.rating?.toString() || "",
      imageUrl: product.imageUrl || ""
    });
    setShowForm(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Валидация
    if (!formData.title.trim() || !formData.price || !formData.category.trim()) {
      alert("Заполните обязательные поля: название, цена, категория");
      return;
    }

    setError("");
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        rating: formData.rating ? Number(formData.rating) : undefined,
        imageUrl: formData.imageUrl.trim()
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      
      resetForm();
      setShowForm(false);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Удалить товар?")) return;
    
    setError("");
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <h1 className="brand">Интернет-магазин</h1>
          <p className="header__right">React + Express</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h2 className="title">Товары ({filteredItems.length})</h2>
            <button 
              className="btn btn--primary"
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? "× Закрыть" : "+ Добавить товар"}
            </button>
          </div>

          <div className="filters">
            <span className="filter-label">Категория:</span>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Все" : cat}
                </option>
              ))}
            </select>
          </div>

          {showForm && (
            <div className="form-container">
              <h3>{editingId ? "Редактировать товар" : "Добавить новый товар"}</h3>
              <form onSubmit={handleSubmit} className="form">
                <div className="form-row">
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Название *"
                    className="form-input"
                  />
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Категория *"
                    className="form-input"
                  />
                </div>
                
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Описание"
                  className="form-textarea"
                  rows="3"
                />
                
                <div className="form-row">
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Цена *"
                    type="number"
                    step="0.01"
                    className="form-input"
                  />
                  <input
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Количество на складе"
                    type="number"
                    className="form-input"
                  />
                  <input
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="Рейтинг (0-5)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input"
                  />
                </div>
                
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="URL изображения"
                  className="form-input"
                />
                
                <div className="form-actions">
                  <button type="submit" className="btn btn--primary">
                    {editingId ? "Сохранить" : "Создать"}
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="error">
              <p>Ошибка: {error}</p>
              <p>Проверьте, что backend запущен на порту 3000 и CORS настроен</p>
            </div>
          )}

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="products-grid">
              {filteredItems.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <span className="product-category">{product.category}</span>
                    <p className="product-description">{product.description}</p>
                    <div className="product-meta">
                      <span className="product-price">{product.price} ₽</span>
                      <span className="product-stock">В наличии: {product.stock}</span>
                    </div>
                    {product.rating > 0 && (
                      <div className="product-rating">
                        Рейтинг: {product.rating} ★
                      </div>
                    )}
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(product)}
                    >
                      ✎
                    </button>
                    <button 
                      className="btn btn--danger" 
                      onClick={() => onDelete(product.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && !loading && (
                <div className="empty">
                  Товары не найдены
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Интернет-магазин
        </div>
      </footer>
    </div>
  );
}