import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function NuevoSocioModal({ open, onClose, onSubmit, initialData, modo }) {
  const [form, setForm] = useState(initialData || {
    numero_socio: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    estado: 'activo',
    observaciones: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numero_socio || !form.nombre || !form.apellido || !form.dni) {
      toast.error('Número de socio, nombre, apellido y DNI son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {modo === 'editar' ? '✏️ Editar Socio' : '👤 Nuevo Socio'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {modo === 'editar' ? 'Modificá los datos del socio.' : 'Completá los datos para registrar un nuevo socio.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="numero_socio" className="text-base font-medium text-gray-900 dark:text-gray-100">🆔 Número de Socio*</Label>
              <Input
                id="numero_socio"
                value={form.numero_socio}
                onChange={(e) => setForm({...form, numero_socio: e.target.value})}
                placeholder="Ej: S001"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="dni" className="text-base font-medium text-gray-900 dark:text-gray-100">📄 DNI*</Label>
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => setForm({...form, dni: e.target.value})}
                placeholder="Ej: 12345678"
                required
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="nombre" className="text-base font-medium text-gray-900 dark:text-gray-100">👤 Nombre*</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})}
                placeholder="Nombre del socio"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="apellido" className="text-base font-medium text-gray-900 dark:text-gray-100">👤 Apellido*</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => setForm({...form, apellido: e.target.value})}
                placeholder="Apellido del socio"
                required
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="telefono" className="text-base font-medium text-gray-900 dark:text-gray-100">📞 Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setForm({...form, telefono: e.target.value})}
                placeholder="Ej: 11-1234-5678"
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-gray-100">📧 Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="email@ejemplo.com"
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="fecha_nacimiento" className="text-base font-medium text-gray-900 dark:text-gray-100">🎂 Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})}
                className="text-base h-12"
              />
            </div>
            {modo === 'editar' && (
              <div className="space-y-3">
                <Label htmlFor="estado" className="text-base font-medium text-gray-900 dark:text-gray-100">📊 Estado</Label>
                <Select value={form.estado} onValueChange={(value) => setForm({...form, estado: value})}>
                  <SelectTrigger className="text-base h-12">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">✅ Activo</SelectItem>
                    <SelectItem value="inactivo">⏸️ Inactivo</SelectItem>
                    <SelectItem value="suspendido">🚫 Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="direccion" className="text-base font-medium text-gray-900 dark:text-gray-100">🏠 Dirección</Label>
            <Input
              id="direccion"
              value={form.direccion}
              onChange={(e) => setForm({...form, direccion: e.target.value})}
              placeholder="Dirección completa"
              className="text-base h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="observaciones" className="text-base font-medium text-gray-900 dark:text-gray-100">📝 Observaciones</Label>
            <Input
              id="observaciones"
              value={form.observaciones}
              onChange={(e) => setForm({...form, observaciones: e.target.value})}
              placeholder="Observaciones adicionales"
              className="text-base h-12"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full text-base py-4 h-auto font-medium" disabled={loading}>
              {loading ? '⏳ Guardando...' : (modo === 'editar' ? '💾 Guardar Cambios' : '💾 Crear Socio')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full text-base py-4 h-auto font-medium">
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SociosSection() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSocio, setEditSocio] = useState(null);
  const [modo, setModo] = useState('crear');
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [socioExpandido, setSocioExpandido] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const [sociosOriginales, setSociosOriginales] = useState([]);

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/socios`);
      if (!res.ok) throw new Error('Error al cargar socios');
      const data = await res.json();
      setSociosOriginales(data);
      setSocios(data);
      setError('');
    } catch (err) {
      setError('Error al cargar socios');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  // Filtrar socios localmente
  useEffect(() => {
    let sociosFiltrados = sociosOriginales;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      sociosFiltrados = sociosFiltrados.filter(socio => socio.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (filtroBuscar.trim()) {
      const busqueda = filtroBuscar.toLowerCase();
      sociosFiltrados = sociosFiltrados.filter(socio => 
        socio.nombre.toLowerCase().includes(busqueda) ||
        socio.apellido.toLowerCase().includes(busqueda) ||
        socio.dni.includes(busqueda) ||
        socio.numero_socio.toLowerCase().includes(busqueda)
      );
    }

    setSocios(sociosFiltrados);
  }, [filtroEstado, filtroBuscar, sociosOriginales]);

  const handleSubmit = modo === 'crear' ? handleCreateSocio : handleEditSocio;

  async function handleCreateSocio(form) {
    try {
      const res = await fetch(`${apiUrl}/socios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear socio');
      setSocios(prev => [...prev, data]);
      setModalOpen(false);
      toast.success('Socio creado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al crear socio');
    }
  }

  async function handleEditSocio(form) {
    try {
      const res = await fetch(`${apiUrl}/socios/${editSocio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al editar socio');
      setSocios(prev => prev.map(s => s.id === data.id ? data : s));
      setEditSocio(null);
      setModalOpen(false);
      setModo('crear');
      toast.success('Socio editado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al editar socio');
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar el socio?')) return;
    try {
      const res = await fetch(`${apiUrl}/socios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      setSocios(prev => prev.filter(s => s.id !== id));
      toast.success('Socio eliminado');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar socio');
    }
  };

  const handleOpenModal = (socio = null) => {
    if (socio) {
      setEditSocio(socio);
      setModo('editar');
    } else {
      setEditSocio(null);
      setModo('crear');
    }
    setModalOpen(true);
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactivo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      suspendido: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[estado] || colors.activo;
  };

  if (loading) return <div>Cargando socios...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">👥 Gestión de Socios</h2>
        <Button 
          onClick={() => handleOpenModal()} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nuevo Socio
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="filtroBuscar" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🔍 Buscar socio</Label>
            <Input
              id="filtroBuscar"
              placeholder="Escribir nombre, apellido o DNI..."
              value={filtroBuscar}
              onChange={(e) => setFiltroBuscar(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
          <div>
            <Label htmlFor="filtroEstado" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📊 Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="text-base h-12 w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">✅ Activos</SelectItem>
                <SelectItem value="inactivo">⏸️ Inactivos</SelectItem>
                <SelectItem value="suspendido">🚫 Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vista móvil - Solo tarjetas */}
      <div className="block lg:hidden space-y-3">
        {socios.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-lg">No se encontraron socios</div>
          </div>
        ) : (
          socios.map(socio => (
            <div 
              key={socio.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    👤 {socio.apellido}, {socio.nombre}
                  </div>
                  <Badge className={`text-sm px-3 py-1 ${getEstadoBadge(socio.estado)}`}>
                    {socio.estado === 'activo' ? '✅ Activo' : socio.estado === 'inactivo' ? '⏸️ Inactivo' : '🚫 Suspendido'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-base mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🆔 Número:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">#{socio.numero_socio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📄 DNI:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{socio.dni}</span>
                  </div>
                  {socio.telefono && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📞 Teléfono:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{socio.telefono}</span>
                    </div>
                  )}
                  {socio.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📧 Email:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{socio.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleOpenModal(socio)}
                    className="flex-1 text-base py-3 h-auto font-medium"
                  >
                    ✏️ Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(socio.id)}
                    className="flex-1 text-base py-3 h-auto font-medium"
                  >
                    🗑️ Eliminar
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
                <TableHead>Nombre</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socios.map(socio => (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">{socio.apellido}, {socio.nombre}</TableCell>
                  <TableCell>#{socio.numero_socio}</TableCell>
                  <TableCell>{socio.dni}</TableCell>
                  <TableCell>{socio.telefono || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`text-sm px-3 py-1 ${getEstadoBadge(socio.estado)}`}>
                      {socio.estado === 'activo' ? '✅ Activo' : socio.estado === 'inactivo' ? '⏸️ Inactivo' : '🚫 Suspendido'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(socio)}>
                        ✏️ Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(socio.id)}>
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <NuevoSocioModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSocio(null);
          setModo('crear');
        }}
        onSubmit={handleSubmit}
        initialData={editSocio}
        modo={modo}
      />
    </div>
  );
}

export default SociosSection;
