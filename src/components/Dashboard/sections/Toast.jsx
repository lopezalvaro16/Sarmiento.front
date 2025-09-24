import React, { useEffect } from 'react';

class ToastErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // Podés loguear el error si querés
  }
  render() {
    if (this.state.hasError) {
      return <div className="fixed top-4 right-4 z-[10000] p-4 rounded-lg text-white shadow-lg bg-red-700">Ocurrió un error al mostrar el aviso.</div>;
    }
    return this.props.children;
  }
}

function Toast({ message, type = 'info', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-[10000] p-4 rounded-lg text-white shadow-lg ${bgColor}`}>
      {message}
    </div>
  );
}

export default function ToastWithBoundary(props) {
  return (
    <ToastErrorBoundary>
      <Toast {...props} />
    </ToastErrorBoundary>
  );
} 