import React from 'react';

function InicioSection({ user }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">¡Bienvenido, {user.username}!</h1>
      <p className="text-lg text-gray-600">Eres administrador de <b>{user.role}</b>.</p>
    </div>
  );
}

export default InicioSection; 