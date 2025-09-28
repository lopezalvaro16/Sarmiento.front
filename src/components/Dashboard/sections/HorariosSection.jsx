import React, { useEffect, useState } from 'react';
import { FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [fechasConReservas, setFechasConReservas] = useState(new Set());

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

  // Funciones para el calendario
  function getDiasDelMes(fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = (primerDia.getDay() + 6) % 7; // 0 = lunes

    const dias = [];
    
    // Días del mes anterior
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(año, mes, -i);
      dias.push({
        fecha: dia,
        esDelMesActual: false,
        esHoy: false,
        tieneReservas: false
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(año, mes, dia);
      const fechaStr = formatISODateLocal(fechaDia);
      const esHoy = fechaStr === new Date().toISOString().slice(0, 10);
      const tieneReservas = fechasConReservas.has(fechaStr);
      
      dias.push({
        fecha: fechaDia,
        esDelMesActual: true,
        esHoy,
        tieneReservas,
        fechaStr
      });
    }

    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length; // 6 semanas x 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fechaDia = new Date(año, mes + 1, dia);
      dias.push({
        fecha: fechaDia,
        esDelMesActual: false,
        esHoy: false,
        tieneReservas: false
      });
    }

    return dias;
  }

  function cambiarMes(direccion) {
    setCurrentMonth(prev => {
      const nuevoMes = new Date(prev);
      nuevoMes.setMonth(prev.getMonth() + direccion);
      return nuevoMes;
    });
  }

  function seleccionarFecha(fechaStr) {
    setSelectedDate(fechaStr);
    setShowCalendar(false);
  }

  function irAHoy() {
    const hoy = new Date().toISOString().slice(0, 10);
    setSelectedDate(hoy);
    setCurrentMonth(new Date());
    setShowCalendar(false);
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

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

  // Calcular fechas con reservas cuando cambian las reservas o el establecimiento seleccionado
  useEffect(() => {
    if (reservas.length === 0 || !canchaSel) return;

    const fechas = new Set();
    reservas.forEach(reserva => {
      if (String(reserva.cancha) === String(canchaSel)) {
        fechas.add(reserva.fecha.slice(0, 10));
      }
    });
    setFechasConReservas(fechas);
  }, [reservas, canchaSel]);

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

          <div className="relative">
            <label className="text-base font-medium mb-2 block text-gray-900 dark:text-gray-100">📅 Fecha</label>
            <input
              type="text"
              value={formatDMY(selectedDate)}
              onClick={() => setShowCalendar(!showCalendar)}
              readOnly
              className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 cursor-pointer bg-white"
              placeholder="Seleccionar fecha"
            />
            
            {/* Calendario personalizado - Compacto */}
            {showCalendar && (
              <div className="calendar-container absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 sm:p-3 max-h-[80vh] overflow-y-auto">
                {/* Header del calendario - Más compacto */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cambiarMes(-1)}
                    className="p-1 sm:p-2 h-8 w-8"
                  >
                    <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 text-center px-2">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cambiarMes(1)}
                    className="p-1 sm:p-2 h-8 w-8"
                  >
                    <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {/* Días de la semana - Más compactos */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(dia => (
                    <div key={dia} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-1">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Días del mes - Más compactos */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {getDiasDelMes(currentMonth).map((dia, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (dia.esDelMesActual && dia.fechaStr) {
                          seleccionarFecha(dia.fechaStr);
                        }
                      }}
                      disabled={!dia.esDelMesActual}
                      className={`
                        p-1 sm:p-2 text-xs sm:text-sm rounded-md transition-colors min-h-[32px] sm:min-h-[36px] flex items-center justify-center
                        ${!dia.esDelMesActual 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer'
                        }
                        ${dia.esHoy 
                          ? 'bg-blue-500 text-white font-bold' 
                          : dia.fechaStr === selectedDate
                            ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold'
                            : dia.tieneReservas
                              ? 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 font-medium'
                              : 'text-gray-900 dark:text-gray-100'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm">{dia.fecha.getDate()}</span>
                        {dia.tieneReservas && (
                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-0.5"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Botones de acción - Más compactos */}
                <div className="flex justify-between mt-2 sm:mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCalendar(false)}
                    className="text-xs sm:text-sm px-2 py-1 h-7"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={irAHoy}
                    className="text-xs sm:text-sm px-2 py-1 h-7"
                  >
                    Hoy
                  </Button>
                </div>
              </div>
            )}
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
        
        <div className="flex flex-wrap gap-4 text-base justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
            Libre
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 border-2 border-red-500 rounded"></div>
            Ocupado
          </div>
        </div>
        
        {/* Leyenda del calendario */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 text-center">📅 Calendario de Reservas</h4>
          <div className="flex flex-wrap gap-4 text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              Hoy
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
              Fecha seleccionada
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 dark:bg-orange-800 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              </div>
              Días con reservas
            </div>
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
        
        <div className="flex flex-wrap gap-6 text-base justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
            Libre
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 border-2 border-red-500 rounded"></div>
            Ocupado
          </div>
        </div>
        
        {/* Leyenda del calendario */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 text-center">📅 Calendario de Reservas</h4>
          <div className="flex flex-wrap gap-6 text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              Hoy
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
              Fecha seleccionada
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 dark:bg-orange-800 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              </div>
              Días con reservas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HorariosSection; 