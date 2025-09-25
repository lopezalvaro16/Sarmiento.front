import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

function InicioSociosSection({ user, onNuevoSocio, onIrActividades, onIrInscripciones }) {
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    totalActividades: 0,
    actividadesActivas: 0,
    inscripcionesActivas: 0,
    inscripcionesRecientes: []
  });
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sociosRes, actividadesRes, inscripcionesRes] = await Promise.all([
        fetch(`${apiUrl}/socios`),
        fetch(`${apiUrl}/actividades`),
        fetch(`${apiUrl}/inscripciones`)
      ]);

      if (sociosRes.ok && actividadesRes.ok && inscripcionesRes.ok) {
        const [socios, actividades, inscripciones] = await Promise.all([
          sociosRes.json(),
          actividadesRes.json(),
          inscripcionesRes.json()
        ]);

        setStats({
          totalSocios: socios.length,
          sociosActivos: socios.filter(s => s.estado === 'activo').length,
          totalActividades: actividades.length,
          actividadesActivas: actividades.filter(a => a.estado === 'activa').length,
          inscripcionesActivas: inscripciones.filter(i => i.estado === 'activa').length,
          inscripcionesRecientes: inscripciones
            .sort((a, b) => new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion))
            .slice(0, 5)
        });
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100 text-center">
        ¡Bienvenido, {user.username}!
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
        Panel de gestión de <b>socios y actividades</b>.
      </p>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-[#7ed6a7]">{stats.sociosActivos}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Socios activos</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total: {stats.totalSocios}</div>
        </div>
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-[#b8b5ff]">{stats.actividadesActivas}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Actividades activas</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total: {stats.totalActividades}</div>
        </div>
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-[#ffa8a8]">{stats.inscripcionesActivas}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Inscripciones activas</div>
        </div>
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-[#ffcc8a]">
            {stats.inscripcionesRecientes.length}
          </div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Inscripciones recientes</div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <Button 
          onClick={onNuevoSocio}
          className="bg-gradient-to-r from-[#7ed6a7] to-[#6bc495] hover:from-[#6bc495] to-[#5ab085] text-white py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          + Nuevo Socio
        </Button>
        <Button 
          onClick={onIrActividades}
          className="bg-gradient-to-r from-[#b8b5ff] to-[#a8a5ff] hover:from-[#a8a5ff] to-[#9895ff] text-white py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Ver Actividades
        </Button>
        <Button 
          onClick={onIrInscripciones}
          className="bg-gradient-to-r from-[#ffa8a8] to-[#ff9898] hover:from-[#ff9898] to-[#ff8888] text-white py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Gestionar Inscripciones
        </Button>
      </div>

      {/* Inscripciones recientes */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 mb-6 sm:mb-8 mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Inscripciones recientes
        </h2>
        {stats.inscripcionesRecientes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay inscripciones recientes
          </p>
        ) : (
          <div className="space-y-3">
            {stats.inscripcionesRecientes.map(inscripcion => (
              <div 
                key={inscripcion.id} 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-[#2d3237] rounded-lg"
              >
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                    {inscripcion.socio_apellido}, {inscripcion.socio_nombre}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {inscripcion.actividad_nombre}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {inscripcion.fecha_inscripcion?.slice(0, 10)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {inscripcion.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actividades populares */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Actividades disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-medium text-blue-800 dark:text-blue-200">Fútbol</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">L, M, V - 18:00-20:00</div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-medium text-green-800 dark:text-green-200">Volley</div>
            <div className="text-sm text-green-600 dark:text-green-300">M, J - 19:00-21:00</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-medium text-purple-800 dark:text-purple-200">Hockey</div>
            <div className="text-sm text-purple-600 dark:text-purple-300">M, J - 17:00-19:00</div>
          </div>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="font-medium text-cyan-800 dark:text-cyan-200">Natación</div>
            <div className="text-sm text-cyan-600 dark:text-cyan-300">L, M, V - 16:00-18:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioSociosSection;
