import React from 'react';
import styles from './InicioSection.module.css';

function InicioSection({ user }) {
  return (
    <div className={styles.inicioWrapper}>
      <h1 className={styles.welcome}>¡Bienvenido, {user.username}!</h1>
      <p className={styles.desc}>Eres administrador de <b>{user.role}</b>.</p>
    </div>
  );
}

export default InicioSection; 