import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiFile, FiCalendar, FiDownload, FiEye, FiTrash2, FiFolder, FiSearch, FiFilter } from 'react-icons/fi';

function DocumentosSection() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const categorias = [
    { value: 'todos', label: 'Todos los documentos', icon: '📁' },
    { value: 'facturas', label: 'Facturas', icon: '🧾' },
    { value: 'contratos', label: 'Contratos', icon: '📋' },
    { value: 'servicios', label: 'Servicios', icon: '⚡' },
    { value: 'socios', label: 'Socios', icon: '👥' },
    { value: 'otros', label: 'Otros', icon: '📄' }
  ];

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const años = [2025, 2024, 2023];

  // Cargar documentos desde la API
  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth !== 'todos') params.append('mes', selectedMonth);
      if (selectedYear) params.append('año', selectedYear);
      if (selectedCategory !== 'todos') params.append('categoria', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${apiUrl}/documentos?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDocumentos(data.data);
      } else {
        console.error('Error cargando documentos:', data.error);
      }
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar documentos cuando cambien los filtros
  useEffect(() => {
    cargarDocumentos();
  }, [selectedMonth, selectedYear, selectedCategory, searchTerm]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('documento', file);
      formData.append('categoria', 'otros'); // Por defecto
      formData.append('mes', selectedMonth.toString());
      formData.append('año', (selectedYear || new Date().getFullYear()).toString());
      formData.append('descripcion', '');

      const response = await fetch(`${apiUrl}/documentos/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar la lista de documentos
        await cargarDocumentos();
        setShowUploadModal(false);
        alert('Documento subido exitosamente');
      } else {
        alert('Error subiendo documento: ' + data.error);
      }
    } catch (error) {
      console.error('Error subiendo documento:', error);
      alert('Error subiendo documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      window.open(`${apiUrl}/documentos/download/${id}`, '_blank');
    } catch (error) {
      console.error('Error descargando documento:', error);
      alert('Error descargando documento');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/documentos/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await cargarDocumentos();
        alert('Documento eliminado exitosamente');
      } else {
        alert('Error eliminando documento: ' + data.error);
      }
    } catch (error) {
      console.error('Error eliminando documento:', error);
      alert('Error eliminando documento');
    }
  };

  const getCategoriaInfo = (categoria) => {
    return categorias.find(cat => cat.value === categoria) || categorias[0];
  };

  const getFileIcon = (tipo) => {
    if (!tipo) return '📁'; // Fallback si tipo es undefined
    
    switch (tipo.toLowerCase()) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      default: return '📁';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              📁 Gestión de Documentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra y organiza los documentos del club por mes y categoría
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FiUpload className="text-lg" />
            Subir Documento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#23272b] rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mes */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los meses</option>
            {meses.map((mes, index) => (
              <option key={index} value={index + 1}>{mes}</option>
            ))}
          </select>

          {/* Año */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {años.map(año => (
              <option key={año} value={año}>{año}</option>
            ))}
          </select>

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="bg-white dark:bg-[#23272b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="p-12 text-center">
            <FiFolder className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No hay documentos
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {searchTerm || selectedCategory !== 'todos' || selectedMonth !== 'todos' 
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'Sube tu primer documento para comenzar'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {documentos.map((doc) => {
              const categoriaInfo = getCategoriaInfo(doc.categoria);
              return (
                <div key={doc.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {getFileIcon(doc.tipo)}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {doc.nombre}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-sm" />
                            {meses[doc.mes - 1]} {doc.año}
                          </span>
                          <span className="flex items-center gap-1">
                            {categoriaInfo.icon}
                            {categoriaInfo.label}
                          </span>
                          <span>{doc.tamaño}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        title="Ver documento"
                      >
                        <FiEye className="text-lg" />
                      </button>
                      
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                        title="Descargar documento"
                      >
                        <FiDownload className="text-lg" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Eliminar documento"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#23272b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Subir Nuevo Documento
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar archivo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
              
              {uploading && (
                <div className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-center">
                  Subiendo...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentosSection;
