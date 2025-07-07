import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function Login({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>S</span>
        </div>
        <h1 className={styles.title}>Club Sarmiento</h1>
        <h2 className={styles.subtitle}>Ingreso de Administrador</h2>
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div>
            <label className={styles.label} htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              autoComplete="username"
              placeholder="Ej: canchas"
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
            />
          </div>
          <button
            type="submit"
            className={styles.button}
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