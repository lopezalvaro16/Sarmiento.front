import React, { useEffect, useState } from 'react';
import styles from './StockSection.module.css';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

function StockSection({ modalOpen, setModalOpen }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activo');
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
  const [editId, setEditId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const isMobile = window.innerWidth <= 700;
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [movProdNombre, setMovProdNombre] = useState('');

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/productos_buffet');
        const data = await res.json();
        setProductos(data);
        setError('');
      } catch (err) {
        setError('Error al cargar productos');
      }
      setLoading(false);
    };
    fetchProductos();
  }, [loadingBtn]);

  // Filtros y búsqueda
  const productosFiltrados = productos.filter(p =>
    (filtroEstado === '' || p.estado === filtroEstado) &&
    (busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Manejo de formulario
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      if (editId) {
        const res = await fetch(`http://localhost:3001/productos_buffet/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al editar producto');
      } else {
        const res = await fetch('http://localhost:3001/productos_buffet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al agregar producto');
      }
      setForm({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
      setEditId(null);
      setModalOpen(false);
    } catch (err) {
      setError('Error al guardar producto');
    }
    setLoadingBtn(false);
  };

  // Abrir modal para alta
  const handleOpenModal = () => {
    setForm({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
    setEditId(null);
    setModalOpen(true);
  };

  // Editar producto
  const handleEdit = prod => {
    setForm({
      nombre: prod.nombre,
      cantidad: prod.cantidad,
      unidad: prod.unidad,
      precio: prod.precio,
      proveedor: prod.proveedor,
    });
    setEditId(prod.id);
    setModalOpen(true);
  };

  // Dar de baja producto
  const handleDelete = async id => {
    setLoadingBtn(true);
    try {
      const res = await fetch(`http://localhost:3001/productos_buffet/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
    } catch (err) {
      setError('Error al eliminar producto');
    }
    setLoadingBtn(false);
  };

  // Función para mostrar cantidad en formato '10×6' si hay dos números
  function formatCantidadMobile(cantidad) {
    if (!cantidad) return '';
    const partes = String(cantidad).split(/\s+/).filter(Boolean);
    if (partes.length === 2) {
      return `${partes[0]}×${partes[1]}`;
    }
    return partes[0];
  }

  const handleOpenHistorial = async (producto) => {
    setMovProdNombre(producto.nombre);
    setHistorialModalOpen(true);
    try {
      const res = await fetch(`http://localhost:3001/productos_buffet/${producto.id}/movimientos`);
      const data = await res.json();
      setMovimientos(data);
    } catch (err) {
      setMovimientos([]);
    }
  };
  const handleCloseHistorial = () => {
    setHistorialModalOpen(false);
    setMovimientos([]);
    setMovProdNombre('');
  };

  return (
    <div className={styles.wrapper}>
      <h3>Stock de Buffet</h3>
      <div className={styles.filtrosRow}>
        <div className={styles.filtros}>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={styles.filtroSelect}>
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <input type='text' placeholder='Buscar producto...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className={styles.filtroInput} />
        </div>
        {!modalOpen && <button className={styles.addBtnTop} onClick={handleOpenModal}>+ Agregar producto</button>}
      </div>
      {/* Botón flotante mobile */}
      {!modalOpen && <button className={styles.addBtnFloat} onClick={handleOpenModal}>+</button>}
      {/* Modal alta/edición */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h4>{editId ? 'Editar producto' : 'Agregar producto'}</h4>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor='nombre'>Nombre</label>
              <input id='nombre' type='text' name='nombre' value={form.nombre} onChange={handleChange} placeholder='Nombre*' required />
              <label htmlFor='cantidad'>Cantidad</label>
              <input id='cantidad' type='text' name='cantidad' value={form.cantidad} onChange={handleChange} placeholder='Cantidad* (Ej: 10 6)' required />
              <label htmlFor='unidad'>Unidad</label>
              <input id='unidad' type='text' name='unidad' value={form.unidad} onChange={handleChange} placeholder='Unidad*' required />
              <label htmlFor='precio'>Precio</label>
              <input id='precio' type='number' name='precio' value={form.precio} onChange={handleChange} placeholder='Precio' min='0' step='0.01' />
              <label htmlFor='proveedor'>Proveedor</label>
              <input id='proveedor' type='text' name='proveedor' value={form.proveedor} onChange={handleChange} placeholder='Proveedor' />
              <button type='submit' className={styles.addBtn} disabled={loadingBtn}>{loadingBtn ? 'Guardando...' : (editId ? 'Guardar cambios' : 'Agregar producto')}</button>
              <button type='button' className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {/* Listado */}
      {loading ? <div className={styles.loading}>Cargando...</div> : error ? <div className={styles.error}>{error}</div> : (
        <>
          <div className={styles.cardsWrapper}>
            {productosFiltrados.map(p => (
              <div className={styles.card} key={p.id}>
                <div className={styles.cardRow}><b>Nombre:</b> {p.nombre}</div>
                <div className={styles.cardRow}><b>Cantidad:</b> {isMobile ? formatCantidadMobile(p.cantidad) : `${p.cantidad}`}</div>
                {isMobile && <div className={styles.cardRow}><b>Unidad:</b> {p.unidad}</div>}
                <div className={styles.cardRow}><b>Precio:</b> {p.precio ? `$${p.precio}` : '-'}</div>
                <div className={styles.cardRow}><b>Proveedor:</b> {p.proveedor || '-'}</div>
                <div className={styles.cardRow}><b>Estado:</b> {p.estado}</div>
                <div className={styles.cardRow}><b>Stock total:</b> {parseInt(p.cantidad || 0) * parseInt(p.unidad || 1)} unidades</div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => handleEdit(p)} disabled={loadingBtn}>Editar</button>
                  {p.estado === 'activo' && <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} disabled={loadingBtn}>Dar de baja</button>}
                  <button className={styles.historialBtn} onClick={() => handleOpenHistorial(p)}>Ver historial</button>
                </div>
              </div>
            ))}
          </div>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad (packs)</th>
                <th>Unidad (por pack)</th>
                <th>Stock total (unidades)</th>
                <th>Precio</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>{p.unidad}</td>
                  <td>{p.unidad_suelta}</td>
                  <td>{p.precio ? `$${p.precio}` : '-'}</td>
                  <td>{p.proveedor || '-'}</td>
                  <td>{p.estado}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleEdit(p)} disabled={loadingBtn}>Editar</button>
                    {p.estado === 'activo' && <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} disabled={loadingBtn}>Dar de baja</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Modal historial de movimientos */}
          {historialModalOpen && (
            <div className={styles.modalOverlay} onClick={handleCloseHistorial}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h4>Historial de movimientos<br/> <span style={{fontWeight:400}}>{movProdNombre}</span></h4>
                {movimientos.length === 0 ? (
                  <div style={{color:'#fff', margin:'1.2em 0'}}>Sin movimientos registrados.</div>
                ) : (
                  <div className={styles.historialList}>
                    {movimientos.map(mov => (
                      <div key={mov.id} className={styles.historialItem}>
                        <div><b>Fecha:</b> {new Date(mov.fecha).toLocaleString('es-AR')}</div>
                        <div><b>Tipo:</b> {mov.tipo}</div>
                        <div><b>Unidades:</b> {mov.cantidad}</div>
                        <div><b>Responsable:</b> {mov.responsable || '-'}</div>
                        <div><b>Obs:</b> {mov.observacion || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button className={styles.cancelBtn} onClick={handleCloseHistorial}>Cerrar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StockSection;