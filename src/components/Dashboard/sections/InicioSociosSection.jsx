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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          👋 ¡Bienvenido, {user.username}!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Panel de gestión de <b>socios y actividades</b>
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.sociosActivos}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">👥 Socios activos</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total: {stats.totalSocios}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.actividadesActivas}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">🏃‍♂️ Actividades activas</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total: {stats.totalActividades}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.inscripcionesActivas}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">📝 Inscripciones activas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.inscripcionesRecientes.length}
          </div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">🆕 Inscripciones recientes</div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button 
          onClick={onNuevoSocio}
          className="bg-green-600 hover:bg-green-700 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          ➕ Nuevo Socio
        </Button>
        <Button 
          onClick={onIrActividades}
          className="bg-blue-600 hover:bg-blue-700 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          🏃‍♂️ Ver Actividades
        </Button>
        <Button 
          onClick={onIrInscripciones}
          className="bg-purple-600 hover:bg-purple-700 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          📝 Gestionar Inscripciones
        </Button>
      </div>

      {/* Inscripciones recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
          📝 Inscripciones recientes
        </h2>
        {stats.inscripcionesRecientes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay inscripciones recientes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.inscripcionesRecientes.map(inscripcion => (
              <div 
                key={inscripcion.id} 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col space-y-2">
                  <span className="font-bold text-gray-800 dark:text-gray-100 text-base">
                    👤 {inscripcion.socio_apellido}, {inscripcion.socio_nombre}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      🏃‍♂️ {inscripcion.actividad_nombre}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      📅 {inscripcion.fecha_inscripcion?.slice(0, 10)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                    ✅ {inscripcion.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actividades disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
          🏃‍♂️ Actividades disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="font-bold text-blue-800 dark:text-blue-200 text-base">⚽ Fútbol</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">L, M, V - 18:00-20:00</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="font-bold text-green-800 dark:text-green-200 text-base">🏐 Volley</div>
            <div className="text-sm text-green-600 dark:text-green-300">M, J - 19:00-21:00</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="font-bold text-purple-800 dark:text-purple-200 text-base">🏑 Hockey</div>
            <div className="text-sm text-purple-600 dark:text-purple-300">M, J - 17:00-19:00</div>
          </div>
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <div className="font-bold text-cyan-800 dark:text-cyan-200 text-base">🏊‍♂️ Natación</div>
            <div className="text-sm text-cyan-600 dark:text-cyan-300">L, M, V - 16:00-18:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioSociosSection;
