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

function NuevaActividadModal({ open, onClose, onSubmit, initialData, modo }) {
  const [form, setForm] = useState(initialData || {
    nombre: '',
    descripcion: '',
    instructor: '',
    horario: '',
    dias_semana: '',
    cupo_maximo: '',
    precio: '',
    estado: 'activa',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.instructor || !form.horario || !form.dias_semana) {
      toast.error('Nombre, instructor, horario y días de semana son obligatorios');
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
            {modo === 'editar' ? '✏️ Editar Actividad' : '🏃‍♂️ Nueva Actividad'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {modo === 'editar' ? 'Modificá los datos de la actividad.' : 'Completá los datos para registrar una nueva actividad.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="nombre" className="text-base font-medium text-gray-900 dark:text-gray-100">🏃‍♂️ Nombre*</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})}
                placeholder="Ej: Fútbol"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="instructor" className="text-base font-medium text-gray-900 dark:text-gray-100">👨‍🏫 Instructor*</Label>
              <Input
                id="instructor"
                value={form.instructor}
                onChange={(e) => setForm({...form, instructor: e.target.value})}
                placeholder="Nombre del instructor"
                required
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="descripcion" className="text-base font-medium text-gray-900 dark:text-gray-100">📝 Descripción</Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Descripción de la actividad"
              className="text-base h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="horario" className="text-base font-medium text-gray-900 dark:text-gray-100">🕐 Horario*</Label>
              <Input
                id="horario"
                value={form.horario}
                onChange={(e) => setForm({...form, horario: e.target.value})}
                placeholder="Ej: 18:00-20:00"
                required
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="dias_semana" className="text-base font-medium text-gray-900 dark:text-gray-100">📅 Días de Semana*</Label>
              <Input
                id="dias_semana"
                value={form.dias_semana}
                onChange={(e) => setForm({...form, dias_semana: e.target.value})}
                placeholder="Ej: Lunes, Miércoles, Viernes"
                required
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Label htmlFor="cupo_maximo" className="text-base font-medium text-gray-900 dark:text-gray-100">👥 Cupo Máximo</Label>
              <Input
                id="cupo_maximo"
                type="number"
                value={form.cupo_maximo}
                onChange={(e) => setForm({...form, cupo_maximo: e.target.value})}
                placeholder="Ej: 25"
                min="1"
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="precio" className="text-base font-medium text-gray-900 dark:text-gray-100">💰 Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({...form, precio: e.target.value})}
                placeholder="Ej: 5000.00"
                min="0"
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
                    <SelectItem value="activa">✅ Activa</SelectItem>
                    <SelectItem value="inactiva">⏸️ Inactiva</SelectItem>
                    <SelectItem value="suspendida">🚫 Suspendida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="fecha_inicio" className="text-base font-medium text-gray-900 dark:text-gray-100">📅 Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({...form, fecha_inicio: e.target.value})}
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="fecha_fin" className="text-base font-medium text-gray-900 dark:text-gray-100">📅 Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({...form, fecha_fin: e.target.value})}
                className="text-base h-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full text-base py-4 h-auto font-medium" disabled={loading}>
              {loading ? '⏳ Guardando...' : (modo === 'editar' ? '💾 Guardar Cambios' : '💾 Crear Actividad')}
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

function ActividadesSection() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editActividad, setEditActividad] = useState(null);
  const [modo, setModo] = useState('crear');
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroBuscar, setFiltroBuscar] = useState('');
  const [actividadExpandida, setActividadExpandida] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const [actividadesOriginales, setActividadesOriginales] = useState([]);

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/actividades`);
      if (!res.ok) throw new Error('Error al cargar actividades');
      const data = await res.json();
      setActividadesOriginales(data);
      setActividades(data);
      setError('');
    } catch (err) {
      setError('Error al cargar actividades');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  // Filtrar actividades localmente
  useEffect(() => {
    let actividadesFiltradas = actividadesOriginales;

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      actividadesFiltradas = actividadesFiltradas.filter(actividad => actividad.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (filtroBuscar.trim()) {
      const busqueda = filtroBuscar.toLowerCase();
      actividadesFiltradas = actividadesFiltradas.filter(actividad => 
        actividad.nombre.toLowerCase().includes(busqueda) ||
        actividad.descripcion.toLowerCase().includes(busqueda) ||
        actividad.instructor.toLowerCase().includes(busqueda)
      );
    }

    setActividades(actividadesFiltradas);
  }, [filtroEstado, filtroBuscar, actividadesOriginales]);

  const handleSubmit = modo === 'crear' ? handleCreateActividad : handleEditActividad;

  async function handleCreateActividad(form) {
    try {
      const res = await fetch(`${apiUrl}/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear actividad');
      setActividades(prev => [...prev, data]);
      setModalOpen(false);
      toast.success('Actividad creada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al crear actividad');
    }
  }

  async function handleEditActividad(form) {
    try {
      const res = await fetch(`${apiUrl}/actividades/${editActividad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al editar actividad');
      setActividades(prev => prev.map(a => a.id === data.id ? data : a));
      setEditActividad(null);
      setModalOpen(false);
      setModo('crear');
      toast.success('Actividad editada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al editar actividad');
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar la actividad?')) return;
    try {
      const res = await fetch(`${apiUrl}/actividades/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      setActividades(prev => prev.filter(a => a.id !== id));
      toast.success('Actividad eliminada');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar actividad');
    }
  };

  const handleOpenModal = (actividad = null) => {
    if (actividad) {
      setEditActividad(actividad);
      setModo('editar');
    } else {
      setEditActividad(null);
      setModo('crear');
    }
    setModalOpen(true);
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      activa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactiva: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      suspendida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[estado] || colors.activa;
  };

  const formatPrecio = (precio) => {
    if (!precio) return '-';
    return `$${parseFloat(precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) return <div>Cargando actividades...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">🏃‍♂️ Gestión de Actividades</h2>
        <Button 
          onClick={() => handleOpenModal()} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nueva Actividad
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="filtroBuscar" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🔍 Buscar actividad</Label>
            <Input
              id="filtroBuscar"
              placeholder="Escribir nombre, descripción o instructor..."
              value={filtroBuscar}
              onChange={(e) => setFiltroBuscar(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
          <div>
            <Label htmlFor="filtroEstado" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📊 Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="text-base h-12 w-full">
                <SelectValue placeholder="Todas las actividades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las actividades</SelectItem>
                <SelectItem value="activa">✅ Activas</SelectItem>
                <SelectItem value="inactiva">⏸️ Inactivas</SelectItem>
                <SelectItem value="suspendida">🚫 Suspendidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vista móvil - Solo tarjetas */}
      <div className="block lg:hidden space-y-3">
        {actividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-2">🏃‍♂️</div>
            <div className="text-lg">No se encontraron actividades</div>
          </div>
        ) : (
          actividades.map(actividad => (
            <div 
              key={actividad.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    🏃‍♂️ {actividad.nombre}
                  </div>
                  <Badge className={`text-sm px-3 py-1 ${getEstadoBadge(actividad.estado)}`}>
                    {actividad.estado === 'activa' ? '✅ Activa' : actividad.estado === 'inactiva' ? '⏸️ Inactiva' : '🚫 Suspendida'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-base mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">👨‍🏫 Instructor:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{actividad.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🕐 Horario:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{actividad.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📅 Días:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{actividad.dias_semana}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">💰 Precio:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrecio(actividad.precio)}</span>
                  </div>
                  {actividad.descripcion && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📝 Descripción:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{actividad.descripcion}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleOpenModal(actividad)}
                    className="flex-1 text-base py-3 h-auto font-medium"
                  >
                    ✏️ Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(actividad.id)}
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
                <TableHead>Actividad</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividades.map(actividad => (
                <TableRow key={actividad.id}>
                  <TableCell className="font-medium">{actividad.nombre}</TableCell>
                  <TableCell>{actividad.instructor}</TableCell>
                  <TableCell>{actividad.horario}</TableCell>
                  <TableCell>{actividad.dias_semana}</TableCell>
                  <TableCell>{formatPrecio(actividad.precio)}</TableCell>
                  <TableCell>
                    <Badge className={`text-sm px-3 py-1 ${getEstadoBadge(actividad.estado)}`}>
                      {actividad.estado === 'activa' ? '✅ Activa' : actividad.estado === 'inactiva' ? '⏸️ Inactiva' : '🚫 Suspendida'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenModal(actividad)}>
                        ✏️ Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(actividad.id)}>
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


      <NuevaActividadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditActividad(null);
          setModo('crear');
        }}
        onSubmit={handleSubmit}
        initialData={editActividad}
        modo={modo}
      />
    </div>
  );
}

export default ActividadesSection;
