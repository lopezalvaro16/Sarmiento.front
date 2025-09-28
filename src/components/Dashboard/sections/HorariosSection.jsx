import React, { useEffect, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
// Horas del día 0..23
const HORAS = Array.from({ length: 24 }, (_, i) => i);

function getDiaHoyIdx() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 6=domingo
}

function HorariosSection() {
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [canchaSel, setCanchaSel] = useState('');
  const [diaSel, setDiaSel] = useState(getDiaHoyIdx());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Helpers de fecha sin sesgo por zona horaria
  function parseLocalDateFromInput(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function formatISODateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function formatDMY(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split('-');
    return `${d}/${m}/${y}`;
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/reservas`);
        const data = await res.json();
        setReservas(data);
        const unicas = Array.from(new Set(data.map(r => String(r.cancha))));
        setCanchas(unicas);
        if (!canchaSel && unicas.length > 0) setCanchaSel(unicas[0]);
      } catch (err) {}
      setLoading(false);
    };
    fetchReservas();
  }, [canchaSel]);

  const reservasCancha = reservas.filter(r => String(r.cancha) === canchaSel);

  function getReservaPorFecha(fechaStr, hora) {
    return reservasCancha.find(r => {
      // Comparar el string de la fecha directamente
      if (r.fecha.slice(0, 10) !== fechaStr) return false;
      const desdeMin = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hastaMin = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      const franjaIni = hora * 60;
      const franjaFin = (hora + 1) * 60;
      return (franjaIni < hastaMin) && (franjaFin > desdeMin);
    });
  }

  function getBloquesFecha(cancha, fechaStr) {
    const reservasDia = reservas.filter(r => {
      return String(r.cancha) === String(cancha) && r.fecha.slice(0, 10) === fechaStr;
    });
    
    const finDia = 24 * 60;
    
    // Si no hay reservas, todo el día está libre
    if (reservasDia.length === 0) {
      return [{ tipo: 'libre', desde: 0, hasta: finDia }];
    }
    
    // Crear bloques directamente
    const bloques = [];
    
    // Procesar cada reserva
    reservasDia.forEach(r => {
      const desde = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hasta = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      
      if (hasta <= desde) {
        // Cruza medianoche - crear UN SOLO bloque
        bloques.push({
          tipo: 'ocupado',
          desde: desde,
          hasta: hasta, // Mantener las horas originales para mostrar
          socio: r.socio,
          reserva: r,
          cruzaMedianoche: true
        });
      } else {
        // Reserva normal
        bloques.push({
          tipo: 'ocupado',
          desde: desde,
          hasta: hasta,
          socio: r.socio,
          reserva: r,
          cruzaMedianoche: false
        });
      }
    });
    
    // Ordenar bloques por hora de inicio
    bloques.sort((a, b) => a.desde - b.desde);
    
    // Crear bloques libres entre los ocupados
    const bloquesFinales = [];
    let horaActual = 0;
    
    for (const bloque of bloques) {
      // Si hay espacio libre antes de este bloque ocupado
      if (horaActual < bloque.desde) {
        bloquesFinales.push({
          tipo: 'libre',
          desde: horaActual,
          hasta: bloque.desde
        });
      }
      
      // Agregar el bloque ocupado
      bloquesFinales.push(bloque);
      
      // Actualizar la hora actual
      if (bloque.cruzaMedianoche) {
        // Para reservas que cruzan medianoche, la hora actual es la hora de inicio
        // (que representa las 22:00, donde termina el día libre)
        horaActual = bloque.desde;
      } else {
        horaActual = bloque.hasta;
      }
    }
    
    // Si queda espacio libre al final del día
    // Pero solo si no hay reservas que cruzan medianoche
    const hayReservasCruzanMedianoche = bloques.some(b => b.cruzaMedianoche);
    if (horaActual < finDia && !hayReservasCruzanMedianoche) {
      bloquesFinales.push({
        tipo: 'libre',
        desde: horaActual,
        hasta: finDia
      });
    }
    
    return bloquesFinales;
  }

  function minutosAHoraStr(min) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  if (loading) {
    return <div className="text-center py-8">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <h2 className="text-xl font-bold text-center">Horarios de Establecimientos</h2>
      
      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-base font-medium mb-2 block text-gray-900 dark:text-gray-100">🏢 Establecimiento</label>
            <select 
              value={canchaSel} 
              onChange={e => setCanchaSel(e.target.value)}
              className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
            >
              {canchas.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-base font-medium mb-2 block text-gray-900 dark:text-gray-100">📅 Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
            />
          </div>
        </div>
      </div>

      {/* Vista móvil - Solo tarjetas */}
      <div className="block lg:hidden space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            {formatDMY(selectedDate)} - {canchaSel}
          </h3>
          <div className="space-y-2">
            {getBloquesFecha(canchaSel, selectedDate).map((bloque, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  bloque.tipo === 'ocupado'
                    ? 'bg-red-200 border-2 border-red-400 text-red-900 font-bold shadow-md'
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}
              >
                {bloque.tipo === 'ocupado' && (
                  <FaLock className="text-red-700 mr-2" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-base">
                    {bloque.tipo === 'ocupado' && bloque.cruzaMedianoche 
                      ? `${bloque.reserva.hora_desde.slice(0,5)} - ${bloque.reserva.hora_hasta.slice(0,5)}`
                      : `${minutosAHoraStr(bloque.desde)} - ${minutosAHoraStr(bloque.hasta)}`
                    }
                  </div>
                  <div className="text-sm">
                    {bloque.tipo === 'ocupado'
                      ? `Ocupado - ${bloque.socio}`
                      : 'Disponible'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 text-base justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
            Libre
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 border-2 border-red-500 rounded"></div>
            Ocupado
          </div>
        </div>
      </div>

      {/* Vista desktop - Bloques de horarios (sin scroll) */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
            {formatDMY(selectedDate)} - {canchaSel}
          </h3>
          
          {/* Vista compacta por bloques - Sin scroll */}
          <div className="space-y-3">
            {getBloquesFecha(canchaSel, selectedDate).map((bloque, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  bloque.tipo === 'ocupado'
                    ? 'bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-100'
                    : 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/30 dark:border-green-600 dark:text-green-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {bloque.tipo === 'ocupado' && (
                      <FaLock className="text-red-700 dark:text-red-300 text-lg" />
                    )}
                    <div>
                      <div className="text-lg font-bold">
                        {bloque.tipo === 'ocupado' && bloque.cruzaMedianoche 
                          ? `${bloque.reserva.hora_desde.slice(0,5)} - ${bloque.reserva.hora_hasta.slice(0,5)}`
                          : `${minutosAHoraStr(bloque.desde)} - ${minutosAHoraStr(bloque.hasta)}`
                        }
                      </div>
                      <div className="text-sm">
                        {bloque.tipo === 'ocupado'
                          ? `Ocupado por: ${bloque.socio}`
                          : 'Disponible'}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    bloque.tipo === 'ocupado'
                      ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                      : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                  }`}>
                    {bloque.tipo === 'ocupado' ? '🔒 OCUPADO' : '✅ LIBRE'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-6 text-base justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
            Libre
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 border-2 border-red-500 rounded"></div>
            Ocupado
          </div>
        </div>
      </div>
    </div>
  );
}

export default HorariosSection; 