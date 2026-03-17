import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
            Интернет-магазин
        </Link>
        
        <nav className="nav">
          <Link to="/products" className="nav-link">Товары</Link>
          
          {isAuthenticated() ? (
            <>
              <Link to="/profile" className="nav-link">
                {user?.first_name} {user?.last_name}
              </Link>
              <button onClick={handleLogout} className="btn btn--small">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--small">Вход</Link>
              <Link to="/register" className="btn btn--small btn--primary">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}