import React, { useEffect, useState } from 'react';
import styles from './MantenimientoSection.module.css';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
];

function MantenimientoSection() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('');
  const [form, setForm] = useState({ fecha: '', descripcion: '', responsable: '', cancha: '' });
  const [agregando, setAgregando] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingEstadoId, setLoadingEstadoId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar tareas y canchas
  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:3001/mantenimientos';
        const params = [];
        if (filtroEstado) params.push(`estado=${filtroEstado}`);
        if (filtroCancha) params.push(`cancha=${filtroCancha}`);
        if (params.length) url += '?' + params.join('&');
        const res = await fetch(url);
        const data = await res.json();
        setTareas(data);
        // Obtener canchas únicas
        const unicas = Array.from(new Set(data.map(t => String(t.cancha))));
        setCanchas(unicas);
        setError('');
      } catch (err) {
        setError('Error al cargar tareas');
      }
      setLoading(false);
    };
    fetchTareas();
  }, [filtroEstado, filtroCancha, agregando]);

  // Manejo de formulario
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.cancha) return;
    setLoadingBtn(true);
    try {
      const res = await fetch('http://localhost:3001/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estado: 'pendiente' }),
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      const nueva = await res.json();
      setForm({ fecha: '', descripcion: '', responsable: '', cancha: '' });
      setTareas(prev => [nueva, ...prev]);
      setError('');
    } catch (err) {
      setError('Error al crear tarea');
    }
    setLoadingBtn(false);
  };

  // Cambiar estado
  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingEstadoId(id);
    try {
      const res = await fetch(`http://localhost:3001/mantenimientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      const actualizada = await res.json();
      setTareas(prev => prev.map(t => t.id === id ? actualizada : t));
      setError('');
    } catch (err) {
      setError('Error al cambiar estado');
    }
    setLoadingEstadoId(null);
  };

  return (
    <div className={styles.wrapper}>
      <h3>Mantenimiento de Canchas</h3>
      {/* Filtros */}
      <div className={styles.filtrosRow}>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={styles.filtroSelect}>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <select value={filtroCancha} onChange={e => setFiltroCancha(e.target.value)} className={styles.filtroSelect}>
          <option value=''>Todas las canchas</option>
          {canchas.map(c => <option key={c} value={c}>Cancha {c}</option>)}
        </select>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>Agregar tarea</button>
      </div>
      {/* Modal alta */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h4>Agregar tarea de mantenimiento</h4>
            <form className={styles.form} onSubmit={e => { handleSubmit(e); setModalOpen(false); }}>
              <label htmlFor='fecha'>Fecha</label>
              <input id='fecha' type='date' name='fecha' value={form.fecha} onChange={handleChange} required />
              <label htmlFor='descripcion'>Descripción</label>
              <input id='descripcion' type='text' name='descripcion' value={form.descripcion} onChange={handleChange} placeholder='Descripción*' required />
              <label htmlFor='responsable'>Responsable</label>
              <input id='responsable' type='text' name='responsable' value={form.responsable} onChange={handleChange} placeholder='Responsable' />
              <label htmlFor='cancha'>Cancha</label>
              <input id='cancha' type='number' name='cancha' value={form.cancha} onChange={handleChange} placeholder='Cancha*' min='1' required />
              <button type='submit' className={styles.addBtn} disabled={loadingBtn}>
                {loadingBtn ? 'Guardando...' : 'Agregar tarea'}
              </button>
              <button type='button' className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {/* Listado */}
      {loading ? <div className={styles.loading}>Cargando...</div> : error ? <div className={styles.error}>{error}</div> : (
        <>
          <div className={styles.cardsWrapper}>
            {tareas.map(t => (
              <div className={styles.card} key={t.id}>
                <div className={styles.cardRow}><b>Fecha:</b> {t.fecha.slice(0,10)}</div>
                <div className={styles.cardRow}><b>Descripción:</b> {t.descripcion}</div>
                <div className={styles.cardRow}><b>Estado:</b> {t.estado}</div>
                <div className={styles.cardRow}><b>Responsable:</b> {t.responsable}</div>
                <div className={styles.cardRow}><b>Cancha:</b> {t.cancha}</div>
                {t.estado !== 'finalizada' && (
                  <div className={styles.cardActions}>
                    {t.estado !== 'en_curso' && <button className={styles.estadoBtn} onClick={() => cambiarEstado(t.id, 'en_curso')} disabled={loadingEstadoId===t.id}>{loadingEstadoId===t.id ? 'Cargando...' : 'En curso'}</button>}
                    <button className={styles.estadoBtn} onClick={() => cambiarEstado(t.id, 'finalizada')} disabled={loadingEstadoId===t.id}>{loadingEstadoId===t.id ? 'Cargando...' : 'Finalizar'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Cancha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map(t => (
                <tr key={t.id}>
                  <td>{t.fecha.slice(0,10)}</td>
                  <td>{t.descripcion}</td>
                  <td>{t.estado}</td>
                  <td>{t.responsable}</td>
                  <td>{t.cancha}</td>
                  <td>
                    {t.estado !== 'finalizada' && (
                      <>
                        {t.estado !== 'en_curso' && <button className={styles.estadoBtn} onClick={() => cambiarEstado(t.id, 'en_curso')} disabled={loadingEstadoId===t.id}>{loadingEstadoId===t.id ? 'Cargando...' : 'En curso'}</button>}
                        <button className={styles.estadoBtn} onClick={() => cambiarEstado(t.id, 'finalizada')} disabled={loadingEstadoId===t.id}>{loadingEstadoId===t.id ? 'Cargando...' : 'Finalizar'}</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default MantenimientoSection; 