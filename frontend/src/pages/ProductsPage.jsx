import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import ProductForm from '../components/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (productData) => {
    try {
      await productsApi.create(productData);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError('Ошибка создания товара');
    }
  };

  const handleUpdate = async (productData) => {
    try {
      await productsApi.update(editingProduct.id, productData);
      setEditingProduct(null);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError('Ошибка обновления товара');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    
    try {
      await productsApi.delete(id);
      loadProducts();
    } catch (err) {
      setError('Ошибка удаления товара');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Товары</h1>
        <button 
          className="btn btn--primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '× Закрыть' : '+ Добавить товар'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-section">
          <h2>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h2>
          <ProductForm
            initialData={editingProduct || {}}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3 className="product-title">
              <Link to={`/products/${product.id}`}>{product.title}</Link>
            </h3>
            <span className="product-category">{product.category}</span>
            <p className="product-description">{product.description}</p>
            <div className="product-footer">
              <span className="product-price">{product.price} ₽</span>
              <div className="product-actions">
                <button 
                  className="btn btn--small" 
                  onClick={() => handleEdit(product)}
                >
                  ✎
                </button>
                <button 
                  className="btn btn--small btn--danger" 
                  onClick={() => handleDelete(product.id)}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="empty-state">
          <p>Товаров пока нет</p>
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            Добавить первый товар
          </button>
        </div>
      )}
    </div>
  );
}