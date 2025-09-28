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
          <DialogTitle className="text-lg sm:text-xl">📝 Nueva Inscripción</DialogTitle>
          <DialogDescription className="text-base">
            Inscribí un socio a una actividad.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="socio_id" className="text-base font-medium text-gray-900 dark:text-gray-100">👤 Socio*</Label>
            <Select value={form.socio_id} onValueChange={(value) => setForm({...form, socio_id: value})}>
              <SelectTrigger className="text-base h-12">
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

          <div className="space-y-3">
            <Label htmlFor="actividad_id" className="text-base font-medium text-gray-900 dark:text-gray-100">🏃‍♂️ Actividad*</Label>
            <Select value={form.actividad_id} onValueChange={(value) => setForm({...form, actividad_id: value})}>
              <SelectTrigger className="text-base h-12">
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
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-base space-y-2">
                <div className="font-medium text-blue-900 dark:text-blue-100">📊 Información de cupos:</div>
                <div className="flex justify-between">
                  <span>Cupo máximo:</span>
                  <span className="font-medium">{cuposInfo.cupo_maximo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inscriptos:</span>
                  <span className="font-medium">{cuposInfo.inscriptos}</span>
                </div>
                <div className={`flex justify-between font-bold ${cuposInfo.disponibles > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span>Disponibles:</span>
                  <span>{cuposInfo.disponibles}</span>
                </div>
              </div>
            </div>
          )}

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
            <Button 
              type="submit" 
              disabled={loading || (cuposInfo && cuposInfo.disponibles <= 0)}
              className="w-full text-base py-4 h-auto font-medium"
            >
              {loading ? '⏳ Inscribiendo...' : '📝 Inscribir'}
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

  const [inscripcionesOriginales, setInscripcionesOriginales] = useState([]);

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

      setInscripcionesOriginales(inscripcionesData);
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

  // Filtrar inscripciones localmente
  useEffect(() => {
    let inscripcionesFiltradas = inscripcionesOriginales;

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      inscripcionesFiltradas = inscripcionesFiltradas.filter(inscripcion => inscripcion.estado === filtroEstado);
    }

    // Filtrar por actividad
    if (filtroActividad !== 'todas') {
      inscripcionesFiltradas = inscripcionesFiltradas.filter(inscripcion => inscripcion.actividad_id.toString() === filtroActividad);
    }

    setInscripciones(inscripcionesFiltradas);
  }, [filtroEstado, filtroActividad, inscripcionesOriginales]);

  const handleCreateInscripcion = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear inscripción');
      setInscripcionesOriginales(prev => [...prev, data]);
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
      setInscripcionesOriginales(prev => prev.map(i => i.id === data.id ? data : i));
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
      setInscripcionesOriginales(prev => prev.filter(i => i.id !== id));
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">📝 Gestión de Inscripciones</h2>
        <Button 
          onClick={() => setModalOpen(true)} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nueva Inscripción
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="filtroEstado" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📊 Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="text-base h-12 w-full">
                <SelectValue placeholder="Todas las inscripciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las inscripciones</SelectItem>
                <SelectItem value="activa">✅ Activas</SelectItem>
                <SelectItem value="inactiva">⏸️ Inactivas</SelectItem>
                <SelectItem value="suspendida">🚫 Suspendidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filtroActividad" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🏃‍♂️ Actividad</Label>
            <Select value={filtroActividad} onValueChange={setFiltroActividad}>
              <SelectTrigger className="text-base h-12 w-full">
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
        </div>
      </div>

      {/* Vista móvil - Solo tarjetas */}
      <div className="block lg:hidden space-y-3">
        {inscripciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-lg">No se encontraron inscripciones</div>
          </div>
        ) : (
          inscripciones.map(inscripcion => (
            <div 
              key={inscripcion.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    👤 {inscripcion.socio_apellido}, {inscripcion.socio_nombre}
                  </div>
                  <Select 
                    value={inscripcion.estado} 
                    onValueChange={(value) => handleChangeEstado(inscripcion.id, value)}
                    className="w-32"
                  >
                    <SelectTrigger className="text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activa">✅ Activa</SelectItem>
                      <SelectItem value="inactiva">⏸️ Inactiva</SelectItem>
                      <SelectItem value="suspendida">🚫 Suspendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 text-base mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🆔 Número:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">#{inscripcion.numero_socio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🏃‍♂️ Actividad:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inscripcion.actividad_nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">👨‍🏫 Instructor:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inscripcion.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">🕐 Horario:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inscripcion.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📅 Días:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inscripcion.dias_semana}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">💰 Precio:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrecio(inscripcion.precio)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">📅 Inscripción:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inscripcion.fecha_inscripcion?.slice(0, 10)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(inscripcion.id)}
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
                <TableHead>Socio</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscripciones.map(inscripcion => (
                <TableRow key={inscripcion.id}>
                  <TableCell className="font-medium">{inscripcion.socio_apellido}, {inscripcion.socio_nombre}</TableCell>
                  <TableCell>{inscripcion.actividad_nombre}</TableCell>
                  <TableCell>{inscripcion.instructor}</TableCell>
                  <TableCell>{inscripcion.horario}</TableCell>
                  <TableCell>{formatPrecio(inscripcion.precio)}</TableCell>
                  <TableCell>
                    <Select 
                      value={inscripcion.estado} 
                      onValueChange={(value) => handleChangeEstado(inscripcion.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activa">✅ Activa</SelectItem>
                        <SelectItem value="inactiva">⏸️ Inactiva</SelectItem>
                        <SelectItem value="suspendida">🚫 Suspendida</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(inscripcion.id)}>
                      🗑️ Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
