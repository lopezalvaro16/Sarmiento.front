import React from 'react';

function PagosSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Pagos</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Bienvenido al módulo de Pagos</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Aquí puedes registrar y administrar los pagos de los socios.
          Usa el menú lateral para navegar entre las diferentes secciones.
        </p>
      </div>
    </div>
  );
}

export default PagosSection; 