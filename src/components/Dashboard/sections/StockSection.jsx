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
      toast({ description: editId ? 'Producto editado con éxito' : 'Producto agregado con éxito' });
    } catch (err) {
      toast({ description: 'Error al guardar producto', variant: 'destructive' });
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
      const res = await fetch(`http://localhost:3001/productos_buffet/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      toast({ description: 'Producto dado de baja con éxito' });
    } catch (err) {
      toast({ description: 'Error al eliminar producto', variant: 'destructive' });
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Stock de Buffet</h2>
        <Button onClick={handleOpenModal}>+ Agregar producto</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="filtroEstado">Estado</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map(e => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="busqueda">Buscar producto</Label>
          <Input
            id="busqueda"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productosFiltrados.map(p => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{p.nombre}</CardTitle>
                  <Badge variant={p.estado === 'activo' ? 'default' : 'secondary'}>
                    {p.estado}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Cantidad:</strong> {p.cantidad}</div>
                  <div><strong>Unidad:</strong> {p.unidad}</div>
                  <div><strong>Precio:</strong> {p.precio ? `$${p.precio}` : '-'}</div>
                  <div><strong>Proveedor:</strong> {p.proveedor || '-'}</div>
                  <div><strong>Stock total:</strong> {parseInt(p.cantidad || 0) * parseInt(p.unidad || 1)} unidades</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(p)} disabled={loadingBtn}>
                      Editar
                    </Button>
                    {p.estado === 'activo' && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)} disabled={loadingBtn}>
                        Dar de baja
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => handleOpenHistorial(p)}>
                      Ver historial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cantidad (packs)</TableHead>
                  <TableHead>Unidad (por pack)</TableHead>
                  <TableHead>Stock total (unidades)</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{p.cantidad}</TableCell>
                    <TableCell>{p.unidad}</TableCell>
                    <TableCell>{parseInt(p.cantidad || 0) * parseInt(p.unidad || 1)}</TableCell>
                    <TableCell>{p.precio ? `$${p.precio}` : '-'}</TableCell>
                    <TableCell>{p.proveedor || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={p.estado === 'activo' ? 'default' : 'secondary'}>
                        {p.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(p)} disabled={loadingBtn}>
                          Editar
                        </Button>
                        {p.estado === 'activo' && (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)} disabled={loadingBtn}>
                            Dar de baja
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handleOpenHistorial(p)}>
                          Historial
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Modal alta/edición */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar producto' : 'Agregar producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre*"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="text"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad* (Ej: 10 6)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad</Label>
              <Input
                id="unidad"
                type="text"
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                placeholder="Unidad*"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                placeholder="Proveedor"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loadingBtn}>
                {loadingBtn ? 'Guardando...' : (editId ? 'Guardar cambios' : 'Agregar producto')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal historial */}
      <Dialog open={historialModalOpen} onOpenChange={handleCloseHistorial}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de movimientos - {movProdNombre}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.fecha}</TableCell>
                    <TableCell>{m.tipo}</TableCell>
                    <TableCell>{m.cantidad}</TableCell>
                    <TableCell>{m.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {movimientos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay movimientos registrados
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StockSection;