import { useState, useEffect } from 'react';
import { Table, Waiter, Product, Order, Invoice } from '../../App';
import { empleadosApi, EmpleadoRol, EmpleadoEstado, vistasApi, BebidaAlcoholicaMasVendidaViewDto, ComidaNoPedidaViewDto, DetalleCuentaMesaViewDto, IngresosDiaSemanaViewDto, ProductosMasVendidosViewDto, PedidosPorDiaViewDto, DetallePedidoCompletoViewDto, PedidosMeseroViewDto } from '../../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  LogOut,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

type AdminModuleProps = {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  waiters: Waiter[];
  setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  invoices: Invoice[];
  onLogout: () => void;
};

export function AdminModule({
  tables,
  setTables,
  waiters,
  setWaiters,
  products,
  setProducts,
  orders,
  setOrders,
  invoices,
  onLogout,
}: AdminModuleProps) {
  const [editingWaiterId, setEditingWaiterId] = useState<number | null>(null);
  const [waiterFormData, setWaiterFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    nombre: '',
    rol: 'Mesero' as EmpleadoRol,
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Activo' as EmpleadoEstado,
  });

  const [bebidasMasVendidas, setBebidasMasVendidas] = useState<BebidaAlcoholicaMasVendidaViewDto[]>([]);
  const [comidasNoPedidas, setComidasNoPedidas] = useState<ComidaNoPedidaViewDto[]>([]);
  const [detalleCuentaMesa, setDetalleCuentaMesa] = useState<DetalleCuentaMesaViewDto[]>([]);
  const [ingresosDiaSemana, setIngresosDiaSemana] = useState<IngresosDiaSemanaViewDto[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductosMasVendidosViewDto[]>([]);
  const [pedidosPorDia, setPedidosPorDia] = useState<PedidosPorDiaViewDto[]>([]);
  const [detallePedidoCompleto, setDetallePedidoCompleto] = useState<DetallePedidoCompletoViewDto[]>([]);
  const [pedidosActivos, setPedidosActivos] = useState<PedidosMeseroViewDto[]>([]);
  const [selectedMesaForDetalle, setSelectedMesaForDetalle] = useState<number | null>(null);

  useEffect(() => {
    vistasApi.bebidasAlcoholicasMasVendidas().then(setBebidasMasVendidas).catch(() => {});
    vistasApi.comidasNoPedidas().then(setComidasNoPedidas).catch(() => {});
    vistasApi.detalleCuentaMesa().then(setDetalleCuentaMesa).catch(() => {});
    vistasApi.ingresosDiaSemana().then(setIngresosDiaSemana).catch(() => {});
    vistasApi.productosMasVendidos().then(setProductosMasVendidos).catch(() => {});
    vistasApi.pedidosPorDia().then(setPedidosPorDia).catch(() => {});
    vistasApi.detallePedidoCompleto().then(setDetallePedidoCompleto).catch(() => {});
    vistasApi.pedidosActivos().then(setPedidosActivos).catch(() => {});
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployeeForm.nombre) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      const created = await empleadosApi.crear({
        nombre: newEmployeeForm.nombre,
        rol: newEmployeeForm.rol,
        fechaIngreso: newEmployeeForm.fechaIngreso,
        estado: newEmployeeForm.estado,
      });
      const newWaiter: Waiter = {
        id: created.idEmpleado,
        name: created.nombre,
        active: created.estado === 'Activo',
        hireDate: created.fechaIngreso,
      };
      setWaiters([...waiters, newWaiter]);
      setIsAddingEmployee(false);
      setNewEmployeeForm({ nombre: '', rol: 'Mesero', fechaIngreso: new Date().toISOString().split('T')[0], estado: 'Activo' });
      toast.success('Empleado agregado');
    } catch (e) {
      toast.error('Error al agregar empleado');
    }
  };

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayInvoices = invoices.filter(inv => new Date(inv.createdAt).toDateString() === today);

  const totalRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidOrders = todayOrders.filter(o => o.paid).length;
  const pendingOrders = todayOrders.filter(o => o.status === 'pending').length;
  const completedOrders = todayOrders.filter(o => o.status === 'completed').length;

  const lowStockProducts = products.filter(p => p.stock < 10 && p.active);

  const handleEditWaiter = (waiter: Waiter) => {
    setEditingWaiterId(waiter.id);
    setWaiterFormData({
      name: waiter.name,
      email: waiter.email || '',
      phone: waiter.phone || '',
    });
  };

  const handleUpdateWaiter = () => {
    if (!waiterFormData.name) {
      toast.error('El nombre es requerido');
      return;
    }

    setWaiters(waiters.map(w =>
      w.id === editingWaiterId
        ? { ...w, ...waiterFormData }
        : w
    ));
    setEditingWaiterId(null);
    setWaiterFormData({ name: '', email: '', phone: '' });
    toast.success('Mesero actualizado');
  };

  const handleToggleWaiterActive = (id: number) => {
    const waiter = waiters.find(w => w.id === id);
    if (waiter && !waiter.active) {
      setWaiters(waiters.map(w => w.id === id ? { ...w, active: true } : w));
      toast.success('Mesero habilitado');
    } else {
      setTables(tables.map(t => t.waiterId === id ? { ...t, waiterId: undefined } : t));
      setWaiters(waiters.map(w => w.id === id ? { ...w, active: false } : w));
      toast.success('Mesero inhabilitado');
    }
  };

  const cancelEditWaiter = () => {
    setEditingWaiterId(null);
    setWaiterFormData({ name: '', email: '', phone: '' });
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Producto';
  };

  const getTableNumber = (tableId: number) => {
    return tables.find(t => t.id === tableId)?.number || 'N/A';
  };

  const getWaiterName = (waiterId?: number) => {
    if (!waiterId) return 'Sin asignar';
    return waiters.find(w => w.id === waiterId)?.name || 'Desconocido';
  };

  const getAssignedTables = (waiterId: number) => {
    return tables.filter(t => t.waiterId === waiterId);
  };

  return (
    <div className="size-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Panel de Administración</h1>
            <p className="text-gray-600">Vista completa del sistema</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList>
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos del Día
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="waiters">
              <Users className="w-4 h-4 mr-2" />
              Meseros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="space-y-6">
              <h2>Reportes</h2>

              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${ingresosDiaSemana.reduce((s: number, d: IngresosDiaSemanaViewDto) => s + Number(d.ingresosTotales), 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ingresosDiaSemana.reduce((s: number, d: IngresosDiaSemanaViewDto) => s + Number(d.totalPagos), 0)} pagos registrados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Pedidos</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {pedidosPorDia.reduce((s: number, d: PedidosPorDiaViewDto) => s + Number(d.totalPedidos), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${pedidosPorDia.reduce((s: number, d: PedidosPorDiaViewDto) => s + Number(d.ingresos), 0).toFixed(2)} generados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Pedidos Activos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pedidosActivos.length}</div>
                    <p className="text-xs text-muted-foreground">En curso ahora</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Cuentas Divididas</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {detalleCuentaMesa.filter((c: DetalleCuentaMesaViewDto) => c.cuentaDividida !== 'No').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      de {detalleCuentaMesa.length} cuentas totales
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detail sub-tabs */}
              <Tabs defaultValue="ingresos-semana">
                <TabsList>
                  <TabsTrigger value="ingresos-semana">Ingresos por Día</TabsTrigger>
                  <TabsTrigger value="productos-vendidos">Productos Más Vendidos</TabsTrigger>
                </TabsList>

                <TabsContent value="ingresos-semana">
                  <Card className="mt-4">
                    <CardContent className="p-0">
                      {ingresosDiaSemana.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Sin datos disponibles</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-medium">Día</th>
                              <th className="text-right p-3 font-medium">Pagos</th>
                              <th className="text-right p-3 font-medium">Ingresos Totales</th>
                              <th className="text-right p-3 font-medium">Promedio por Pago</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingresosDiaSemana.map((row: IngresosDiaSemanaViewDto, i: number) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3 font-medium">{row.diaSemana}</td>
                                <td className="p-3 text-right">{row.totalPagos}</td>
                                <td className="p-3 text-right font-bold">${Number(row.ingresosTotales).toFixed(2)}</td>
                                <td className="p-3 text-right">${Number(row.promedioPago).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="productos-vendidos">
                  <Card className="mt-4">
                    <CardContent className="p-0">
                      {productosMasVendidos.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Sin datos disponibles</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-medium">Producto</th>
                              <th className="text-left p-3 font-medium">Tipo</th>
                              <th className="text-right p-3 font-medium">Vendidos</th>
                              <th className="text-right p-3 font-medium">Ingresos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosMasVendidos.map((row: ProductosMasVendidosViewDto, i: number) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3 font-medium">{row.nombre}</td>
                                <td className="p-3">{row.tipo}</td>
                                <td className="p-3 text-right font-bold">{row.totalVendido}</td>
                                <td className="p-3 text-right">${Number(row.ingresos).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <h2>Pedidos</h2>

              <Tabs defaultValue="pedidos-dia">
                <TabsList>
                  <TabsTrigger value="pedidos-dia">Pedidos por Día</TabsTrigger>
                  <TabsTrigger value="cuentas-mesa">Cuentas por Mesa</TabsTrigger>
                </TabsList>

                <TabsContent value="pedidos-dia">
                  <Card className="mt-4">
                    <CardContent className="p-0">
                      {pedidosPorDia.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Sin datos disponibles</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-medium">Fecha</th>
                              <th className="text-right p-3 font-medium">Pedidos</th>
                              <th className="text-right p-3 font-medium">Ingresos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidosPorDia.map((row: PedidosPorDiaViewDto, i: number) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3">{row.fecha}</td>
                                <td className="p-3 text-right font-bold">{row.totalPedidos}</td>
                                <td className="p-3 text-right">${Number(row.ingresos).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cuentas-mesa">
                  <div className="mt-4 space-y-4">
                    {detalleCuentaMesa.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-gray-500">Sin datos disponibles</CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="text-left p-3 font-medium">Cuenta</th>
                                  <th className="text-left p-3 font-medium">Mesa</th>
                                  <th className="text-left p-3 font-medium">Productos</th>
                                  <th className="text-right p-3 font-medium">Subtotal</th>
                                  <th className="text-right p-3 font-medium">IVA</th>
                                  <th className="text-right p-3 font-medium">Total</th>
                                  <th className="text-left p-3 font-medium">Fecha</th>
                                  <th className="text-left p-3 font-medium">Dividida</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detalleCuentaMesa.map((row: DetalleCuentaMesaViewDto, i: number) => (
                                  <tr
                                    key={i}
                                    className={`border-b last:border-0 cursor-pointer hover:bg-muted/30 ${selectedMesaForDetalle === row.numeroMesa ? 'bg-blue-50' : ''}`}
                                    onClick={() => setSelectedMesaForDetalle(selectedMesaForDetalle === row.numeroMesa ? null : row.numeroMesa)}
                                  >
                                    <td className="p-3">#{row.idCuenta}</td>
                                    <td className="p-3">{row.numeroMesa}</td>
                                    <td className="p-3 max-w-xs truncate" title={row.resumenProductos}>{row.resumenProductos}</td>
                                    <td className="p-3 text-right">${Number(row.subtotal).toFixed(2)}</td>
                                    <td className="p-3 text-right">${Number(row.impuestos).toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold">${Number(row.total).toFixed(2)}</td>
                                    <td className="p-3">{new Date(row.fecha).toLocaleString()}</td>
                                    <td className="p-3">
                                      <Badge className={row.cuentaDividida !== 'No' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                                        {row.cuentaDividida}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedMesaForDetalle !== null && (() => {
                      const detalles = detallePedidoCompleto.filter(d => d.mesa === selectedMesaForDetalle);
                      return (
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">Detalle de pedidos — Mesa {selectedMesaForDetalle}</CardTitle>
                              <Button size="sm" variant="outline" onClick={() => setSelectedMesaForDetalle(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            {detalles.length === 0 ? (
                              <p className="text-center text-gray-500 py-4 text-sm">Sin detalles para esta mesa</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b bg-muted/50">
                                      <th className="text-left p-3 font-medium">Pedido</th>
                                      <th className="text-left p-3 font-medium">Producto</th>
                                      <th className="text-right p-3 font-medium">Cant.</th>
                                      <th className="text-right p-3 font-medium">Precio unit.</th>
                                      <th className="text-right p-3 font-medium">Subtotal</th>
                                      <th className="text-left p-3 font-medium">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalles.map((row: DetallePedidoCompletoViewDto, i: number) => (
                                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="p-3">#{row.idPedido}</td>
                                        <td className="p-3">{row.producto}</td>
                                        <td className="p-3 text-right">{row.cantidad}</td>
                                        <td className="p-3 text-right">${Number(row.precioUnitario).toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold">${Number(row.subtotal).toFixed(2)}</td>
                                        <td className="p-3">
                                          <Badge className={row.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {row.estado}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-4">
              <h2>Consulta de Inventario</h2>

              <Tabs defaultValue="bebidas-vendidas">
                <TabsList>
                  <TabsTrigger value="bebidas-vendidas">Bebidas alcohólicas más vendidas</TabsTrigger>
                  <TabsTrigger value="comidas-no-pedidas">Comidas no pedidas</TabsTrigger>
                </TabsList>

                <TabsContent value="bebidas-vendidas">
                  <div className="mt-4">
                    {bebidasMasVendidas.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-gray-500">
                          No hay datos disponibles
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-medium">Bebida</th>
                                <th className="text-right p-3 font-medium">Total Vendido</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bebidasMasVendidas.map((b: BebidaAlcoholicaMasVendidaViewDto, idx: number) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                  <td className="p-3">{b.nombre}</td>
                                  <td className="p-3 text-right font-bold">{b.totalVendido}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comidas-no-pedidas">
                  <div className="mt-4">
                    {comidasNoPedidas.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-gray-500">
                          No hay datos disponibles
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-0">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-medium">Comida</th>
                                <th className="text-right p-3 font-medium">Precio</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comidasNoPedidas.map((c: ComidaNoPedidaViewDto, idx: number) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                  <td className="p-3">{c.nombre}</td>
                                  <td className="p-3 text-right font-bold">${c.precio.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="waiters">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2>Gestión de Empleados</h2>
                <Button onClick={() => setIsAddingEmployee(!isAddingEmployee)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Empleado
                </Button>
              </div>

              {isAddingEmployee && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nuevo Empleado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={newEmployeeForm.nombre}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, nombre: e.target.value })}
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          value={newEmployeeForm.rol}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, rol: e.target.value as EmpleadoRol })}
                        >
                          <option value="Mesero">Mesero</option>
                          <option value="Bartender">Bartender</option>
                          <option value="Cajero">Cajero</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                      </div>
                      <div>
                        <Label>Fecha de Ingreso</Label>
                        <Input
                          type="date"
                          value={newEmployeeForm.fechaIngreso}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, fechaIngreso: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          value={newEmployeeForm.estado}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, estado: e.target.value as EmpleadoEstado })}
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEmployee}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {editingWaiterId !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Mesero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Nombre Completo</Label>
                        <Input
                          value={waiterFormData.name}
                          onChange={(e) => setWaiterFormData({ ...waiterFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Correo Electrónico</Label>
                        <Input
                          type="email"
                          value={waiterFormData.email}
                          onChange={(e) => setWaiterFormData({ ...waiterFormData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input
                          value={waiterFormData.phone}
                          onChange={(e) => setWaiterFormData({ ...waiterFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateWaiter}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                      <Button variant="outline" onClick={cancelEditWaiter}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waiters.map((waiter) => {
                  const assignedTables = getAssignedTables(waiter.id);
                  return (
                    <Card key={waiter.id} className={!waiter.active ? 'opacity-60' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{waiter.name}</CardTitle>
                          <Badge
                            className={
                              waiter.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {waiter.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {waiter.email && (
                          <div>
                            <Label>Email</Label>
                            <p className="text-sm">{waiter.email}</p>
                          </div>
                        )}
                        {waiter.phone && (
                          <div>
                            <Label>Teléfono</Label>
                            <p className="text-sm">{waiter.phone}</p>
                          </div>
                        )}
                        {waiter.hireDate && (
                          <div>
                            <Label>Fecha de Contratación</Label>
                            <p className="text-sm">{new Date(waiter.hireDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <Label>Mesas Asignadas</Label>
                          <p className="text-lg font-bold">{assignedTables.length}</p>
                          {assignedTables.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {assignedTables.map((table) => (
                                <Badge key={table.id} variant="outline" className="text-xs">
                                  {table.number}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Estado</Label>
                            <Switch
                              checked={waiter.active}
                              onCheckedChange={() => handleToggleWaiterActive(waiter.id)}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleEditWaiter(waiter)}
                            disabled={editingWaiterId !== null}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar Información
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
