import React, { useEffect, useState } from 'react';

function VentasSection() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ producto_id: '', unidad: '', observacion: '', responsable: '' });
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/ventas_buffet`);
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
        const res = await fetch(`${apiUrl}/productos_buffet`);
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
      const res = await fetch(`${apiUrl}/ventas_buffet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al registrar venta');
      setForm({ producto_id: '', unidad: '', observacion: '', responsable: '' });
      setModalOpen(false);
      // toast({ description: 'Venta registrada con éxito' });
    } catch (err) {
      // toast({ description: 'Error al registrar venta', variant: 'destructive' });
      setError('Error al registrar venta');
    }
    setLoadingBtn(false);
  };

  const productoSeleccionado = productos.find(p => p.id == form.producto_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ventas del Buffet</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => setModalOpen(true)}>+ Registrar venta</button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ventas.map(v => (
              <div key={v.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.producto_nombre}</h3>
                <div className="space-y-1">
                  <div><strong>Unidades:</strong> {v.cantidad}</div>
                  <div><strong>Fecha:</strong> {new Date(v.fecha).toLocaleString('es-AR')}</div>
                  <div><strong>Responsable:</strong> {v.responsable || '-'}</div>
                  <div><strong>Observación:</strong> {v.observacion || '-'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Unidades</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Observación</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{v.producto_nombre}</td>
                    <td className="px-4 py-3">{v.unidad}</td>
                    <td className="px-4 py-3">{new Date(v.fecha).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">{v.responsable || '-'}</td>
                    <td className="px-4 py-3">{v.observacion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setModalOpen(false)}>&times;</button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar venta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="producto_id" className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                  id="producto_id"
                  name="producto_id"
                  value={form.producto_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="unidad" className="block text-sm font-medium text-gray-700">Unidades a vender</label>
                <input
                  id="unidad"
                  type="number"
                  name="unidad"
                  value={form.unidad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Unidades a vender (${productoSeleccionado?.unidad || ''})`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="responsable" className="block text-sm font-medium text-gray-700">Responsable</label>
                <input
                  id="responsable"
                  type="text"
                  name="responsable"
                  value={form.responsable}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Responsable"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="observacion" className="block text-sm font-medium text-gray-700">Observación</label>
                <input
                  id="observacion"
                  type="text"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observación"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={loadingBtn}>
                  {loadingBtn ? 'Registrando...' : 'Registrar venta'}
                </button>
                <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VentasSection; 