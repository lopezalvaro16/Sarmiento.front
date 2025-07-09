import React, { useEffect, useState } from 'react';

function InicioSection({ user, onNuevaReserva, onIrHorarios, onIrMantenimiento }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/reservas`);
        const data = await res.json();
        setReservas(data);
        setError('');
      } catch (err) {
        setError('Error al cargar reservas');
      }
      setLoading(false);
    };
    fetchReservas();
  }, []);

  // Filtrar reservas de hoy
  const hoyStr = new Date().toISOString().slice(0, 10);
  const reservasHoy = reservas.filter(r => r.fecha && r.fecha.slice(0, 10) === hoyStr);
  // Ordenar por hora
  reservasHoy.sort((a, b) => a.hora_desde.localeCompare(b.hora_desde));

  // Próximas reservas (las siguientes 3)
  const proximas = reservasHoy.slice(0, 3);

  // Canchas ocupadas/libres ahora mismo
  const canchasUnicas = Array.from(new Set(reservas.map(r => String(r.cancha))));
  const ahora = new Date();
  const horaAhora = ahora.toTimeString().slice(0,5);
  const ocupadasAhora = reservasHoy.filter(r => r.hora_desde <= horaAhora && r.hora_hasta > horaAhora);
  const libresAhora = canchasUnicas.length - ocupadasAhora.length;

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 w-full px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100 text-center">¡Bienvenido, {user.username}!</h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">Eres administrador de <b>{user.role}</b>.</p>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold text-primary mb-2">{reservasHoy.length}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Reservas activas hoy</div>
        </div>
        <div className="bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">{libresAhora}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">Canchas libres ahora</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ocupadas: {ocupadasAhora.length}</div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-[#23272b] rounded-xl shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Próximas reservas de hoy</h2>
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : proximas.length === 0 ? (
          <div className="text-center text-gray-500">No hay reservas para hoy.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {proximas.map(r => (
              <li key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <span className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base">{r.hora_desde} - {r.hora_hasta}</span>
                  <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Cancha {r.cancha}</span>
                    <span className="text-gray-500 dark:text-gray-400">{r.socio}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-2xl">
        <button 
          onClick={onNuevaReserva} 
          className="px-4 sm:px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/80 transition text-sm sm:text-base"
        >
          + Nueva Reserva
        </button>
        <button 
          onClick={onIrHorarios} 
          className="px-4 sm:px-6 py-3 rounded-lg bg-secondary text-white font-semibold shadow hover:bg-secondary/80 transition text-sm sm:text-base"
        >
          Ver Horarios
        </button>
        <button 
          onClick={onIrMantenimiento} 
          className="px-4 sm:px-6 py-3 rounded-lg bg-destructive text-white font-semibold shadow hover:bg-destructive/80 transition text-sm sm:text-base"
        >
          Mantenimiento
        </button>
      </div>
    </div>
  );
}

export default InicioSection; 