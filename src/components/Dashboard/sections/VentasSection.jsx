import React, { useEffect, useState } from 'react';
import styles from './StockSection.module.css';

function VentasSection() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ producto_id: '', unidad: '', observacion: '', responsable: '' });
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState('');
  const isMobile = window.innerWidth <= 700;

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/ventas_buffet');
        const data = await res.json();
        setVentas(data);
        setError('');
      } catch (err) {
        setError('Error al cargar ventas');
      }
      setLoading(false);
    };
    const fetchProductos = async () => {
      try {
        const res = await fetch('http://localhost:3001/productos_buffet');
        const data = await res.json();
        setProductos(data);
      } catch {}
    };
    fetchVentas();
    fetchProductos();
  }, [loadingBtn]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      const res = await fetch('http://localhost:3001/ventas_buffet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al registrar venta');
      setForm({ producto_id: '', unidad: '', observacion: '', responsable: '' });
      setModalOpen(false);
    } catch (err) {
      setError('Error al registrar venta');
    }
    setLoadingBtn(false);
  };

  return (
    <div className={styles.wrapper}>
      <h3>Ventas del Buffet</h3>
      <button className={styles.addBtnTop} onClick={() => setModalOpen(true)}>+ Registrar venta</button>
      <button className={styles.addBtnFloat} onClick={() => setModalOpen(true)}>+</button>
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h4>Registrar venta</h4>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor='producto_id'>Producto</label>
              <select id='producto_id' name='producto_id' value={form.producto_id} onChange={handleChange} required>
                <option value=''>Seleccionar producto</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <label htmlFor='unidad'>Unidades a vender</label>
              <input id='unidad' type='number' name='unidad' value={form.unidad} onChange={handleChange} placeholder={`Unidades a vender (${productos.find(p => p.id == form.producto_id)?.unidad || ''})`} required />
              <label htmlFor='responsable'>Responsable</label>
              <input id='responsable' type='text' name='responsable' value={form.responsable} onChange={handleChange} placeholder='Responsable' />
              <label htmlFor='observacion'>Observación</label>
              <input id='observacion' type='text' name='observacion' value={form.observacion} onChange={handleChange} placeholder='Observación' />
              <button type='submit' className={styles.addBtn} disabled={loadingBtn}>{loadingBtn ? 'Registrando...' : 'Registrar venta'}</button>
              <button type='button' className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className={styles.loading}>Cargando...</div> : error ? <div className={styles.error}>{error}</div> : (
        <>
          <div className={styles.cardsWrapper}>
            {ventas.map(v => (
              <div className={styles.card} key={v.id}>
                <div className={styles.cardRow}><b>Producto:</b> {v.producto_nombre}</div>
                <div className={styles.cardRow}><b>Unidades:</b> {v.cantidad}</div>
                <div className={styles.cardRow}><b>Fecha:</b> {new Date(v.fecha).toLocaleString('es-AR')}</div>
                <div className={styles.cardRow}><b>Responsable:</b> {v.responsable || '-'}</div>
                <div className={styles.cardRow}><b>Obs:</b> {v.observacion || '-'}</div>
              </div>
            ))}
          </div>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td>{v.producto_nombre}</td>
                  <td>{v.unidad}</td>
                  <td>{new Date(v.fecha).toLocaleString('es-AR')}</td>
                  <td>{v.responsable || '-'}</td>
                  <td>{v.observacion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default VentasSection; 