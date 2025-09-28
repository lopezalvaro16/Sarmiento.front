import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="nombre" className="text-base font-medium text-gray-900 dark:text-gray-100">🏢 Nombre del establecimiento*</Label>
            <Input 
              type="text" 
              id="nombre" 
              name="nombre" 
              placeholder="Ej: Salón principal, Cancha 1, Quincho" 
              value={form.nombre} 
              onChange={handleChange} 
              required 
              className="text-base h-12" 
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="descripcion" className="text-base font-medium text-gray-900 dark:text-gray-100">📝 Descripción (opcional)</Label>
            <Input 
              type="text" 
              id="descripcion" 
              name="descripcion" 
              placeholder="Descripción del establecimiento" 
              value={form.descripcion} 
              onChange={handleChange} 
              className="text-base h-12" 
            />
          </div>
          {error && <div className="text-red-500 text-base text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}
          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full text-base py-4 h-auto font-medium">{modo === 'editar' ? '💾 Guardar cambios' : '💾 Guardar'}</Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full text-base py-4 h-auto font-medium">❌ Cancelar</Button>
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
      toast.success('Establecimiento creado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al crear establecimiento');
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
      toast.success('Establecimiento editado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al editar establecimiento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar el establecimiento?')) return;
    try {
      const res = await fetch(`${apiUrl}/establecimientos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setEstablecimientos(prev => prev.filter(e => e.id !== id));
      toast.success('Establecimiento eliminado');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar establecimiento');
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
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center"></h2>
        <Button 
          onClick={() => handleOpenModal()} 
          className="w-full text-lg py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          ➕ Nuevo Establecimiento
        </Button>
      </div>

      {/* Filtro súper simple */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <Input
              id="filtroNombre"
              placeholder="🔍 Buscar establecimiento por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="text-base h-12 w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Tarjetas simples para usuarios mayores */}
          <div className="space-y-3">
            {establecimientosFiltrados.map(e => (
              <div key={e.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="mb-3">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      🏢 {e.nombre}
                    </div>
                  </div>
                  
                  {e.descripcion && (
                    <div className="text-base mb-4">
                      <span className="text-gray-600 dark:text-gray-400">📝 Descripción:</span>
                      <div className="text-gray-700 dark:text-gray-300 mt-1">{e.descripcion}</div>
                    </div>
                  )}
                  
                  {/* Botones de acción - Grandes y claros */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleOpenModal(e)} 
                      className="flex-1 text-base py-3 h-auto font-medium"
                    >
                      ✏️ Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(e.id)} 
                      className="flex-1 text-base py-3 h-auto font-medium"
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              </div>
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

    </div>
  );
}

export default EstablecimientosSection;
