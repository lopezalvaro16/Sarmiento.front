import React from 'react';

function CanchasSection() {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Lugares</h2>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Bienvenido al módulo de Lugares</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Aquí puedes administrar reservas, horarios y mantenimiento de los lugares.
          Usa el menú lateral para navegar entre las diferentes secciones.
        </p>
      </div>
      
      {/* Cards de navegación rápida para mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-[#7ed6a7] to-[#6bc394] rounded-lg p-4 text-white shadow-md">
          <h4 className="font-semibold text-sm sm:text-base mb-2">Reservas</h4>
          <p className="text-xs sm:text-sm opacity-90">Gestionar reservas</p>
        </div>
        <div className="bg-gradient-to-br from-[#b8b5ff] to-[#a5a2f0] rounded-lg p-4 text-white shadow-md">
          <h4 className="font-semibold text-sm sm:text-base mb-2">Horarios</h4>
          <p className="text-xs sm:text-sm opacity-90">Ver horarios</p>
        </div>
        <div className="bg-gradient-to-br from-[#ffb3ab] to-[#ff9a8f] rounded-lg p-4 text-white shadow-md">
          <h4 className="font-semibold text-sm sm:text-base mb-2">Mantenimiento</h4>
          <p className="text-xs sm:text-sm opacity-90">Controlar mantenimiento</p>
        </div>
      </div>
    </div>
  );
}

export default CanchasSection; 