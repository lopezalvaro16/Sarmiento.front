import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Aplicar el tema guardado en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (onLogin) onLogin(data);
        navigate('/dashboard');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c1f] to-[#23272b] dark:from-[#181c1f] dark:to-[#23272b]">
      <div className="w-full max-w-sm bg-white dark:bg-[#23272b] rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-gray-200 dark:border-[#353a40]">
        <div className="rounded-full bg-gradient-to-br from-[#b8b5ff] to-[#7ed6a7] text-white w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-lg mb-2">S</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Club Sarmiento</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-2">Ingreso de Administrador</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Ej: canchas"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#353a40] bg-white dark:bg-[#181c1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7ed6a7]"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#353a40] bg-white dark:bg-[#181c1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#b8b5ff]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7ed6a7] to-[#b8b5ff] text-[#23272b] font-semibold shadow hover:from-[#b8b5ff] hover:to-[#7ed6a7] transition-all text-lg mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 