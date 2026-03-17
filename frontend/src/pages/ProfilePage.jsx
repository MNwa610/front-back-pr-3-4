import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await authApi.getMe();
      setUserData(data);
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-page">
      <h1 className="page-title">Профиль пользователя</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h2>{user?.first_name} {user?.last_name}</h2>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={logout} className="btn btn--danger">
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  );
}