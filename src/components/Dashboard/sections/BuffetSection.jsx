import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function BuffetSection({ onNuevoStock, onNuevaCompra, onNuevaVenta }) {
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    stockBajo: 0,
    ventasHoy: 0,
    ventasMes: 0,
    comprasMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentVentas, setRecentVentas] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas de productos
      const productosRes = await fetch(`${apiUrl}/productos_buffet`);
      const productos = await productosRes.json();
      
      // Obtener ventas recientes
      const ventasRes = await fetch(`${apiUrl}/ventas_buffet`);
      const ventas = await ventasRes.json();
      
      // Calcular estadísticas
      const totalProductos = productos.length;
      const productosActivos = productos.filter(p => p.estado === 'activo').length;
      const stockBajo = productos.filter(p => {
        const stockTotal = parseInt(p.cantidad || 0) * parseInt(p.unidad || 1);
        return stockTotal < 10; // Consideramos stock bajo menos de 10 unidades
      });
      
      // Ventas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy)).length;
      
      // Ventas del mes
      const mesActual = new Date().toISOString().slice(0, 7);
      const ventasMes = ventas.filter(v => v.fecha.startsWith(mesActual)).length;
      
      setStats({
        totalProductos,
        productosActivos,
        stockBajo: stockBajo.length,
        ventasHoy,
        ventasMes,
        comprasMes: 0 // TODO: Implementar cuando esté la API de compras
      });
      
      setRecentVentas(ventas.slice(0, 5));
      setStockBajo(stockBajo.slice(0, 5));
      
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      toast.error('Error al cargar estadísticas');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="text-center py-8">
          <div className="text-lg">⏳ Cargando estadísticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          🍽️ Gestión de Buffet
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Panel de control para administrar <b>inventario, compras y ventas</b>
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProductos}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">📦 Total productos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.productosActivos}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">✅ Activos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.stockBajo}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">⚠️ Stock bajo</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.ventasHoy}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">💰 Ventas hoy</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.ventasMes}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">📊 Ventas mes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center">
          <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.comprasMes}</div>
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">🛒 Compras mes</div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Button 
            onClick={onNuevoStock} 
            className="w-full text-base py-4 h-auto font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            ➕ Nuevo Producto
          </Button>
          <Button 
            onClick={onNuevaCompra} 
            className="w-full text-base py-4 h-auto font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            🛒 Nueva Compra
          </Button>
          <Button 
            onClick={onNuevaVenta} 
            className="w-full text-base py-4 h-auto font-bold bg-purple-600 hover:bg-purple-700 text-white"
          >
            💰 Nueva Venta
          </Button>
        </div>
      </div>

      {/* Alertas importantes */}
      {stats.stockBajo > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-3 text-center">⚠️ Productos con Stock Bajo</h3>
          <div className="space-y-2">
            {stockBajo.map(producto => (
              <div key={producto.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{producto.nombre}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Stock: {parseInt(producto.cantidad || 0) * parseInt(producto.unidad || 1)} unidades
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">Stock bajo</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ventas recientes */}
      {recentVentas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">📈 Ventas Recientes</h3>
          <div className="space-y-2">
            {recentVentas.map(venta => (
              <div key={venta.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{venta.producto_nombre}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {venta.cantidad} unidades • {new Date(venta.fecha).toLocaleDateString('es-AR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{venta.responsable || 'Sin responsable'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(venta.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegación por secciones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900 dark:text-green-100 text-center">📦 Stock</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-green-700 dark:text-green-300 text-center mb-3">
              Gestionar inventario de productos
            </p>
            <div className="text-center">
              <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">
                {stats.productosActivos} productos activos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100 text-center">🛒 Compras</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center mb-3">
              Registrar compras de productos
            </p>
            <div className="text-center">
              <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">
                {stats.comprasMes} compras este mes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-900 dark:text-purple-100 text-center">💰 Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-purple-700 dark:text-purple-300 text-center mb-3">
              Controlar ventas del buffet
            </p>
            <div className="text-center">
              <Badge variant="outline" className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600">
                {stats.ventasMes} ventas este mes
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BuffetSection; 