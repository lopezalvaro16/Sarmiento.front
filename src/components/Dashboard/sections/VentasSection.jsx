import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

function VentasSection() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ producto_id: '', unidad: '', observacion: '', responsable: '' });
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [filtroResponsable, setFiltroResponsable] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/ventas_buffet`);
        const data = await res.json();
        setVentas(Array.isArray(data) ? data : []); // Asegurar que sea array
        setError('');
      } catch (err) {
        setVentas([]); // Inicializar como array vacío en caso de error
        setError('Error al cargar ventas');
      }
      setLoading(false);
    };
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${apiUrl}/productos_buffet`);
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []); // Asegurar que sea array
      } catch (err) {
        setProductos([]); // Inicializar como array vacío en caso de error
      }
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
      toast.success('Venta registrada con éxito');
    } catch (err) {
      toast.error('Error al registrar venta');
      setError('Error al registrar venta');
    }
    setLoadingBtn(false);
  };

  const productoSeleccionado = productos.find(p => p.id == form.producto_id);

  // Filtrar ventas localmente
  const ventasFiltradas = (Array.isArray(ventas) ? ventas : []).filter(v => {
    const cumpleProducto = filtroProducto === 'todos' || v.producto_id.toString() === filtroProducto;
    const cumpleResponsable = filtroResponsable === '' || 
      (v.responsable && v.responsable.toLowerCase().includes(filtroResponsable.toLowerCase()));
    return cumpleProducto && cumpleResponsable;
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">💰 Gestión de Ventas</h2>
        <Button 
          onClick={() => setModalOpen(true)} 
          className="w-full text-lg py-4 h-auto font-bold bg-purple-600 hover:bg-purple-700 text-white"
        >
          ➕ Nueva Venta
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
                {(Array.isArray(productos) ? productos : []).map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filtroResponsable" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">👤 Responsable</Label>
            <Input
              id="filtroResponsable"
              type="text"
              placeholder="Escribir nombre del responsable..."
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">⏳ Cargando ventas...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Vista móvil - Solo tarjetas */}
          <div className="block lg:hidden space-y-3">
            {ventasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-lg">No se encontraron ventas</div>
              </div>
            ) : (
              ventasFiltradas.map(v => (
                <div key={v.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">💰 {v.producto_nombre}</div>
                      <Badge variant="default" className="text-sm px-3 py-1 bg-green-600">
                        {v.cantidad} unidades
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-base mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📅 Fecha:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(v.fecha).toLocaleDateString('es-AR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">🕐 Hora:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">👤 Responsable:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{v.responsable || 'Sin responsable'}</span>
                      </div>
                      {v.observacion && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 dark:text-gray-400">📝 Observación:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{v.observacion}</span>
                        </div>
                      )}
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
                    <TableHead>Unidades</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Observación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasFiltradas.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">💰 {v.producto_nombre}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          {v.cantidad} unidades
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(v.fecha).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell>{new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{v.responsable || 'Sin responsable'}</TableCell>
                      <TableCell>{v.observacion || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Modal nueva venta */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">💰 Nueva Venta</DialogTitle>
            <DialogDescription className="text-base">
              Registrá una nueva venta del buffet.
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
                  {(Array.isArray(productos) ? productos : []).map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="unidad" className="text-base font-medium text-gray-900 dark:text-gray-100">📊 Unidades a vender*</Label>
              <Input
                id="unidad"
                type="number"
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                placeholder={`Unidades a vender${productoSeleccionado ? ` (${productoSeleccionado.unidad} por pack)` : ''}`}
                required
                min="1"
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
                {loadingBtn ? '⏳ Registrando...' : '💰 Registrar Venta'}
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

export default VentasSection; 