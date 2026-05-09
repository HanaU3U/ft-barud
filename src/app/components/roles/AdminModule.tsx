import { useState } from 'react';
import { Table, Waiter, Product, Order, Invoice } from '../../App';
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
              <h2>Reporte del Día</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {todayInvoices.length} facturas generadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Pedidos Completados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {paidOrders} pagados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Pedidos Pendientes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      En proceso
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Productos Bajo Stock</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lowStockProducts.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Requieren reabastecimiento
                    </p>
                  </CardContent>
                </Card>
              </div>

              {lowStockProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas de Inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento de Meseros (Hoy)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {waiters.filter(w => w.active).map((waiter) => {
                      const waiterOrders = todayOrders.filter(o => o.waiterId === waiter.id);
                      const waiterRevenue = todayInvoices
                        .filter(inv => {
                          const order = orders.find(o => o.id === inv.orderId);
                          return order?.waiterId === waiter.id;
                        })
                        .reduce((sum, inv) => sum + inv.total, 0);

                      return (
                        <div key={waiter.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold">{waiter.name}</p>
                            <p className="text-sm text-gray-600">
                              {waiterOrders.length} pedidos - {getAssignedTables(waiter.id).length} mesas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${waiterRevenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">Ingresos generados</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <h2>Pedidos de Hoy</h2>

              {todayOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No hay pedidos registrados hoy
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {[...todayOrders].reverse().map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Pedido #{order.id.toString().slice(-6)}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Mesa {getTableNumber(order.tableId)} - {getWaiterName(order.waiterId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-col items-end">
                            <Badge
                              className={
                                order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {order.status === 'pending' ? 'Pendiente' : order.status === 'completed' ? 'Completado' : 'Cancelado'}
                            </Badge>
                            <Badge
                              className={
                                order.paid
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {order.paid ? 'Pagado' : 'Sin Pagar'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.quantity}x {getProductName(item.productId)}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-4">
              <h2>Consulta de Inventario</h2>

              {products.map((category) => category).reduce((acc: string[], p) => {
                if (!acc.includes(p.category)) acc.push(p.category);
                return acc;
              }, []).map((category) => (
                <div key={category} className="space-y-3">
                  <h3>{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.filter(p => p.category === category).map((product) => (
                      <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            {!product.active && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Precio:</span>
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Stock:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{product.stock}</span>
                              {product.stock < 10 && product.active && (
                                <Badge className="bg-yellow-100 text-yellow-800">Bajo</Badge>
                              )}
                              {product.stock === 0 && (
                                <Badge className="bg-red-100 text-red-800">Agotado</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="waiters">
            <div className="space-y-6">
              <h2>Gestión de Meseros</h2>

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
