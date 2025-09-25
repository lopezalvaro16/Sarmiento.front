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
    
    // Procesar reservas y crear bloques directamente
    const bloques = [];
    const reservasProcesadas = new Set();
    
    // Primero agregar todas las reservas como bloques ocupados
    reservasDia.forEach(r => {
      if (reservasProcesadas.has(r.id)) return; // Ya procesada
      
      const desde = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hasta = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      
      if (hasta <= desde) {
        // Cruza medianoche - crear UN solo bloque que representa toda la reserva
        bloques.push({
          tipo: 'ocupado',
          desde: desde,
          hasta: hasta, // Mantener horas originales para mostrar "23:00 - 04:00"
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
      
      reservasProcesadas.add(r.id);
    });
    
    // Ordenar bloques ocupados por hora de inicio
    bloques.sort((a, b) => a.desde - b.desde);
    
    // Crear un array para marcar qué minutos están ocupados (para calcular bloques libres)
    const minutosOcupados = new Array(finDia).fill(false);
    
    // Marcar minutos ocupados para calcular bloques libres correctamente
    reservasDia.forEach(r => {
      const desde = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hasta = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      
      if (hasta <= desde) {
        // Cruza medianoche
        for (let i = desde; i < finDia; i++) {
          minutosOcupados[i] = true;
        }
        for (let i = 0; i < hasta; i++) {
          minutosOcupados[i] = true;
        }
      } else {
        // Reserva normal
        for (let i = desde; i < hasta; i++) {
          minutosOcupados[i] = true;
        }
      }
    });
    
    // Agregar bloques libres
    const bloquesFinales = [];
    let horaActual = 0;
    
    // Encontrar bloques libres y intercalarlos con los ocupados
    let i = 0;
    while (i < finDia) {
      if (!minutosOcupados[i]) {
        // Encontrar el final del bloque libre
        const inicio = i;
        while (i < finDia && !minutosOcupados[i]) {
          i++;
        }
        
        bloquesFinales.push({
          tipo: 'libre',
          desde: inicio,
          hasta: i
        });
      } else {
        i++;
      }
    }
    
    // Combinar bloques libres con bloques ocupados y ordenar
    const todosLosBloques = [...bloquesFinales, ...bloques];
    todosLosBloques.sort((a, b) => a.desde - b.desde);
    
    return todosLosBloques;
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Horarios de Establecimientos</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Establecimiento</label>
          <select 
            value={canchaSel} 
            onChange={e => setCanchaSel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {canchas.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Fecha</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {true ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{formatDMY(selectedDate)} - {canchaSel}</h3>
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
                  <div>
                    <div className="font-medium">
                      {bloque.cruzaMedianoche 
                        ? `${bloque.reserva.hora_desde.slice(0,5)} - ${bloque.reserva.hora_hasta.slice(0,5)}`
                        : `${minutosAHoraStr(bloque.desde)} - ${minutosAHoraStr(bloque.hasta)}`
                      }
                    </div>
                    <div className="text-sm">
                      {bloque.tipo === 'ocupado'
                        ? `Ocupado - ${bloque.socio} (${bloque.reserva.hora_desde.slice(0,5)}-${bloque.reserva.hora_hasta.slice(0,5)})`
                        : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
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
      ) : null}
    </div>
  );
}

export default HorariosSection; 