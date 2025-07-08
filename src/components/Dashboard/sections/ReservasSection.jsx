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

function NuevaReservaModal({ open, onClose, onSubmit, initialData, modo, reservas }) {
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
      setError('Ya existe una reserva superpuesta para esa cancha, fecha y horario.');
      return;
    }
    setError('');
    onSubmit(form);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modo === 'editar' ? 'Editar reserva' : 'Nueva Reserva'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha*</Label>
            <Input type="date" id="fecha" name="fecha" value={form.fecha} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora_desde">Desde*</Label>
            <Input type="time" id="hora_desde" name="hora_desde" value={form.hora_desde} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora_hasta">Hasta*</Label>
            <Input type="time" id="hora_hasta" name="hora_hasta" value={form.hora_hasta} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancha">Cancha*</Label>
            <Input type="number" id="cancha" name="cancha" value={form.cancha} onChange={handleChange} min="1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socio">Socio*</Label>
            <Input type="text" id="socio" name="socio" value={form.socio} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" value={form.estado} onValueChange={(value) => setForm({...form, estado: value})}>
              <SelectTrigger>
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">{modo === 'editar' ? 'Guardar cambios' : 'Guardar'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editReserva, setEditReserva] = useState(null);
  const [modo, setModo] = useState('crear');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filtroSocio, setFiltroSocio] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('todas');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/reservas`);
        const data = await res.json();
        setReservas(data);
        setError('');
      } catch (err) {
        setError('Error al cargar reservas');
      }
      setLoading(false);
    };
    fetchReservas();
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

  const canchasUnicas = Array.from(new Set(reservas.map(r => String(r.cancha))));
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Reservas de Canchas</h2>
        <Button onClick={() => handleOpenModal()}>+ Nueva Reserva</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="filtroSocio">Filtrar por socio</Label>
          <Input
            id="filtroSocio"
            placeholder="Buscar socio..."
            value={filtroSocio}
            onChange={(e) => setFiltroSocio(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filtroCancha">Filtrar por cancha</Label>
          <Select value={filtroCancha} onValueChange={setFiltroCancha}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las canchas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las canchas</SelectItem>
              {canchasUnicas.map(c => (
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
            {reservasFiltradas.map(r => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Cancha {r.cancha}</CardTitle>
                  <Badge variant={r.estado === 'Confirmada' ? 'default' : r.estado === 'Cancelada' ? 'destructive' : 'secondary'}>
                    {r.estado}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Fecha:</strong> {formatFecha(r.fecha)}</div>
                  <div><strong>Horario:</strong> {formatRango(r.hora_desde, r.hora_hasta)}</div>
                  <div><strong>Socio:</strong> {r.socio}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(r)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Eliminar</Button>
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
                  <TableHead>Cancha</TableHead>
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
                    <TableCell>Cancha {r.cancha}</TableCell>
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
      />

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
    </div>
  );
}

export default ReservasSection; 