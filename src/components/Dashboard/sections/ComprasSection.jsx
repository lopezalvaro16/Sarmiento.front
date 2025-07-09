import React from 'react';

function ComprasSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Compras</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Bienvenido al módulo de Compras</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Aquí puedes administrar las compras de productos para el buffet.
          Usa el menú lateral para navegar entre las diferentes secciones.
        </p>
      </div>
    </div>
  );
}

export default ComprasSection; 