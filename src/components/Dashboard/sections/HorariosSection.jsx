import React, { useEffect, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
// Cambiar el array HORAS para que vaya de 16 a 23 (inclusive)
const HORAS = Array.from({ length: 9 }, (_, i) => 16 + i); // 16 a 24

function getDiaHoyIdx() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1; // 0=lunes, 6=domingo
}

function HorariosSection() {
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [canchaSel, setCanchaSel] = useState('');
  const [diaSel, setDiaSel] = useState(getDiaHoyIdx());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

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

  function getReserva(diaIdx, hora) {
    // Calcular la fecha correspondiente al día seleccionado
    const hoy = new Date();
    const diaActual = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const diff = diaIdx - diaActual;
    const fechaDia = new Date(hoy);
    fechaDia.setDate(hoy.getDate() + diff);
    const fechaStr = fechaDia.toISOString().slice(0, 10);
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

  function getBloquesDia(cancha, diaIdx) {
    // Calcular la fecha correspondiente al día seleccionado
    const hoy = new Date();
    const diaActual = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
    const diff = diaIdx - diaActual;
    const fechaDia = new Date(hoy);
    fechaDia.setDate(hoy.getDate() + diff);
    const fechaStr = fechaDia.toISOString().slice(0, 10);
    const reservasDia = reservas.filter(r => {
      return String(r.cancha) === String(cancha) && r.fecha.slice(0, 10) === fechaStr;
    }).sort((a, b) => a.hora_desde.localeCompare(b.hora_desde));
    
    const bloques = [];
    let horaActual = 8 * 60;
    const finDia = 23 * 60;
    
    reservasDia.forEach(r => {
      const desde = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hasta = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      if (desde > horaActual) {
        bloques.push({ tipo: 'libre', desde: horaActual, hasta: desde });
      }
      bloques.push({ tipo: 'ocupado', desde, hasta, socio: r.socio, reserva: r });
      horaActual = Math.max(hasta, horaActual);
    });
    
    if (horaActual < finDia) {
      bloques.push({ tipo: 'libre', desde: horaActual, hasta: finDia });
    }
    return bloques;
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Horarios de Canchas</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Cancha</label>
          <select 
            value={canchaSel} 
            onChange={e => setCanchaSel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {canchas.map(c => (
              <option key={c} value={c}>Cancha {c}</option>
            ))}
          </select>
        </div>
        
        {isMobile && (
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Día</label>
            <select 
              value={diaSel} 
              onChange={e => setDiaSel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DIAS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{DIAS[diaSel]} - Cancha {canchaSel}</h3>
            <div className="space-y-2">
              {getBloquesDia(canchaSel, diaSel).map((bloque, idx) => (
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
                      {minutosAHoraStr(bloque.desde)} - {minutosAHoraStr(bloque.hasta)}
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
      ) : (
        <div className="space-y-4">
          <Table className="rounded-2xl overflow-hidden w-full bg-white dark:bg-[#23272b]">
            <TableHeader className="bg-white dark:bg-[#23272b]">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100 w-20">Hora</TableHead>
                {DIAS.map((dia, diaIdx) => (
                  <TableHead key={dia} className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100">{dia}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {HORAS.map(hora => (
                <TableRow key={hora}>
                  <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{hora}:00</TableCell>
                  {DIAS.map((_, diaIdx) => {
                    const reserva = getReserva(diaIdx, hora);
                    return (
                      <TableCell
                        key={diaIdx}
                        className={`px-4 py-3 text-center text-sm ${reserva
                          ? 'bg-red-100 dark:bg-[#3a2323] text-red-700 dark:text-red-200'
                          : 'bg-green-50 dark:bg-[#2d3a2d] text-green-700 dark:text-green-200'}`}
                      >
                        {reserva ? (
                          <div>
                            <div className="font-medium">{reserva.socio}</div>
                            <div className="text-xs">
                              {reserva.hora_desde.slice(0,5)}-{reserva.hora_hasta.slice(0,5)}
                            </div>
                          </div>
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              Libre
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              Ocupado
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HorariosSection; 