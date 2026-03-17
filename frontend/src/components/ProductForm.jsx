import React, { useState } from 'react';

export default function ProductForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || '',
    description: initialData.description || '',
    price: initialData.price || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.category.trim()) newErrors.category = 'Категория обязательна';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Цена должна быть положительным числом';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        price: Number(formData.price)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label>Название товара *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          placeholder="Введите название"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>Категория *</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? 'error' : ''}
          placeholder="Введите категорию"
        />
        {errors.category && <span className="error-message">{errors.category}</span>}
      </div>

      <div className="form-group">
        <label>Описание *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'error' : ''}
          placeholder="Введите описание"
          rows="3"
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label>Цена *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className={errors.price ? 'error' : ''}
          placeholder="0"
          min="0"
          step="0.01"
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {initialData.id ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}