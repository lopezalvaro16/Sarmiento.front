import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import Toast from './Toast';

function NuevoEstablecimientoModal({ open, onClose, onSubmit, initialData, modo }) {
  const [form, setForm] = useState(initialData || {
    nombre: '',
    descripcion: '',
  });
  const [error, setError] = useState('');
  
  useEffect(() => {
    setForm(initialData || {
      nombre: '',
      descripcion: '',
    });
  }, [initialData, open]);
  
  if (!open) return null;
  
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre del establecimiento es obligatorio.');
      return;
    }
    setError('');
    onSubmit(form);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{modo === 'editar' ? 'Editar establecimiento' : 'Nuevo Establecimiento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm sm:text-base">Nombre*</Label>
            <Input 
              type="text" 
              id="nombre" 
              name="nombre" 
              placeholder="Ej: Salón principal, Cancha 1, Quincho" 
              value={form.nombre} 
              onChange={handleChange} 
              required 
              className="text-sm sm:text-base" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm sm:text-base">Descripción</Label>
            <Input 
              type="text" 
              id="descripcion" 
              name="descripcion" 
              placeholder="Descripción opcional del establecimiento" 
              value={form.descripcion} 
              onChange={handleChange} 
              className="text-sm sm:text-base" 
            />
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

function EstablecimientosSection({ modalOpen, setModalOpen }) {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editEstablecimiento, setEditEstablecimiento] = useState(null);
  const [modo, setModo] = useState('crear');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [filtroNombre, setFiltroNombre] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/establecimientos`);
        const data = await res.json();
        setEstablecimientos(data);
        setError('');
      } catch (err) {
        setError('Error al cargar establecimientos');
      }
      setLoading(false);
    };
    fetchEstablecimientos();
  }, []);

  const handleCreateEstablecimiento = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/establecimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear establecimiento');
      setEstablecimientos(prev => [...prev, data]);
      setModalOpen(false);
      setToast({ message: 'Establecimiento creado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al crear establecimiento', type: 'error' });
    }
  };

  const handleEditEstablecimiento = async (form) => {
    try {
      const res = await fetch(`${apiUrl}/establecimientos/${editEstablecimiento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al editar establecimiento');
      setEstablecimientos(prev => prev.map(e => e.id === data.id ? data : e));
      setEditEstablecimiento(null);
      setModalOpen(false);
      setModo('crear');
      setToast({ message: 'Establecimiento editado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al editar establecimiento', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar el establecimiento?')) return;
    try {
      const res = await fetch(`${apiUrl}/establecimientos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setEstablecimientos(prev => prev.filter(e => e.id !== id));
      setToast({ message: 'Establecimiento eliminado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Error al eliminar establecimiento', type: 'error' });
    }
  };

  const establecimientosFiltrados = (establecimientos || []).filter(e =>
    filtroNombre === '' || e.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const handleOpenModal = (establecimiento = null) => {
    if (establecimiento) {
      setEditEstablecimiento(establecimiento);
      setModo('editar');
    } else {
      setEditEstablecimiento(null);
      setModo('crear');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEstablecimiento(null);
    setModo('crear');
  };

  const handleSubmit = (form) => {
    if (modo === 'editar') {
      handleEditEstablecimiento(form);
    } else {
      handleCreateEstablecimiento(form);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Gestión de Establecimientos</h2>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">+ Nuevo Establecimiento</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <Label htmlFor="filtroNombre" className="text-sm sm:text-base">Filtrar por nombre</Label>
          <Input
            id="filtroNombre"
            placeholder="Buscar establecimiento..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {establecimientosFiltrados.map(e => (
              <Card key={e.id} className="hover:shadow-lg transition-shadow dark:bg-[#23272b] dark:text-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">{e.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {e.descripcion && (
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      <strong>Descripción:</strong> {e.descripcion}
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(e)} className="flex-1 text-xs sm:text-sm dark:border-gray-400 dark:text-gray-100">Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(e.id)} className="flex-1 text-xs sm:text-sm dark:bg-[#ffb3ab] dark:text-[#23272b]">Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establecimientosFiltrados.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell>{e.descripcion || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(e)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(e.id)}>Eliminar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <NuevoEstablecimientoModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editEstablecimiento}
        modo={modo}
      />

      <Toast message={typeof toast.message === 'string' ? toast.message : ''} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
    </div>
  );
}

export default EstablecimientosSection;
