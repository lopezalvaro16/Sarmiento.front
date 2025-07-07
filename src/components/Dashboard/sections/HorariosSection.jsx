import React, { useEffect, useState } from 'react';
import styles from './HorariosSection.module.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 16 }, (_, i) => 8 + i); // 8 a 23

function getDiaHoyIdx() {
  // getDay(): 0=domingo, 1=lunes, ..., 6=sábado
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

  // Cargar reservas reales
  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/reservas');
        const data = await res.json();
        setReservas(data);
        // Obtener canchas únicas
        const unicas = Array.from(new Set(data.map(r => String(r.cancha))));
        setCanchas(unicas);
        if (!canchaSel && unicas.length > 0) setCanchaSel(unicas[0]);
      } catch (err) {}
      setLoading(false);
    };
    fetchReservas();
  }, [canchaSel]);

  // Filtrar reservas por cancha seleccionada
  const reservasCancha = reservas.filter(r => String(r.cancha) === canchaSel);

  // Función para saber si una celda está ocupada
  function getReserva(diaIdx, hora) {
    // Para la franja [hora:00, hora+1:00), ver si se solapa con alguna reserva
    return reservasCancha.find(r => {
      const fecha = new Date(r.fecha);
      let diaReserva = fecha.getDay();
      diaReserva = diaReserva === 0 ? 6 : diaReserva - 1; // 0=lunes
      // Convertir a minutos para comparar
      const desdeMin = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hastaMin = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      const franjaIni = hora * 60;
      const franjaFin = (hora + 1) * 60;
      // ¿Se solapan los rangos?
      return diaReserva === diaIdx && (franjaIni < hastaMin) && (franjaFin > desdeMin);
    });
  }

  function getBloquesDia(cancha, diaIdx) {
    // Filtrar reservas de la cancha y día, y ordenarlas por hora_desde
    const reservasDia = reservas.filter(r => {
      const fecha = new Date(r.fecha);
      let diaReserva = fecha.getDay();
      diaReserva = diaReserva === 0 ? 6 : diaReserva - 1;
      return String(r.cancha) === String(cancha) && diaReserva === diaIdx;
    }).sort((a, b) => a.hora_desde.localeCompare(b.hora_desde));
    const bloques = [];
    let horaActual = 8 * 60; // 8:00 en minutos
    const finDia = 23 * 60; // 23:00 en minutos
    reservasDia.forEach(r => {
      const desde = parseInt(r.hora_desde.slice(0,2), 10) * 60 + parseInt(r.hora_desde.slice(3,5), 10);
      const hasta = parseInt(r.hora_hasta.slice(0,2), 10) * 60 + parseInt(r.hora_hasta.slice(3,5), 10);
      if (desde > horaActual) {
        // Hay un hueco libre antes de la reserva
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

  return (
    <div className={styles.horariosWrapper}>
      <h3>Horarios de Canchas</h3>
      <div className={styles.selectorRow}>
        <label>Cancha:&nbsp;</label>
        <select value={canchaSel} onChange={e => setCanchaSel(e.target.value)}>
          {canchas.map(c => (
            <option key={c} value={c}>Cancha {c}</option>
          ))}
        </select>
      </div>
      {isMobile ? (
        <>
          <div className={styles.selectorRow}>
            <label>Día:&nbsp;</label>
            <select value={diaSel} onChange={e => setDiaSel(Number(e.target.value))}>
              {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <ul className={styles.listaMobile}>
            {getBloquesDia(canchaSel, diaSel).map((bloque, idx) => (
              <li key={idx} className={bloque.tipo === 'ocupado' ? styles.ocupadoMobile : styles.libreMobile}>
                <span className={styles.horaMobile}>{minutosAHoraStr(bloque.desde)} - {minutosAHoraStr(bloque.hasta)}</span>
                <span className={styles.estadoMobile}>
                  {bloque.tipo === 'ocupado'
                    ? `Ocupado - ${bloque.socio} (${bloque.reserva.hora_desde.slice(0,5)}-${bloque.reserva.hora_hasta.slice(0,5)})`
                    : 'Libre'}
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.leyenda}>
            <span className={styles.libreEjemplo}></span> Libre
            <span className={styles.ocupadoEjemplo}></span> Ocupado
          </div>
        </>
      ) : (
        <>
          <div className={styles.grillaWrapper}>
            <table className={styles.grilla}>
              <thead>
                <tr>
                  <th>Hora</th>
                  {DIAS.map(dia => <th key={dia}>{dia}</th>)}
                </tr>
              </thead>
              <tbody>
                {HORAS.map(hora => (
                  <tr key={hora}>
                    <td className={styles.horaCol}>{hora}:00</td>
                    {DIAS.map((_, diaIdx) => {
                      const reserva = getReserva(diaIdx, hora);
                      return (
                        <td key={diaIdx} className={reserva ? styles.ocupado : styles.libre}>
                          {reserva ? `${reserva.socio} (${reserva.hora_desde.slice(0,5)}-${reserva.hora_hasta.slice(0,5)})` : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.leyenda}>
            <span className={styles.libreEjemplo}></span> Libre
            <span className={styles.ocupadoEjemplo}></span> Ocupado
          </div>
        </>
      )}
    </div>
  );
}

export default HorariosSection; 