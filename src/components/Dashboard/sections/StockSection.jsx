import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

function StockSection({ modalOpen, setModalOpen }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
  const [editId, setEditId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [movProdNombre, setMovProdNombre] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/productos_buffet`);
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

  const productosFiltrados = productos.filter(p =>
    (filtroEstado === 'todos' || p.estado === filtroEstado) &&
    (busqueda === '' || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      if (editId) {
        const res = await fetch(`${apiUrl}/productos_buffet/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al editar producto');
      } else {
        const res = await fetch(`${apiUrl}/productos_buffet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al agregar producto');
      }
      setForm({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
      setEditId(null);
      setModalOpen(false);
      toast.success(editId ? 'Producto editado con éxito' : 'Producto agregado con éxito');
    } catch (err) {
      toast.error('Error al guardar producto');
    }
    setLoadingBtn(false);
  };

  const handleOpenModal = () => {
    setForm({ nombre: '', cantidad: '', unidad: '', precio: '', proveedor: '' });
    setEditId(null);
    setModalOpen(true);
  };

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

  const handleDelete = async id => {
    if (!window.confirm('¿Seguro que querés dar de baja este producto?')) return;
    setLoadingBtn(true);
    try {
      const res = await fetch(`${apiUrl}/productos_buffet/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      toast.success('Producto dado de baja con éxito');
    } catch (err) {
      toast.error('Error al eliminar producto');
    }
    setLoadingBtn(false);
  };

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
      const res = await fetch(`${apiUrl}/productos_buffet/${producto.id}/movimientos`);
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">📦 Gestión de Stock</h2>
        <Button 
          onClick={handleOpenModal} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nuevo Producto
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="filtroEstado" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📊 Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="text-base h-12 w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="busqueda" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🔍 Buscar producto</Label>
            <Input
              id="busqueda"
              type="text"
              placeholder="Escribir nombre del producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">⏳ Cargando productos...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Vista móvil - Solo tarjetas */}
          <div className="block lg:hidden space-y-3">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-lg">No se encontraron productos</div>
              </div>
            ) : (
              productosFiltrados.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">📦 {p.nombre}</div>
                      <Badge variant={p.estado === 'activo' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                        {p.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-base mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📊 Cantidad:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.cantidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📦 Unidad:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.unidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">💰 Precio:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.precio ? `$${p.precio}` : 'Sin precio'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">🏢 Proveedor:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.proveedor || 'Sin proveedor'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📈 Stock total:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{parseInt(p.cantidad || 0) * parseInt(p.unidad || 1)} unidades</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEdit(p)} 
                          disabled={loadingBtn}
                          className="flex-1 text-base py-3 h-auto font-medium"
                        >
                          ✏️ Editar
                        </Button>
                        {p.estado === 'activo' && (
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDelete(p.id)} 
                            disabled={loadingBtn}
                            className="flex-1 text-base py-3 h-auto font-medium"
                          >
                            🗑️ Dar de baja
                          </Button>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenHistorial(p)}
                        className="w-full text-base py-3 h-auto font-medium"
                      >
                        📊 Ver historial
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Vista desktop - Solo tabla */}
          <div className="hidden lg:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad (packs)</TableHead>
                    <TableHead>Unidad (por pack)</TableHead>
                    <TableHead>Stock total</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">📦 {p.nombre}</TableCell>
                      <TableCell>{p.cantidad}</TableCell>
                      <TableCell>{p.unidad}</TableCell>
                      <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                        {parseInt(p.cantidad || 0) * parseInt(p.unidad || 1)} unidades
                      </TableCell>
                      <TableCell>{p.precio ? `$${p.precio}` : 'Sin precio'}</TableCell>
                      <TableCell>{p.proveedor || 'Sin proveedor'}</TableCell>
                      <TableCell>
                        <Badge variant={p.estado === 'activo' ? 'default' : 'secondary'}>
                          {p.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(p)} disabled={loadingBtn} className="text-xs px-2 py-1 h-6">
                              ✏️ Editar
                            </Button>
                            {p.estado === 'activo' && (
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)} disabled={loadingBtn} className="text-xs px-2 py-1 h-6">
                                🗑️ Baja
                              </Button>
                            )}
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => handleOpenHistorial(p)} className="text-xs px-2 py-1 h-6">
                            📊 Historial
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Modal alta/edición */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editId ? '✏️ Editar Producto' : '📦 Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="nombre" className="text-base font-medium text-gray-900 dark:text-gray-100">📦 Nombre*</Label>
              <Input
                id="nombre"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre del producto"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="cantidad" className="text-base font-medium text-gray-900 dark:text-gray-100">📊 Cantidad*</Label>
              <Input
                id="cantidad"
                type="text"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Ej: 10 6 (10 packs de 6 unidades)"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="unidad" className="text-base font-medium text-gray-900 dark:text-gray-100">📦 Unidad*</Label>
              <Input
                id="unidad"
                type="text"
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                placeholder="Ej: 6 (unidades por pack)"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="precio" className="text-base font-medium text-gray-900 dark:text-gray-100">💰 Precio</Label>
              <Input
                id="precio"
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio por unidad"
                min="0"
                step="0.01"
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="proveedor" className="text-base font-medium text-gray-900 dark:text-gray-100">🏢 Proveedor</Label>
              <Input
                id="proveedor"
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                placeholder="Nombre del proveedor"
                className="text-base h-12"
              />
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" className="w-full text-base py-4 h-auto font-medium" disabled={loadingBtn}>
                {loadingBtn ? '⏳ Guardando...' : (editId ? '💾 Guardar Cambios' : '💾 Agregar Producto')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-full text-base py-4 h-auto font-medium">
                ❌ Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal historial */}
      <Dialog open={historialModalOpen} onOpenChange={handleCloseHistorial}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">📊 Historial de Movimientos - {movProdNombre}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {movimientos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-lg">No hay movimientos registrados</div>
              </div>
            ) : (
              <div className="space-y-3">
                {movimientos.map((m, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{m.tipo}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{m.fecha}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">{m.cantidad}</span>
                      </div>
                      {m.motivo && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Motivo:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">{m.motivo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StockSection;