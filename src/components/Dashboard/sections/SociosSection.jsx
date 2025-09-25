import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
          <DialogTitle>{modo === 'editar' ? 'Editar Socio' : 'Nuevo Socio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_socio">Número de Socio*</Label>
              <Input
                id="numero_socio"
                value={form.numero_socio}
                onChange={(e) => setForm({...form, numero_socio: e.target.value})}
                placeholder="Ej: S001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI*</Label>
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => setForm({...form, dni: e.target.value})}
                placeholder="Ej: 12345678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre*</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})}
                placeholder="Nombre del socio"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido*</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => setForm({...form, apellido: e.target.value})}
                placeholder="Apellido del socio"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setForm({...form, telefono: e.target.value})}
                placeholder="Ej: 11-1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})}
              />
            </div>
            {modo === 'editar' && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={form.estado} onValueChange={(value) => setForm({...form, estado: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={form.direccion}
              onChange={(e) => setForm({...form, direccion: e.target.value})}
              placeholder="Dirección completa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Input
              id="observaciones"
              value={form.observaciones}
              onChange={(e) => setForm({...form, observaciones: e.target.value})}
              placeholder="Observaciones adicionales"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (modo === 'editar' ? 'Actualizar' : 'Crear')}
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

  useEffect(() => {
    fetchSocios();
  }, [filtroEstado, filtroBuscar]);

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (filtroBuscar.trim()) params.append('buscar', filtroBuscar.trim());
      
      const res = await fetch(`${apiUrl}/socios?${params}`);
      if (!res.ok) throw new Error('Error al cargar socios');
      const data = await res.json();
      setSocios(data);
      setError('');
    } catch (err) {
      setError('Error al cargar socios');
      console.error('Error:', err);
    }
    setLoading(false);
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Socios</h2>
        <Button onClick={() => handleOpenModal()} className="bg-[#7ed6a7] hover:bg-[#6bc495] text-white">
          + Agregar Socio
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#23272b] rounded-lg shadow">
        <div className="flex-1">
          <Label htmlFor="filtroEstado">Estado</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
              <SelectItem value="suspendido">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="filtroBuscar">Buscar</Label>
          <Input
            id="filtroBuscar"
            placeholder="Nombre, apellido o DNI..."
            value={filtroBuscar}
            onChange={(e) => setFiltroBuscar(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={fetchSocios}
            className="w-full"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de socios compacta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {socios.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#23272b] rounded-lg">
            No se encontraron socios
          </div>
        ) : (
          socios.map(socio => (
            <Card 
              key={socio.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer dark:bg-[#23272b] dark:text-gray-100 ${
                socioExpandido === socio.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSocioExpandido(socioExpandido === socio.id ? null : socio.id)}
            >
              <CardContent className="p-3">
                {/* Información compacta */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {socio.apellido}, {socio.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        #{socio.numero_socio}
                      </p>
                    </div>
                    <Badge className={`text-xs px-2 py-1 ${getEstadoBadge(socio.estado)}`}>
                      {socio.estado}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <p>DNI: {socio.dni}</p>
                    {socio.telefono && <p>Tel: {socio.telefono}</p>}
                  </div>
                  
                  {/* Información expandida */}
                  {socioExpandido === socio.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                          <span className="text-gray-600 dark:text-gray-400 truncate ml-2">{socio.email || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Ingreso:</span>
                          <span className="text-gray-600 dark:text-gray-400">{socio.fecha_ingreso?.slice(0, 10)}</span>
                        </div>
                        {socio.direccion && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Dirección:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-right truncate ml-2">{socio.direccion}</span>
                          </div>
                        )}
                        {socio.observaciones && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Observaciones:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-right truncate ml-2">{socio.observaciones}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenModal(socio)}
                          className="flex-1 text-xs h-6"
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(socio.id)}
                          className="flex-1 text-xs h-6"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
