import { useState } from 'react';
import { Table, Waiter, Product, Order, Invoice, OrderItem } from '../../App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LogOut, User, UtensilsCrossed, Receipt, Plus, Minus, Download } from 'lucide-react';
import { toast } from 'sonner';

type WaiterModuleProps = {
  waiterId: number;
  waiters: Waiter[];
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  onLogout: () => void;
};

export function WaiterModule({
  waiterId,
  waiters,
  tables,
  setTables,
  products,
  setProducts,
  orders,
  setOrders,
  invoices,
  setInvoices,
  onLogout,
}: WaiterModuleProps) {
  const waiter = waiters.find(w => w.id === waiterId);
  const myTables = tables.filter(t => t.waiterId === waiterId);
  const myOrders = orders.filter(o => o.waiterId === waiterId);

  const [selectedTableForReceipt, setSelectedTableForReceipt] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const handleGenerateReceipt = () => {
    if (!selectedTableForReceipt) {
      toast.error('Selecciona una mesa');
      return;
    }

    const tableOrders = myOrders.filter(
      o => o.tableId === selectedTableForReceipt && o.status === 'completed' && !o.paid
    );

    if (tableOrders.length === 0) {
      toast.error('No hay pedidos completados sin pagar en esta mesa');
      return;
    }

    const table = tables.find(t => t.id === selectedTableForReceipt);

    tableOrders.forEach(order => {
      const subtotal = order.total;
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      const newInvoice: Invoice = {
        id: Date.now() + order.id,
        orderId: order.id,
        tableNumber: table?.number || 'N/A',
        items: order.items,
        subtotal,
        tax,
        total,
        createdAt: new Date(),
        paymentMethod,
      };

      setInvoices(prev => [...prev, newInvoice]);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paid: true } : o));
    });

    setSelectedTableForReceipt(null);
    toast.success('Recibo(s) generado(s) exitosamente');
  };

  const getTableOrders = (tableId: number) => {
    return myOrders.filter(o => o.tableId === tableId);
  };

  const getTableTotal = (tableId: number) => {
    return getTableOrders(tableId)
      .filter(o => o.status === 'completed' && !o.paid)
      .reduce((sum, o) => sum + o.total, 0);
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Producto';
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
    }
  };

  if (!waiter) {
    return <div>Mesero no encontrado</div>;
  }

  return (
    <div className="size-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Módulo de Mesero</h1>
            <p className="text-gray-600">Bienvenido, {waiter.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="tables">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Mis Mesas
            </TabsTrigger>
            <TabsTrigger value="receipts">
              <Receipt className="w-4 h-4 mr-2" />
              Generar Recibo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <p className="text-lg">{waiter.name}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <p>
                      {waiter.active ? (
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </p>
                  </div>
                  {waiter.email && (
                    <div>
                      <Label>Correo Electrónico</Label>
                      <p>{waiter.email}</p>
                    </div>
                  )}
                  {waiter.phone && (
                    <div>
                      <Label>Teléfono</Label>
                      <p>{waiter.phone}</p>
                    </div>
                  )}
                  {waiter.hireDate && (
                    <div>
                      <Label>Fecha de Contratación</Label>
                      <p>{new Date(waiter.hireDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <Label>Mesas Asignadas</Label>
                    <p className="text-lg font-bold">{myTables.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables">
            <div className="space-y-4">
              <h2>Mesas Asignadas</h2>
              {myTables.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No tienes mesas asignadas actualmente
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTables.map((table) => {
                    const tableOrders = getTableOrders(table.id);
                    const pendingOrders = tableOrders.filter(o => o.status === 'pending');
                    const total = getTableTotal(table.id);

                    return (
                      <Card key={table.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>Mesa {table.number}</CardTitle>
                            <Badge
                              className={
                                table.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : table.status === 'occupied'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {table.status === 'available' ? 'Disponible' : table.status === 'occupied' ? 'Ocupada' : 'Reservada'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Capacidad: {table.capacity} personas</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Pedidos Activos</Label>
                            <p className="text-2xl font-bold">{pendingOrders.length}</p>
                          </div>

                          {total > 0 && (
                            <div className="pt-2 border-t">
                              <Label>Total Pendiente de Pago</Label>
                              <p className="text-xl font-bold text-green-600">${total.toFixed(2)}</p>
                            </div>
                          )}

                          {tableOrders.length > 0 && (
                            <div className="pt-2 border-t space-y-2">
                              <Label>Últimos Pedidos</Label>
                              {tableOrders.slice(-3).map((order) => (
                                <div key={order.id} className="flex justify-between items-center text-sm">
                                  <span>Pedido #{order.id.toString().slice(-4)}</span>
                                  {getStatusBadge(order.status)}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="receipts">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generar Recibo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Seleccionar Mesa</Label>
                    <Select
                      value={selectedTableForReceipt?.toString() || ''}
                      onValueChange={(value) => setSelectedTableForReceipt(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una mesa" />
                      </SelectTrigger>
                      <SelectContent>
                        {myTables.map((table) => {
                          const unpaidOrders = myOrders.filter(
                            o => o.tableId === table.id && o.status === 'completed' && !o.paid
                          );
                          return unpaidOrders.length > 0 ? (
                            <SelectItem key={table.id} value={table.id.toString()}>
                              Mesa {table.number} - ${getTableTotal(table.id).toFixed(2)}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Método de Pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTableForReceipt && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <Label>Resumen</Label>
                      {myOrders
                        .filter(o => o.tableId === selectedTableForReceipt && o.status === 'completed' && !o.paid)
                        .map((order) => (
                          <div key={order.id} className="space-y-1">
                            <p className="font-semibold text-sm">Pedido #{order.id.toString().slice(-6)}</p>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.quantity}x {getProductName(item.productId)}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${getTableTotal(selectedTableForReceipt).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA (13%):</span>
                          <span>${(getTableTotal(selectedTableForReceipt) * 0.13).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>${(getTableTotal(selectedTableForReceipt) * 1.13).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleGenerateReceipt} disabled={!selectedTableForReceipt}>
                    <Receipt className="w-4 h-4 mr-2" />
                    Generar Recibo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
