import React, { useEffect, useState } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 16 }, (_, i) => 8 + i); // 8 a 23

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/reservas');
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
    return reservasCancha.find(r => {
      const fecha = new Date(r.fecha);
      let diaReserva = fecha.getDay();
      diaReserva = diaReserva === 0 ? 6 : diaReserva - 1;
      const desdeMin = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hastaMin = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      const franjaIni = hora * 60;
      const franjaFin = (hora + 1) * 60;
      return diaReserva === diaIdx && (franjaIni < hastaMin) && (franjaFin > desdeMin);
    });
  }

  function getBloquesDia(cancha, diaIdx) {
    const reservasDia = reservas.filter(r => {
      const fecha = new Date(r.fecha);
      let diaReserva = fecha.getDay();
      diaReserva = diaReserva === 0 ? 6 : diaReserva - 1;
      return String(r.cancha) === String(cancha) && diaReserva === diaIdx;
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
      <h2 className="text-2xl font-bold text-gray-900">Horarios de Canchas</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-gray-700">Cancha</label>
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
            <label className="text-sm font-medium mb-2 block text-gray-700">Día</label>
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
                  className={`p-3 rounded-lg border ${
                    bloque.tipo === 'ocupado'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-green-50 border-green-200 text-green-800'
                  }`}
                >
                  <div className="font-medium">
                    {minutosAHoraStr(bloque.desde)} - {minutosAHoraStr(bloque.hasta)}
                  </div>
                  <div className="text-sm">
                    {bloque.tipo === 'ocupado'
                      ? `Ocupado - ${bloque.socio} (${bloque.reserva.hora_desde.slice(0,5)}-${bloque.reserva.hora_hasta.slice(0,5)})`
                      : 'Libre'}
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
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              Ocupado
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-20">Hora</th>
                  {DIAS.map(dia => (
                    <th key={dia} className="px-4 py-3 text-center text-sm font-medium text-gray-900">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORAS.map(hora => (
                  <tr key={hora} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-medium text-gray-900">{hora}:00</td>
                    {DIAS.map((_, diaIdx) => {
                      const reserva = getReserva(diaIdx, hora);
                      return (
                        <td
                          key={diaIdx}
                          className={`px-4 py-3 text-center text-sm ${
                            reserva
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-green-50 text-green-800 border-green-200'
                          }`}
                        >
                          {reserva ? (
                            <div>
                              <div className="font-medium">{reserva.socio}</div>
                              <div className="text-xs">
                                {reserva.hora_desde.slice(0,5)}-{reserva.hora_hasta.slice(0,5)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Libre</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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