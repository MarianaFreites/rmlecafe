import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminPage from './pages/AdminPage.tsx';
import VentasDelDia from "./pages/VentasDelDia"; // 👈 agregado
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/ventas" element={<VentasDelDia />} /> {/* 👈 agregado */}
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);