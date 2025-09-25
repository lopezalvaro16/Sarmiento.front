import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import Toast from './Toast';

// Definir el rango de horarios permitidos (0 a 23)
const HORAS_PERMITIDAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS_PERMITIDOS = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, ..., 55

function NuevaReservaModal({ open, onClose, onSubmit, initialData, modo, reservas, establecimientos }) {
  const [form, setForm] = useState(initialData || {
    fecha: '',
    hora_desde: '',
    hora_hasta: '',
    cancha: '',
    socio: '',
    estado: 'Pendiente',
  });
  const [error, setError] = useState('');
  
  useEffect(() => {
    setForm(initialData || {
      fecha: '', hora_desde: '', hora_hasta: '', cancha: '', socio: '', estado: 'Pendiente',
    });
  }, [initialData, open]);
  
  if (!open) return null;
  
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Helper para armar el valor de hora:minuto
  const getHoraMinuto = (hora, minuto) => hora && minuto ? `${hora}:${minuto}` : '';

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.fecha || !form.hora_desde || !form.hora_hasta || !form.cancha || !form.socio) {
      setError('Completá todos los campos obligatorios.');
      return;
    }
    if (form.hora_hasta <= form.hora_desde) {
      setError('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    const now = new Date();
    const reservaDate = new Date(`${form.fecha}T${form.hora_desde}`);
    if (reservaDate < now) {
      setError('No se puede reservar en el pasado.');
      return;
    }
    const existe = reservas.some(r =>
      r.fecha === form.fecha &&
      String(r.cancha) === String(form.cancha) &&
      (form.hora_desde < r.hora_hasta && form.hora_hasta > r.hora_desde) &&
      (modo !== 'editar' || r.id !== initialData?.id)
    );
    if (existe) {
      setError('Ya existe una reserva superpuesta para ese establecimiento, fecha y horario.');
      return;
    }
    setError('');
    onSubmit(form);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{modo === 'editar' ? 'Editar reserva' : 'Nueva Reserva'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm sm:text-base">Fecha*</Label>
            <Input type="date" id="fecha" name="fecha" value={form.fecha} onChange={handleChange} required className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Desde*</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="time"
                step="300"
                className="flex-1 text-base sm:text-lg"
                value={form.hora_desde}
                onChange={e => setForm(f => ({ ...f, hora_desde: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
              <Label className="text-sm sm:text-base">Hasta*</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  step="300"
                  className="flex-1 text-base sm:text-lg"
                  value={form.hora_hasta}
                  onChange={e => setForm(f => ({ ...f, hora_hasta: e.target.value }))}
                  required
                />
              </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="cancha" className="text-sm sm:text-base">Establecimiento*</Label>
            <Select name="cancha" value={form.cancha} onValueChange={(value) => setForm({...form, cancha: value})}>
              <SelectTrigger className="text-sm sm:text-base">
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
          <div className="space-y-2">
            <Label htmlFor="socio" className="text-sm sm:text-base">Socio*</Label>
            <Input type="text" id="socio" name="socio" value={form.socio} onChange={handleChange} required className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-sm sm:text-base">Estado</Label>
            <Select name="estado" value={form.estado} onValueChange={(value) => setForm({...form, estado: value})}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" className="flex-1 text-sm sm:text-base">{modo === 'editar' ? 'Guardar cambios' : 'Guardar'}</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-sm sm:text-base">Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatFecha(fecha) {
  if (!fecha) return '';
  const soloFecha = fecha.split('T')[0];
  const [y, m, d] = soloFecha.split('-');
  return `${d}/${m}/${y}`;
}

function formatHora(hora) {
  if (!hora) return '';
  if (hora.length >= 5) return hora.slice(0,5);
  return hora;
}

function formatRango(hora_desde, hora_hasta) {
  if (!hora_desde || !hora_hasta) return '';
  return `${hora_desde.slice(0,5)} - ${hora_hasta.slice(0,5)}`;
}

function ReservasSection({ modalOpen, setModalOpen }) {
  const [reservas, setReservas] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editReserva, setEditReserva] = useState(null);
  const [modo, setModo] = useState('crear');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filtroSocio, setFiltroSocio] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('todas');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar reservas y establecimientos en paralelo
        const [reservasRes, establecimientosRes] = await Promise.all([
          fetch(`${apiUrl}/reservas`),
          fetch(`${apiUrl}/establecimientos`)
        ]);
        
        const reservasData = await reservasRes.json();
        const establecimientosData = await establecimientosRes.json();
        
        setReservas(reservasData);
        setEstablecimientos(establecimientosData);
        setError('');
      } catch (err) {
        setError('Error al cargar datos');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCreateReserva = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear reserva');
      setReservas(prev => [...prev, data]);
      setModalOpen(false);
      setToast({ message: 'Reserva creada con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al crear reserva', type: 'error' });
    }
  };

  const handleEditReserva = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/reservas/${editReserva.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al editar reserva');
      setReservas(prev => prev.map(r => r.id === data.id ? data : r));
      setEditReserva(null);
      setModalOpen(false);
      setModo('crear');
      setToast({ message: 'Reserva editada con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al editar reserva', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar la reserva?')) return;
    try {
      const res = await fetch(`${apiUrl}/reservas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setReservas(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Reserva eliminada', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al eliminar reserva', type: 'error' });
    }
  };

  const sociosUnicos = Array.from(new Set(reservas.map(r => r.socio)));

  const reservasFiltradas = reservas.filter(r =>
    (filtroSocio === '' || r.socio.toLowerCase().includes(filtroSocio.toLowerCase())) &&
    (filtroCancha === '' || filtroCancha === 'todas' || String(r.cancha) === filtroCancha)
  );

  const handleOpenModal = (reserva = null) => {
    if (reserva) {
      setEditReserva(reserva);
      setModo('editar');
    } else {
      setEditReserva(null);
      setModo('crear');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditReserva(null);
    setModo('crear');
  };

  const handleSubmit = (form) => {
    if (modo === 'editar') {
      handleEditReserva(form);
    } else {
      handleCreateReserva(form);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Reservas de Establecimientos</h2>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">+ Nueva Reserva</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <Label htmlFor="filtroSocio" className="text-sm sm:text-base">Filtrar por socio</Label>
          <Input
            id="filtroSocio"
            placeholder="Buscar socio..."
            value={filtroSocio}
            onChange={(e) => setFiltroSocio(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filtroCancha" className="text-sm sm:text-base">Filtrar por establecimiento</Label>
          <Select value={filtroCancha} onValueChange={setFiltroCancha}>
            <SelectTrigger className="text-sm sm:text-base">
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

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reservasFiltradas.map(r => (
              <Card key={r.id} className="hover:shadow-lg transition-shadow dark:bg-[#23272b] dark:text-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">{r.cancha}</CardTitle>
                    <Badge variant={r.estado === 'Confirmada' ? 'default' : r.estado === 'Cancelada' ? 'destructive' : 'secondary'} className="text-xs">
                      {r.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100"><strong>Fecha:</strong> <span className="font-normal">{formatFecha(r.fecha)}</span></div>
                  <div className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100"><strong>Horario:</strong> <span className="font-normal">{formatRango(r.hora_desde, r.hora_hasta)}</span></div>
                  <div className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100"><strong>Socio:</strong> <span className="font-normal">{r.socio}</span></div>
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(r)} className="flex-1 text-xs sm:text-sm dark:border-gray-400 dark:text-gray-100">Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)} className="flex-1 text-xs sm:text-sm dark:bg-[#ffb3ab] dark:text-[#23272b]">Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Establecimiento</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Socio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservasFiltradas.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{formatFecha(r.fecha)}</TableCell>
                    <TableCell>{r.cancha}</TableCell>
                    <TableCell>{formatRango(r.hora_desde, r.hora_hasta)}</TableCell>
                    <TableCell>{r.socio}</TableCell>
                    <TableCell>
                      <Badge variant={r.estado === 'Confirmada' ? 'default' : r.estado === 'Cancelada' ? 'destructive' : 'secondary'}>
                        {r.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(r)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Eliminar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <NuevaReservaModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editReserva}
        modo={modo}
        reservas={reservas}
        establecimientos={establecimientos}
      />

      <Toast message={typeof toast.message === 'string' ? toast.message : ''} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
    </div>
  );
}

export default ReservasSection; 