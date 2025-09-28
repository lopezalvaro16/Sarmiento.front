import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
];

function MantenimientoSection() {
  const [tareas, setTareas] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCancha, setFiltroCancha] = useState('todas');
  const [form, setForm] = useState({ fecha: '', descripcion: '', responsable: '', cancha: '' });
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingEstadoId, setLoadingEstadoId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar tareas y establecimientos en paralelo
        const [tareasRes, establecimientosRes] = await Promise.all([
          fetch(`${apiUrl}/mantenimientos`),
          fetch(`${apiUrl}/establecimientos`)
        ]);
        
        const tareasData = await tareasRes.json();
        const establecimientosData = await establecimientosRes.json();
        
        setTareas(tareasData);
        setEstablecimientos(establecimientosData);
        
        // Mantener canchas para compatibilidad con filtros existentes
        const unicas = Array.from(new Set(tareasData.map(t => String(t.cancha))));
        setCanchas(unicas);
        setError('');
      } catch (err) {
        setError('Error al cargar datos');
      }
      setLoading(false);
    };
    fetchData();
  }, [filtroEstado, filtroCancha, agregando]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.cancha) return;
    setLoadingBtn(true);
    try {
      const res = await fetch(`${apiUrl}/mantenimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estado: 'pendiente' }),
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      const nueva = await res.json();
      setForm({ fecha: '', descripcion: '', responsable: '', cancha: '' });
      setTareas(prev => [nueva, ...prev]);
      setError('');
      toast.success('Tarea creada con éxito');
    } catch (err) {
      toast.error('Error al crear tarea');
    }
    setLoadingBtn(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingEstadoId(id);
    try {
      const res = await fetch(`${apiUrl}/mantenimientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      const actualizada = await res.json();
      setTareas(prev => prev.map(t => t.id === id ? actualizada : t));
      setError('');
      toast.success('Estado actualizado con éxito');
    } catch (err) {
      toast.error('Error al cambiar estado');
    }
    setLoadingEstadoId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Mantenimiento de Lugares</h2>
        <Button 
          onClick={() => setModalOpen(true)} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Agregar Tarea
        </Button>
      </div>

      {/* Filtros súper simples */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filtroEstado" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">📊 Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="text-base h-12">
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
            <Label htmlFor="filtroCancha" className="text-base font-medium text-gray-900 dark:text-gray-100 block mb-2">🏢 Establecimiento</Label>
            <Select value={filtroCancha} onValueChange={setFiltroCancha}>
              <SelectTrigger className="text-base h-12">
                <SelectValue placeholder="Todos los establecimientos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los establecimientos</SelectItem>
                {establecimientos.map(establecimiento => (
                  <SelectItem key={establecimiento.id} value={establecimiento.nombre}>
                    {establecimiento.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{typeof error === 'string' ? error : 'Ocurrió un error inesperado.'}</div>
      ) : (
        <>
          {/* Tarjetas simples para usuarios mayores */}
          <div className="space-y-3">
            {tareas.map(t => (
              <div key={t.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      🏢 {t.cancha}
                    </div>
                    <Badge 
                      variant={
                        t.estado === 'finalizada' ? 'default' : 
                        t.estado === 'en_curso' ? 'secondary' : 'outline'
                      } 
                      className="text-sm px-3 py-1"
                    >
                      {t.estado}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-base mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📅 Fecha:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{t.fecha.slice(0,10)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📝 Descripción:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{t.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">👤 Responsable:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{t.responsable || 'Sin asignar'}</span>
                    </div>
                  </div>
                  
                  {/* Botones de acción - Solo si no está finalizada */}
                  {t.estado !== 'finalizada' && (
                    <div className="flex gap-3">
                      {t.estado !== 'en_curso' && (
                        <Button 
                          variant="secondary" 
                          onClick={() => cambiarEstado(t.id, 'en_curso')} 
                          disabled={loadingEstadoId === t.id}
                          className="flex-1 text-base py-3 h-auto font-medium"
                        >
                          {loadingEstadoId === t.id ? '⏳ Cargando...' : '🔄 En curso'}
                        </Button>
                      )}
                      <Button 
                        onClick={() => cambiarEstado(t.id, 'finalizada')} 
                        disabled={loadingEstadoId === t.id}
                        className="flex-1 text-base py-3 h-auto font-medium"
                      >
                        {loadingEstadoId === t.id ? '⏳ Cargando...' : '✅ Finalizar'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Establecimiento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tareas.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.fecha.slice(0,10)}</TableCell>
                    <TableCell>{t.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant={
                        t.estado === 'finalizada' ? 'default' : 
                        t.estado === 'en_curso' ? 'secondary' : 'outline'
                      }>
                        {t.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.responsable || '-'}</TableCell>
                    <TableCell>{t.cancha}</TableCell>
                    <TableCell>
                      {t.estado !== 'finalizada' && (
                        <div className="flex gap-2">
                          {t.estado !== 'en_curso' && (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => cambiarEstado(t.id, 'en_curso')} 
                              disabled={loadingEstadoId === t.id}
                            >
                              {loadingEstadoId === t.id ? 'Cargando...' : 'En curso'}
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => cambiarEstado(t.id, 'finalizada')} 
                            disabled={loadingEstadoId === t.id}
                          >
                            {loadingEstadoId === t.id ? 'Cargando...' : 'Finalizar'}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">🔧 Agregar Tarea de Mantenimiento</DialogTitle>
            <DialogDescription className="text-base">
              Completá los datos para registrar una nueva tarea de mantenimiento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={e => { 
            handleSubmit(e); 
            setModalOpen(false); 
            setEstablecimientoSeleccionado('');
            setForm({ fecha: '', descripcion: '', responsable: '', cancha: '' });
          }} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="fecha" className="text-base font-medium text-gray-900 dark:text-gray-100">📅 Fecha*</Label>
              <Input 
                id="fecha" 
                type="date" 
                name="fecha" 
                value={form.fecha} 
                onChange={handleChange} 
                required 
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="descripcion" className="text-base font-medium text-gray-900 dark:text-gray-100">📝 Descripción*</Label>
              <Input 
                id="descripcion" 
                type="text" 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleChange} 
                placeholder="Descripción de la tarea..." 
                required 
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
                placeholder="Nombre del responsable..." 
                className="text-base h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="cancha" className="text-base font-medium text-gray-900 dark:text-gray-100">🏢 Establecimiento*</Label>
              <Select value={establecimientoSeleccionado} onValueChange={(value) => {
                setEstablecimientoSeleccionado(value);
                setForm({...form, cancha: value});
              }}>
                <SelectTrigger className="text-base h-12">
                  <SelectValue placeholder="Seleccionar establecimiento" />
                </SelectTrigger>
                <SelectContent>
                  {establecimientos.map(establecimiento => (
                    <SelectItem key={establecimiento.id} value={establecimiento.nombre}>
                      {establecimiento.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" className="w-full text-base py-4 h-auto font-medium" disabled={loadingBtn}>
                {loadingBtn ? '⏳ Guardando...' : '💾 Agregar Tarea'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setModalOpen(false);
                setEstablecimientoSeleccionado('');
                setForm({ fecha: '', descripcion: '', responsable: '', cancha: '' });
              }} className="w-full text-base py-4 h-auto font-medium">
                ❌ Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MantenimientoSection; 