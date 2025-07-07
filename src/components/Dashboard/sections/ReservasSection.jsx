import React, { useState, useEffect } from 'react';
import styles from './ReservasSection.module.css';
import Toast from './Toast';


function NuevaReservaModal({ open, onClose, onSubmit, initialData, modo, reservas }) {
  const [form, setForm] = useState(initialData || {
    fecha: '',
    hora_desde: '',
    hora_hasta: '',
    cancha: '',
    socio: '',
    estado: 'Pendiente',
  });
  const [error, setError] = useState('');
  useEffect(() => {
    setForm(initialData || {
      fecha: '', hora_desde: '', hora_hasta: '', cancha: '', socio: '', estado: 'Pendiente',
    });
  }, [initialData, open]);
  if (!open) return null;
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Validación frontend
    if (!form.fecha || !form.hora_desde || !form.hora_hasta || !form.cancha || !form.socio) {
      setError('Completá todos los campos obligatorios.');
      return;
    }
    if (form.hora_hasta <= form.hora_desde) {
      setError('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    // Validar fecha/hora pasada
    const now = new Date();
    const reservaDate = new Date(`${form.fecha}T${form.hora_desde}`);
    if (reservaDate < now) {
      setError('No se puede reservar en el pasado.');
      return;
    }
    // Validar superposición
    const existe = reservas.some(r =>
      r.fecha === form.fecha &&
      String(r.cancha) === String(form.cancha) &&
      (form.hora_desde < r.hora_hasta && form.hora_hasta > r.hora_desde) &&
      (modo !== 'editar' || r.id !== initialData?.id)
    );
    if (existe) {
      setError('Ya existe una reserva superpuesta para esa cancha, fecha y horario.');
      return;
    }
    setError('');
    onSubmit(form);
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h4>{modo === 'editar' ? 'Editar reserva' : 'Nueva Reserva'}</h4>
        <form onSubmit={handleSubmit} className={styles.formModal}>
          <label>
            Fecha*
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
          </label>
          <label>
            Desde*
            <input type="time" name="hora_desde" value={form.hora_desde} onChange={handleChange} required />
          </label>
          <label>
            Hasta*
            <input type="time" name="hora_hasta" value={form.hora_hasta} onChange={handleChange} required />
          </label>
          <label>
            Cancha*
            <input type="number" name="cancha" value={form.cancha} onChange={handleChange} min="1" required />
          </label>
          <label>
            Socio*
            <input type="text" name="socio" value={form.socio} onChange={handleChange} required />
          </label>
          <label>
            Estado
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </label>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <div className={styles.modalActions}>
            <button type="submit" className={styles.addBtn}>{modo === 'editar' ? 'Guardar cambios' : 'Guardar'}</button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Utilidad para formatear fecha y hora
function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString('es-AR');
}
function formatHora(hora) {
  if (!hora) return '';
  // Si viene como string tipo '12:12:00' o '12:12', mostrar solo hh:mm
  if (hora.length >= 5) return hora.slice(0,5);
  return hora;
}

function formatRango(hora_desde, hora_hasta) {
  if (!hora_desde || !hora_hasta) return '';
  return `${hora_desde.slice(0,5)} - ${hora_hasta.slice(0,5)}`;
}

function ReservasSection({ modalOpen, setModalOpen }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editReserva, setEditReserva] = useState(null);
  const [modo, setModo] = useState('crear');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filtroSocio, setFiltroSocio] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('');

  // Cargar reservas al montar
  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/reservas');
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

  // Crear reserva
  const handleCreateReserva = async (form) => {
    try {
      const res = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear reserva');
      setReservas(prev => [...prev, data]);
      setModalOpen(false);
      setToast({ message: 'Reserva creada con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al crear reserva', type: 'error' });
    }
  };

  // Editar reserva
  const handleEditReserva = async (form) => {
    try {
      const res = await fetch(`http://localhost:3001/reservas/${editReserva.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al editar reserva');
      setReservas(prev => prev.map(r => r.id === data.id ? data : r));
      setEditReserva(null);
      setModalOpen(false);
      setModo('crear');
      setToast({ message: 'Reserva editada con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al editar reserva', type: 'error' });
    }
  };

  // Eliminar reserva
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar la reserva?')) return;
    try {
      const res = await fetch(`http://localhost:3001/reservas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setReservas(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Reserva eliminada', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al eliminar reserva', type: 'error' });
    }
  };

  // Obtener canchas únicas para el filtro
  const canchasUnicas = Array.from(new Set(reservas.map(r => String(r.cancha))));

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(r => {
    const socioOk = filtroSocio === '' || r.socio.toLowerCase().includes(filtroSocio.toLowerCase());
    const canchaOk = filtroCancha === '' || String(r.cancha) === filtroCancha;
    return socioOk && canchaOk;
  });

  return (
    <div className={styles.mainWrapper}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <h3 style={{ marginBottom: 16 }}>Reservas de Canchas</h3>
      {/* Filtros y búsqueda */}
      <div className={styles.filtros}>
        <input
          className={styles.filtroInput}
          type="text"
          placeholder="Buscar socio..."
          value={filtroSocio}
          onChange={e => setFiltroSocio(e.target.value)}
        />
        <select
          className={styles.filtroSelect}
          value={filtroCancha}
          onChange={e => setFiltroCancha(e.target.value)}
        >
          <option value="">Todas las canchas</option>
          {canchasUnicas.map(c => (
            <option key={c} value={c}>Cancha {c}</option>
          ))}
        </select>
      </div>
      <div className={styles.addBtnWrapper}>
        <button className={styles.addBtn} onClick={() => { setModalOpen(true); setEditReserva(null); setModo('crear'); }}>
          + Nueva reserva
        </button>
      </div>
      <NuevaReservaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditReserva(null); setModo('crear'); }}
        onSubmit={modo === 'editar' ? handleEditReserva : handleCreateReserva}
        initialData={editReserva}
        modo={modo}
        reservas={reservas}
      />
      {loading ? (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: 30 }}>Cargando reservas...</div>
      ) : error ? (
        <div style={{ color: '#f87171', textAlign: 'center', marginTop: 30 }}>{error}</div>
      ) : reservasFiltradas.length === 0 ? (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: 30, fontSize: '1.08rem' }}>
          No hay reservas. ¡Agregá tu primera reserva!
        </div>
      ) : (
        <>
          {/* Tabla para escritorio */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Cancha</th>
                  <th>Socio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map(r => (
                  <tr key={r.id}>
                    <td>{formatFecha(r.fecha)}</td>
                    <td>{formatRango(r.hora_desde, r.hora_hasta)}</td>
                    <td>{r.cancha}</td>
                    <td>{r.socio}</td>
                    <td>{r.estado}</td>
                    <td>
                      <button className={styles.editBtn} onClick={() => { setEditReserva(r); setModalOpen(true); setModo('editar'); }}>Editar</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Lista tipo tarjetas para mobile */}
          <div className={styles.cardsWrapper}>
            {reservasFiltradas.map(r => (
              <div className={styles.card} key={r.id}>
                <div className={styles.cardRow}><b>Fecha:</b> {formatFecha(r.fecha)}</div>
                <div className={styles.cardRow}><b>Horario:</b> {formatRango(r.hora_desde, r.hora_hasta)}</div>
                <div className={styles.cardRow}><b>Cancha:</b> {r.cancha}</div>
                <div className={styles.cardRow}><b>Socio:</b> {r.socio}</div>
                <div className={styles.cardRow}><b>Estado:</b> {r.estado}</div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => { setEditReserva(r); setModalOpen(true); setModo('editar'); }}>Editar</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ReservasSection; 