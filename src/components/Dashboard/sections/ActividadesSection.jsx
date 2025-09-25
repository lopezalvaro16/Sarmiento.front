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
          <DialogTitle>{modo === 'editar' ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre*</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setForm({...form, nombre: e.target.value})}
                placeholder="Ej: Fútbol"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor*</Label>
              <Input
                id="instructor"
                value={form.instructor}
                onChange={(e) => setForm({...form, instructor: e.target.value})}
                placeholder="Nombre del instructor"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Descripción de la actividad"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario">Horario*</Label>
              <Input
                id="horario"
                value={form.horario}
                onChange={(e) => setForm({...form, horario: e.target.value})}
                placeholder="Ej: 18:00-20:00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dias_semana">Días de Semana*</Label>
              <Input
                id="dias_semana"
                value={form.dias_semana}
                onChange={(e) => setForm({...form, dias_semana: e.target.value})}
                placeholder="Ej: Lunes, Miércoles, Viernes"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cupo_maximo">Cupo Máximo</Label>
              <Input
                id="cupo_maximo"
                type="number"
                value={form.cupo_maximo}
                onChange={(e) => setForm({...form, cupo_maximo: e.target.value})}
                placeholder="Ej: 25"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({...form, precio: e.target.value})}
                placeholder="Ej: 5000.00"
                min="0"
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
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="inactiva">Inactiva</SelectItem>
                    <SelectItem value="suspendida">Suspendida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({...form, fecha_inicio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm({...form, fecha_fin: e.target.value})}
              />
            </div>
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

  useEffect(() => {
    fetchActividades();
  }, [filtroEstado, filtroBuscar]);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== 'todas') params.append('estado', filtroEstado);
      if (filtroBuscar.trim()) params.append('buscar', filtroBuscar.trim());
      
      const res = await fetch(`${apiUrl}/actividades?${params}`);
      if (!res.ok) throw new Error('Error al cargar actividades');
      const data = await res.json();
      setActividades(data);
      setError('');
    } catch (err) {
      setError('Error al cargar actividades');
      console.error('Error:', err);
    }
    setLoading(false);
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Actividades</h2>
        <Button onClick={() => handleOpenModal()} className="bg-[#7ed6a7] hover:bg-[#6bc495] text-white">
          + Agregar Actividad
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#23272b] rounded-lg shadow">
        <div className="flex-1">
          <Label htmlFor="filtroEstado">Estado</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las actividades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las actividades</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
              <SelectItem value="suspendida">Suspendidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="filtroBuscar">Buscar</Label>
          <Input
            id="filtroBuscar"
            placeholder="Nombre, descripción o instructor..."
            value={filtroBuscar}
            onChange={(e) => setFiltroBuscar(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={fetchActividades}
            className="w-full"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de actividades compacta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {actividades.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#23272b] rounded-lg">
            No se encontraron actividades
          </div>
        ) : (
          actividades.map(actividad => (
            <Card 
              key={actividad.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer dark:bg-[#23272b] dark:text-gray-100 ${
                actividadExpandida === actividad.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActividadExpandida(actividadExpandida === actividad.id ? null : actividad.id)}
            >
              <CardContent className="p-3">
                {/* Información compacta */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {actividad.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {actividad.instructor}
                      </p>
                    </div>
                    <Badge className={`text-xs px-2 py-1 ${getEstadoBadge(actividad.estado)}`}>
                      {actividad.estado}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <p>{actividad.horario}</p>
                    <p>{actividad.dias_semana}</p>
                    <p className="font-medium">{formatPrecio(actividad.precio)}</p>
                  </div>
                  
                  {/* Información expandida */}
                  {actividadExpandida === actividad.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {actividad.descripcion && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-right truncate ml-2">{actividad.descripcion}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Cupo:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {actividad.cupo_actual || 0} / {actividad.cupo_maximo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Período:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {actividad.fecha_inicio?.slice(0, 10)} - {actividad.fecha_fin?.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenModal(actividad)}
                          className="flex-1 text-xs h-6"
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(actividad.id)}
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
