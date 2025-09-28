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
    // Validar horarios - permitir cruzar medianoche
    const horaDesde = form.hora_desde;
    const horaHasta = form.hora_hasta;
    
    // Si la hora de fin es menor que la de inicio, significa que cruza medianoche
    // En este caso, es válido (ej: 23:00 a 04:00)
    if (horaHasta <= horaDesde) {
      // Verificar que no sea el mismo horario (ej: 23:00 a 23:00)
      if (horaHasta === horaDesde) {
        setError('La hora de fin debe ser diferente a la de inicio.');
        return;
      }
      // Si cruza medianoche, es válido - no hacer nada más
    }
    const now = new Date();
    const reservaDate = new Date(`${form.fecha}T${form.hora_desde}`);
    if (reservaDate < now) {
      setError('No se puede reservar en el pasado.');
      return;
    }
    // Verificar superposición de reservas - manejar horarios que cruzan medianoche
    const existe = reservas.some(r => {
      if (r.fecha !== form.fecha || String(r.cancha) !== String(form.cancha)) {
        return false;
      }
      
      // Si es la misma reserva en modo editar, no considerar superposición
      if (modo === 'editar' && r.id === initialData?.id) {
        return false;
      }
      
      // Verificar superposición considerando horarios que cruzan medianoche
      const rHoraDesde = r.hora_desde;
      const rHoraHasta = r.hora_hasta;
      const nHoraDesde = form.hora_desde;
      const nHoraHasta = form.hora_hasta;
      
      // Si la reserva existente cruza medianoche
      if (rHoraHasta <= rHoraDesde) {
        // Si la nueva reserva también cruza medianoche
        if (nHoraHasta <= nHoraDesde) {
          // Ambas cruzan medianoche - siempre hay superposición
          return true;
        } else {
          // Solo la existente cruza medianoche
          // La nueva reserva se superpone si está en el rango de medianoche
          return nHoraDesde >= rHoraDesde || nHoraHasta <= rHoraHasta;
        }
      } else {
        // La reserva existente no cruza medianoche
        if (nHoraHasta <= nHoraDesde) {
          // Solo la nueva cruza medianoche
          // Se superpone si la existente está en el rango de medianoche
          return rHoraDesde >= nHoraDesde || rHoraHasta <= nHoraHasta;
        } else {
          // Ninguna cruza medianoche - comparación normal
          return nHoraDesde < rHoraHasta && nHoraHasta > rHoraDesde;
        }
      }
    });
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
  const [filtroSocio, setFiltroSocio] = useState('');
  const [filtroCancha, setFiltroCancha] = useState('todas');
  const [filtroFecha, setFiltroFecha] = useState('proximas'); // 'proximas', 'todas', 'rango'
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [reservasPorPagina] = useState(8); // Tarjetas más grandes pero claras para usuarios mayores
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false); // Para colapsar filtros en móvil
  const [reservaExpandida, setReservaExpandida] = useState(null); // Para expandir detalles de reserva
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
      toast.success('Reserva creada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al crear reserva');
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
      toast.success('Reserva editada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al editar reserva');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar la reserva?')) return;
    try {
      const res = await fetch(`${apiUrl}/reservas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setReservas(prev => prev.filter(r => r.id !== id));
      toast.success('Reserva eliminada');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar reserva');
    }
  };

  const sociosUnicos = Array.from(new Set(reservas.map(r => r.socio)));

  // Función para filtrar por fecha
  const filtrarPorFecha = (reserva) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(reserva.fecha);
    
    switch (filtroFecha) {
      case 'proximas':
        // Solo próximas 30 días
        const en30Dias = new Date();
        en30Dias.setDate(hoy.getDate() + 30);
        return fechaReserva >= hoy && fechaReserva <= en30Dias;
      
      case 'rango':
        if (!fechaDesde && !fechaHasta) return true;
        if (fechaDesde && fechaHasta) {
          return fechaReserva >= new Date(fechaDesde) && fechaReserva <= new Date(fechaHasta);
        }
        if (fechaDesde) return fechaReserva >= new Date(fechaDesde);
        if (fechaHasta) return fechaReserva <= new Date(fechaHasta);
        return true;
      
      case 'todas':
      default:
        return true;
    }
  };

  const reservasFiltradas = reservas.filter(r =>
    (filtroSocio === '' || r.socio.toLowerCase().includes(filtroSocio.toLowerCase())) &&
    (filtroCancha === '' || filtroCancha === 'todas' || String(r.cancha) === filtroCancha) &&
    filtrarPorFecha(r)
  );

  // Ordenar por fecha (más recientes primero)
  reservasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Calcular paginación
  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
  const inicio = (paginaActual - 1) * reservasPorPagina;
  const fin = inicio + reservasPorPagina;
  const reservasPaginadas = reservasFiltradas.slice(inicio, fin);

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

  // Funciones de paginación
  const irAPagina = (pagina) => {
    setPaginaActual(pagina);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroSocio, filtroCancha, filtroFecha, fechaDesde, fechaHasta]);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold text-center"></div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nueva Reserva
        </Button>
      </div>

      {/* Filtros súper simples para usuarios mayores */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        {/* Solo los filtros más importantes */}
        <div className="space-y-4">
          {/* Búsqueda por socio - El más usado */}
          <div>
            <Input
              id="filtroSocio"
              placeholder="Escribir nombre del socio..."
              value={filtroSocio}
              onChange={(e) => setFiltroSocio(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>

          {/* Filtro de lugar - Solo si hay múltiples establecimientos */}
          {establecimientos.length > 1 && (
            <div>
              <Select value={filtroCancha} onValueChange={setFiltroCancha}>
                <SelectTrigger className="text-base h-12 w-full">
                  <SelectValue placeholder="Todos los lugares" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los lugares</SelectItem>
                  {establecimientos.map(establecimiento => (
                    <SelectItem key={establecimiento.id} value={establecimiento.nombre}>
                      {establecimiento.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro de fecha - Solo 2 opciones simples */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={filtroFecha === 'proximas' ? 'default' : 'outline'}
                onClick={() => setFiltroFecha('proximas')}
                className="text-base py-3 h-auto font-medium"
              >
                📅 Próximas
              </Button>
              <Button
                variant={filtroFecha === 'todas' ? 'default' : 'outline'}
                onClick={() => setFiltroFecha('todas')}
                className="text-base py-3 h-auto font-medium"
              >
                📋 Todas
              </Button>
            </div>
          </div>
        </div>

        {/* Información simple */}
        {/* <div className="text-center text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded mt-4">
          📊 {reservasPaginadas.length} de {reservasFiltradas.length} reservas
          {totalPaginas > 1 && (
            <div className="text-sm mt-1">Página {paginaActual} de {totalPaginas}</div>
          )}
        </div> */}
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Vista móvil - Solo tarjetas */}
          <div className="block lg:hidden space-y-3">
            {reservasPaginadas.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                {/* Información principal - Simple y clara */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {r.cancha}
                    </div>
                    <Badge 
                      variant={r.estado === 'Confirmada' ? 'default' : r.estado === 'Cancelada' ? 'destructive' : 'secondary'} 
                      className="text-sm px-3 py-1"
                    >
                      {r.estado}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-base">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📅 Fecha:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatFecha(r.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">🕐 Horario:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatRango(r.hora_desde, r.hora_hasta)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">👤 Socio:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{r.socio}</span>
                    </div>
                  </div>
                  
                  {/* Botones de acción - Grandes y claros */}
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={() => handleOpenModal(r)} 
                      className="flex-1 text-base py-3 h-auto font-medium"
                    >
                      ✏️ Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(r.id)} 
                      className="flex-1 text-base py-3 h-auto font-medium"
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - Solo tabla */}
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
                {reservasPaginadas.map(r => (
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

          {/* Controles de paginación optimizados para móvil */}
          {totalPaginas > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
                  Página {paginaActual} de {totalPaginas}
                </div>
                
                {/* Botones principales - Más grandes para móvil */}
                <div className="flex gap-3 w-full max-w-sm">
                  <Button
                    onClick={paginaAnterior}
                    disabled={paginaActual === 1}
                    variant="outline"
                    className="flex-1 text-base py-4 h-auto font-medium"
                  >
                    ← Anterior
                  </Button>
                  <Button
                    onClick={paginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    variant="outline"
                    className="flex-1 text-base py-4 h-auto font-medium"
                  >
                    Siguiente →
                  </Button>
                </div>

                {/* Números de página - Solo 3 en móvil para no abrumar */}
                {totalPaginas <= 7 ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <Button
                        key={i + 1}
                        onClick={() => irAPagina(i + 1)}
                        variant={paginaActual === i + 1 ? 'default' : 'outline'}
                        className="text-base px-3 py-2 h-auto min-w-[40px]"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    {/* Mostrar solo 3 páginas en móvil */}
                    {Array.from({ length: 3 }, (_, i) => {
                      let numeroPagina;
                      if (paginaActual <= 2) {
                        numeroPagina = i + 1;
                      } else if (paginaActual >= totalPaginas - 1) {
                        numeroPagina = totalPaginas - 2 + i;
                      } else {
                        numeroPagina = paginaActual - 1 + i;
                      }

                      return (
                        <Button
                          key={numeroPagina}
                          onClick={() => irAPagina(numeroPagina)}
                          variant={paginaActual === numeroPagina ? 'default' : 'outline'}
                          className="text-base px-3 py-2 h-auto min-w-[40px]"
                        >
                          {numeroPagina}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Información compacta para móvil */}
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {inicio + 1}-{Math.min(fin, reservasFiltradas.length)} de {reservasFiltradas.length}
                </div>
              </div>
            </div>
          )}
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

    </div>
  );
}

export default ReservasSection; 