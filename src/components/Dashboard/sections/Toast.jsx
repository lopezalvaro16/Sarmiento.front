import React, { useEffect } from 'react';
import styles from './Toast.module.css';

function Toast({ message, type = 'info', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>{message}</div>
  );
}

export default Toast; 