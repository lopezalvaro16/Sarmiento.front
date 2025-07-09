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
    <div className="flex flex-col items-center justify-center py-12 w-full">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">¡Bienvenido, {user.username}!</h1>
      <p className="text-lg text-gray-600 mb-6">Eres administrador de <b>{user.role}</b>.</p>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-primary mb-2">{reservasHoy.length}</div>
          <div className="text-gray-700">Reservas activas hoy</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-green-600 mb-2">{libresAhora}</div>
          <div className="text-gray-700">Canchas libres ahora</div>
          <div className="text-sm text-gray-500">Ocupadas: {ocupadasAhora.length}</div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Próximas reservas de hoy</h2>
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : proximas.length === 0 ? (
          <div className="text-center text-gray-500">No hay reservas para hoy.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {proximas.map(r => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <span className="font-medium text-gray-800">{r.hora_desde} - {r.hora_hasta}</span>
                <span className="text-gray-600">Cancha {r.cancha}</span>
                <span className="text-gray-500">{r.socio}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={onNuevaReserva} className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/80 transition">+ Nueva Reserva</button>
        <button onClick={onIrHorarios} className="px-6 py-3 rounded-lg bg-secondary text-white font-semibold shadow hover:bg-secondary/80 transition">Ver Horarios</button>
        <button onClick={onIrMantenimiento} className="px-6 py-3 rounded-lg bg-destructive text-white font-semibold shadow hover:bg-destructive/80 transition">Mantenimiento</button>
      </div>
    </div>
  );
}

export default InicioSection; 