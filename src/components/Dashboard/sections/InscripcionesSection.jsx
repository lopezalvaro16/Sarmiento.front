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

function NuevaInscripcionModal({ open, onClose, onSubmit, socios, actividades }) {
  const [form, setForm] = useState({
    socio_id: '',
    actividad_id: '',
    observaciones: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [cuposInfo, setCuposInfo] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Cargar información de cupos cuando se selecciona una actividad
  useEffect(() => {
    if (form.actividad_id) {
      fetchCuposInfo(form.actividad_id);
    } else {
      setCuposInfo(null);
    }
  }, [form.actividad_id]);

  const fetchCuposInfo = async (actividadId) => {
    try {
      const res = await fetch(`${apiUrl}/inscripciones/cupos/${actividadId}`);
      if (res.ok) {
        const data = await res.json();
        setCuposInfo(data);
      }
    } catch (err) {
      console.error('Error al cargar cupos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.socio_id || !form.actividad_id) {
      toast.error('Socio y actividad son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ socio_id: '', actividad_id: '', observaciones: '' });
      setCuposInfo(null);
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto my-auto">
        <DialogHeader>
          <DialogTitle>Nueva Inscripción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socio_id">Socio*</Label>
            <Select value={form.socio_id} onValueChange={(value) => setForm({...form, socio_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar socio" />
              </SelectTrigger>
              <SelectContent>
                {socios.filter(s => s.estado === 'activo').map(socio => (
                  <SelectItem key={socio.id} value={socio.id.toString()}>
                    {socio.numero_socio} - {socio.apellido}, {socio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actividad_id">Actividad*</Label>
            <Select value={form.actividad_id} onValueChange={(value) => setForm({...form, actividad_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actividad" />
              </SelectTrigger>
              <SelectContent>
                {actividades.filter(a => a.estado === 'activa').map(actividad => (
                  <SelectItem key={actividad.id} value={actividad.id.toString()}>
                    {actividad.nombre} - {actividad.instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cuposInfo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="font-medium">Información de cupos:</div>
                <div>Cupo máximo: {cuposInfo.cupo_maximo}</div>
                <div>Inscriptos: {cuposInfo.inscriptos}</div>
                <div className={cuposInfo.disponibles > 0 ? 'text-green-600' : 'text-red-600'}>
                  Disponibles: {cuposInfo.disponibles}
                </div>
              </div>
            </div>
          )}

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
            <Button 
              type="submit" 
              disabled={loading || (cuposInfo && cuposInfo.disponibles <= 0)}
            >
              {loading ? 'Inscribiendo...' : 'Inscribir'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InscripcionesSection() {
  const [inscripciones, setInscripciones] = useState([]);
  const [socios, setSocios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroActividad, setFiltroActividad] = useState('todas');
  const [inscripcionExpandida, setInscripcionExpandida] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchInscripciones();
  }, [filtroEstado, filtroActividad]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inscripcionesRes, sociosRes, actividadesRes] = await Promise.all([
        fetch(`${apiUrl}/inscripciones`),
        fetch(`${apiUrl}/socios`),
        fetch(`${apiUrl}/actividades`)
      ]);

      if (!inscripcionesRes.ok || !sociosRes.ok || !actividadesRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const [inscripcionesData, sociosData, actividadesData] = await Promise.all([
        inscripcionesRes.json(),
        sociosRes.json(),
        actividadesRes.json()
      ]);

      setInscripciones(inscripcionesData);
      setSocios(sociosData);
      setActividades(actividadesData);
      setError('');
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const fetchInscripciones = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== 'todas') params.append('estado', filtroEstado);
      if (filtroActividad !== 'todas') params.append('actividad_id', filtroActividad);
      
      const res = await fetch(`${apiUrl}/inscripciones?${params}`);
      if (!res.ok) throw new Error('Error al cargar inscripciones');
      const data = await res.json();
      setInscripciones(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreateInscripcion = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear inscripción');
      setInscripciones(prev => [...prev, data]);
      setModalOpen(false);
      toast.success('Inscripción creada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al crear inscripción');
    }
  };

  const handleChangeEstado = async (id, nuevoEstado) => {
    try {
      const fechaBaja = nuevoEstado !== 'activa' ? new Date().toISOString().split('T')[0] : null;
      
      const res = await fetch(`${apiUrl}/inscripciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: nuevoEstado,
          fecha_baja: fechaBaja
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado');
      setInscripciones(prev => prev.map(i => i.id === data.id ? data : i));
      toast.success('Estado actualizado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar la inscripción?')) return;
    try {
      const res = await fetch(`${apiUrl}/inscripciones/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      setInscripciones(prev => prev.filter(i => i.id !== id));
      toast.success('Inscripción eliminada');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar inscripción');
    }
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

  if (loading) return <div>Cargando inscripciones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Inscripciones</h2>
        <Button onClick={() => setModalOpen(true)} className="bg-[#7ed6a7] hover:bg-[#6bc495] text-white">
          + Nueva Inscripción
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#23272b] rounded-lg shadow">
        <div className="flex-1">
          <Label htmlFor="filtroEstado">Estado</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las inscripciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las inscripciones</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
              <SelectItem value="suspendida">Suspendidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="filtroActividad">Actividad</Label>
          <Select value={filtroActividad} onValueChange={setFiltroActividad}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las actividades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las actividades</SelectItem>
              {actividades.map(actividad => (
                <SelectItem key={actividad.id} value={actividad.id.toString()}>
                  {actividad.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={fetchInscripciones}
            className="w-full"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de inscripciones compacta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {inscripciones.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#23272b] rounded-lg">
            No se encontraron inscripciones
          </div>
        ) : (
          inscripciones.map(inscripcion => (
            <Card 
              key={inscripcion.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer dark:bg-[#23272b] dark:text-gray-100 ${
                inscripcionExpandida === inscripcion.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setInscripcionExpandida(inscripcionExpandida === inscripcion.id ? null : inscripcion.id)}
            >
              <CardContent className="p-3">
                {/* Información compacta */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {inscripcion.socio_apellido}, {inscripcion.socio_nombre}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        #{inscripcion.numero_socio}
                      </p>
                    </div>
                    <Select 
                      value={inscripcion.estado} 
                      onValueChange={(value) => handleChangeEstado(inscripcion.id, value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectTrigger className="w-20 h-5 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="inactiva">Inactiva</SelectItem>
                        <SelectItem value="suspendida">Suspendida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <p className="font-medium">{inscripcion.actividad_nombre}</p>
                    <p>{inscripcion.horario}</p>
                    <p>{inscripcion.dias_semana}</p>
                  </div>
                  
                  {/* Información expandida */}
                  {inscripcionExpandida === inscripcion.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Instructor:</span>
                          <span className="text-gray-600 dark:text-gray-400">{inscripcion.instructor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Precio:</span>
                          <span className="text-gray-600 dark:text-gray-400">{formatPrecio(inscripcion.precio)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Inscripción:</span>
                          <span className="text-gray-600 dark:text-gray-400">{inscripcion.fecha_inscripcion?.slice(0, 10)}</span>
                        </div>
                        {inscripcion.fecha_baja && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de baja:</span>
                            <span className="text-gray-600 dark:text-gray-400">{inscripcion.fecha_baja?.slice(0, 10)}</span>
                          </div>
                        )}
                        {inscripcion.observaciones && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Observaciones:</span>
                            <span className="text-gray-600 dark:text-gray-400 text-right truncate ml-2">{inscripcion.observaciones}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Botón de acción */}
                      <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(inscripcion.id)}
                          className="w-full text-xs h-6"
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

      <NuevaInscripcionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateInscripcion}
        socios={socios}
        actividades={actividades}
      />
    </div>
  );
}

export default InscripcionesSection;
