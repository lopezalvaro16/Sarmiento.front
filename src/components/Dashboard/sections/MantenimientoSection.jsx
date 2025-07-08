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
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
];

function MantenimientoSection() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCancha, setFiltroCancha] = useState('todas');
  const [form, setForm] = useState({ fecha: '', descripcion: '', responsable: '', cancha: '' });
  const [agregando, setAgregando] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loadingEstadoId, setLoadingEstadoId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTareas = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:3001/mantenimientos';
        const params = [];
        if (filtroEstado && filtroEstado !== 'todos') params.push(`estado=${filtroEstado}`);
        if (filtroCancha && filtroCancha !== 'todas') params.push(`cancha=${filtroCancha}`);
        if (params.length) url += '?' + params.join('&');
        const res = await fetch(url);
        const data = await res.json();
        setTareas(data);
        const unicas = Array.from(new Set(data.map(t => String(t.cancha))));
        setCanchas(unicas);
        setError('');
      } catch (err) {
        setError('Error al cargar tareas');
      }
      setLoading(false);
    };
    fetchTareas();
  }, [filtroEstado, filtroCancha, agregando]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fecha || !form.descripcion || !form.cancha) return;
    setLoadingBtn(true);
    try {
      const res = await fetch('http://localhost:3001/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estado: 'pendiente' }),
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      const nueva = await res.json();
      setForm({ fecha: '', descripcion: '', responsable: '', cancha: '' });
      setTareas(prev => [nueva, ...prev]);
      setError('');
      toast({ description: 'Tarea creada con éxito' });
    } catch (err) {
      toast({ description: 'Error al crear tarea', variant: 'destructive' });
    }
    setLoadingBtn(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingEstadoId(id);
    try {
      const res = await fetch(`http://localhost:3001/mantenimientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      const actualizada = await res.json();
      setTareas(prev => prev.map(t => t.id === id ? actualizada : t));
      setError('');
      toast({ description: 'Estado actualizado con éxito' });
    } catch (err) {
      toast({ description: 'Error al cambiar estado', variant: 'destructive' });
    }
    setLoadingEstadoId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Mantenimiento de Canchas</h2>
        <Button onClick={() => setModalOpen(true)}>+ Agregar tarea</Button>
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
          <Label htmlFor="filtroCancha">Cancha</Label>
          <Select value={filtroCancha} onValueChange={setFiltroCancha}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las canchas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las canchas</SelectItem>
              {canchas.map(c => (
                <SelectItem key={c} value={c}>Cancha {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tareas.map(t => (
              <Card key={t.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Cancha {t.cancha}</CardTitle>
                  <Badge variant={
                    t.estado === 'finalizada' ? 'default' : 
                    t.estado === 'en_curso' ? 'secondary' : 'outline'
                  }>
                    {t.estado}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Fecha:</strong> {t.fecha.slice(0,10)}</div>
                  <div><strong>Descripción:</strong> {t.descripcion}</div>
                  <div><strong>Responsable:</strong> {t.responsable || '-'}</div>
                  {t.estado !== 'finalizada' && (
                    <div className="flex gap-2 pt-2">
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
                </CardContent>
              </Card>
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
                  <TableHead>Cancha</TableHead>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar tarea de mantenimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { handleSubmit(e); setModalOpen(false); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input 
                id="fecha" 
                type="date" 
                name="fecha" 
                value={form.fecha} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input 
                id="descripcion" 
                type="text" 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleChange} 
                placeholder="Descripción*" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input 
                id="responsable" 
                type="text" 
                name="responsable" 
                value={form.responsable} 
                onChange={handleChange} 
                placeholder="Responsable" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancha">Cancha</Label>
              <Input 
                id="cancha" 
                type="number" 
                name="cancha" 
                value={form.cancha} 
                onChange={handleChange} 
                placeholder="Cancha*" 
                min="1" 
                required 
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loadingBtn}>
                {loadingBtn ? 'Guardando...' : 'Agregar tarea'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MantenimientoSection; 