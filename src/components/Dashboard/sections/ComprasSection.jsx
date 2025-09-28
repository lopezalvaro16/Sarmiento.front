import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

function ComprasSection() {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    producto_id: '', 
    cantidad: '', 
    precio_total: '', 
    proveedor: '', 
    responsable: '', 
    observacion: '' 
  });
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [editId, setEditId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCompras();
    fetchProductos();
  }, [loadingBtn]);

  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/compras_buffet`);
      const data = await res.json();
      // Asegurar que siempre sea un array
      setCompras(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setCompras([]); // Inicializar como array vacío en caso de error
      setError('Error al cargar compras');
    }
    setLoading(false);
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${apiUrl}/productos_buffet`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setProductos([]);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      if (editId) {
        const res = await fetch(`${apiUrl}/compras_buffet/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al editar compra');
      } else {
        const res = await fetch(`${apiUrl}/compras_buffet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al registrar compra');
      }
      setForm({ producto_id: '', cantidad: '', precio_total: '', proveedor: '', responsable: '', observacion: '' });
      setEditId(null);
      setModalOpen(false);
      toast.success(editId ? 'Compra editada con éxito' : 'Compra registrada con éxito');
    } catch (err) {
      toast.error('Error al guardar compra');
      setError('Error al guardar compra');
    }
    setLoadingBtn(false);
  };

  const handleOpenModal = () => {
    setForm({ producto_id: '', cantidad: '', precio_total: '', proveedor: '', responsable: '', observacion: '' });
    setEditId(null);
    setModalOpen(true);
  };

  const handleEdit = compra => {
    setForm({
      producto_id: compra.producto_id.toString(),
      cantidad: compra.cantidad.toString(),
      precio_total: compra.precio_total.toString(),
      proveedor: compra.proveedor || '',
      responsable: compra.responsable || '',
      observacion: compra.observacion || '',
    });
    setEditId(compra.id);
    setModalOpen(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Seguro que querés eliminar esta compra?')) return;
    setLoadingBtn(true);
    try {
      const res = await fetch(`${apiUrl}/compras_buffet/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar compra');
      toast.success('Compra eliminada con éxito');
    } catch (err) {
      toast.error('Error al eliminar compra');
    }
    setLoadingBtn(false);
  };

  // Filtrar compras localmente
  const comprasFiltradas = (Array.isArray(compras) ? compras : []).filter(c => {
    const cumpleProducto = filtroProducto === 'todos' || c.producto_id.toString() === filtroProducto;
    const cumpleProveedor = filtroProveedor === '' || 
      (c.proveedor && c.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase()));
    return cumpleProducto && cumpleProveedor;
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">🛒 Gestión de Compras</h2>
        <Button 
          onClick={handleOpenModal} 
          className="w-full text-lg py-4 h-auto font-bold bg-blue-600 hover:bg-blue-700 text-white"
        >
          ➕ Nueva Compra
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="filtroProducto" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📦 Producto</Label>
            <Select value={filtroProducto} onValueChange={setFiltroProducto}>
              <SelectTrigger className="text-base h-12 w-full">
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los productos</SelectItem>
                {productos.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filtroProveedor" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🏢 Proveedor</Label>
            <Input
              id="filtroProveedor"
              type="text"
              placeholder="Escribir nombre del proveedor..."
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">⏳ Cargando compras...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Vista móvil - Solo tarjetas */}
          <div className="block lg:hidden space-y-3">
            {comprasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-4xl mb-2">🛒</div>
                <div className="text-lg">No se encontraron compras</div>
              </div>
            ) : (
              comprasFiltradas.map(c => (
                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">🛒 {c.producto_nombre}</div>
                      <Badge variant="default" className="text-sm px-3 py-1 bg-blue-600">
                        {c.cantidad} packs
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-base mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">💰 Precio total:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">${c.precio_total}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📅 Fecha:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(c.fecha).toLocaleDateString('es-AR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">🕐 Hora:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(c.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">🏢 Proveedor:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{c.proveedor || 'Sin proveedor'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">👤 Responsable:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{c.responsable || 'Sin responsable'}</span>
                      </div>
                      {c.observacion && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 dark:text-gray-400">📝 Observación:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{c.observacion}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEdit(c)} 
                          disabled={loadingBtn}
                          className="flex-1 text-base py-3 h-auto font-medium"
                        >
                          ✏️ Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDelete(c.id)} 
                          disabled={loadingBtn}
                          className="flex-1 text-base py-3 h-auto font-medium"
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>
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
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Total</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasFiltradas.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">🛒 {c.producto_nombre}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-600">
                          {c.cantidad} packs
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 dark:text-green-400">
                        ${c.precio_total}
                      </TableCell>
                      <TableCell>{c.proveedor || 'Sin proveedor'}</TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(c.fecha).toLocaleDateString('es-AR')}</div>
                          <div className="text-xs text-gray-500">{new Date(c.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </TableCell>
                      <TableCell>{c.responsable || 'Sin responsable'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(c)} disabled={loadingBtn} className="text-xs px-2 py-1 h-6">
                              ✏️ Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} disabled={loadingBtn} className="text-xs px-2 py-1 h-6">
                              🗑️ Eliminar
                            </Button>
                          </div>
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

      {/* Modal nueva/editar compra */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editId ? '✏️ Editar Compra' : '🛒 Nueva Compra'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {editId ? 'Modificá los datos de la compra.' : 'Registrá una nueva compra de productos.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="producto_id" className="text-base font-medium text-gray-900 dark:text-gray-100">📦 Producto*</Label>
              <Select value={form.producto_id} onValueChange={(value) => setForm({...form, producto_id: value})}>
                <SelectTrigger className="text-base h-12">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="cantidad" className="text-base font-medium text-gray-900 dark:text-gray-100">📊 Cantidad de packs*</Label>
              <Input
                id="cantidad"
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad de packs comprados"
                required
                min="1"
                className="text-base h-12"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="precio_total" className="text-base font-medium text-gray-900 dark:text-gray-100">💰 Precio total*</Label>
              <Input
                id="precio_total"
                type="number"
                name="precio_total"
                value={form.precio_total}
                onChange={handleChange}
                placeholder="Precio total de la compra"
                required
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
            
            <div className="space-y-3">
              <Label htmlFor="responsable" className="text-base font-medium text-gray-900 dark:text-gray-100">👤 Responsable</Label>
              <Input
                id="responsable"
                type="text"
                name="responsable"
                value={form.responsable}
                onChange={handleChange}
                placeholder="Nombre del responsable"
                className="text-base h-12"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="observacion" className="text-base font-medium text-gray-900 dark:text-gray-100">📝 Observación</Label>
              <Input
                id="observacion"
                type="text"
                name="observacion"
                value={form.observacion}
                onChange={handleChange}
                placeholder="Observaciones adicionales"
                className="text-base h-12"
              />
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" className="w-full text-base py-4 h-auto font-medium" disabled={loadingBtn}>
                {loadingBtn ? '⏳ Guardando...' : (editId ? '💾 Guardar Cambios' : '🛒 Registrar Compra')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-full text-base py-4 h-auto font-medium">
                ❌ Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComprasSection; 