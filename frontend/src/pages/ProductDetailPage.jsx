import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (err) {
      setError('Товар не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить товар?')) return;
    
    try {
      await productsApi.delete(id);
      navigate('/products');
    } catch (err) {
      setError('Ошибка удаления товара');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Товар не найден</div>;

  return (
    <div className="product-detail">
      <div className="detail-header">
        <Link to="/products" className="back-link">← Назад к списку</Link>
        <h1 className="detail-title">{product.title}</h1>
      </div>

      <div className="detail-card">
        <div className="detail-info">
          <div className="detail-row">
            <span className="detail-label">Категория:</span>
            <span className="detail-value">{product.category}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Цена:</span>
            <span className="detail-price">{product.price} ₽</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Описание:</span>
            <p className="detail-description">{product.description}</p>
          </div>
        </div>

        <div className="detail-actions">
          <Link 
            to={`/products/${id}/edit`} 
            className="btn btn--primary"
          >
            Редактировать
          </Link>
          <button 
            className="btn btn--danger" 
            onClick={handleDelete}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}