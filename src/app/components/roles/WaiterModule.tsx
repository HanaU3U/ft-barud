import { useState, useEffect } from 'react';
import { Table, Waiter, Product, Order, Invoice } from '../../App';
import { mesasApi, pedidosApi, productosApi, detallesPedidoApi, cuentasApi, pagosApi, divisionesCuentaApi, MesaResponseDto, PedidoResponseDto, ProductoResponseDto, DetallePedidoResponseDto, CuentaResponseDto, DetallePedidoEstado, MesaEstado, PedidoEstado, CuentaEstado, MetodoPago } from '../../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LogOut, User, UtensilsCrossed, Receipt, Plus, Minus, Download, Edit2, Trash2, ClipboardList, Save, X } from 'lucide-react';
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

  // --- Mesas desde API ---
  const [mesas, setMesas] = useState<MesaResponseDto[]>([]);
  const [editingMesaId, setEditingMesaId] = useState<number | null>(null);
  const [mesaForm, setMesaForm] = useState({ numero: 0, capacidad: 0, estado: 'Disponible' as MesaEstado });
  const [creatingOrderForMesa, setCreatingOrderForMesa] = useState<number | null>(null);
  const [pedidoForm, setPedidoForm] = useState({ numeroPersonas: 1 });

  // --- Pedidos desde API ---
  const [pedidosApi_, setPedidosApi] = useState<PedidoResponseDto[]>([]);
  const [editingPedidoId, setEditingPedidoId] = useState<number | null>(null);
  const [pedidoEstadoEdit, setPedidoEstadoEdit] = useState<PedidoEstado>('Abierto');
  const [selectedTableForReceipt, setSelectedTableForReceipt] = useState<number | null>(null);

  // --- Detalles de Pedido ---
  const [productos, setProductos] = useState<ProductoResponseDto[]>([]);
  const [allDetalles, setAllDetalles] = useState<DetallePedidoResponseDto[]>([]);
  const [expandedPedidoId, setExpandedPedidoId] = useState<number | null>(null);
  const [addingDetalleForPedido, setAddingDetalleForPedido] = useState<number | null>(null);
  const [newDetalleForm, setNewDetalleForm] = useState<{ idProducto: number; cantidad: number; precioUnitario: number; estado: DetallePedidoEstado }>({ idProducto: 0, cantidad: 1, precioUnitario: 0, estado: 'Activo' });
  const [editingDetalleId, setEditingDetalleId] = useState<number | null>(null);
  const [editDetalleForm, setEditDetalleForm] = useState<{ idProducto: number; cantidad: number; precioUnitario: number; estado: DetallePedidoEstado }>({ idProducto: 0, cantidad: 1, precioUnitario: 0, estado: 'Activo' });

  // --- Cuentas ---
  const [cuentas, setCuentas] = useState<CuentaResponseDto[]>([]);
  const [editingCuentaId, setEditingCuentaId] = useState<number | null>(null);
  const [editCuentaForm, setEditCuentaForm] = useState({ subtotal: 0, impuestos: 0, total: 0, estado: 'Abierta' as CuentaEstado });
  const [generatingPagoForCuenta, setGeneratingPagoForCuenta] = useState<number | null>(null);
  const [pagoForm, setPagoForm] = useState({ metodo: 'Efectivo' as MetodoPago, monto: 0 });
  // Recibo
  const [selectedPedidoForRecibo, setSelectedPedidoForRecibo] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  // Divisiones de cuenta (split bill)
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [pendingDivisiones, setPendingDivisiones] = useState<{ descripcion: string; monto: number }[]>([]);
  const [newDivisionForm, setNewDivisionForm] = useState({ descripcion: '', monto: 0 });

  useEffect(() => {
    mesasApi.listar().then(setMesas).catch(() => {});
    pedidosApi.listar({ idMesero: waiterId }).then(setPedidosApi).catch(() => {});
    productosApi.listar().then(setProductos).catch(() => {});
    detallesPedidoApi.listar().then(setAllDetalles).catch(() => {});
    cuentasApi.listar().then(setCuentas).catch(() => {});
  }, [waiterId]);

  const handleEditMesa = (mesa: MesaResponseDto) => {
    setEditingMesaId(mesa.idMesa);
    setMesaForm({ numero: mesa.numero, capacidad: mesa.capacidad, estado: mesa.estado });
  };

  const handleUpdateMesa = async () => {
    if (!editingMesaId) return;
    try {
      const updated = await mesasApi.actualizar(editingMesaId, mesaForm);
      setMesas(mesas.map(m => m.idMesa === editingMesaId ? updated : m));
      setEditingMesaId(null);
      toast.success('Mesa actualizada');
    } catch {
      toast.error('Error al actualizar mesa');
    }
  };

  const handleDeleteMesa = async (id: number) => {
    if (!confirm('¿Eliminar esta mesa?')) return;
    try {
      await mesasApi.eliminar(id);
      setMesas(mesas.filter(m => m.idMesa !== id));
      toast.success('Mesa eliminada');
    } catch {
      toast.error('Error al eliminar mesa');
    }
  };

  const handleCrearPedido = async () => {
    if (!creatingOrderForMesa) return;
    try {
      const created = await pedidosApi.crear({
        idMesa: creatingOrderForMesa,
        idMesero: waiterId,
        fechaHora: new Date().toISOString().slice(0, 19),
        numeroPersonas: pedidoForm.numeroPersonas,
        estado: 'Abierto',
      });
      setPedidosApi(prev => [...prev, created]);
      setCreatingOrderForMesa(null);
      setPedidoForm({ numeroPersonas: 1 });
      toast.success('Pedido creado');
    } catch {
      toast.error('Error al crear pedido');
    }
  };

  const handleUpdatePedido = async (pedido: PedidoResponseDto) => {
    try {
      const updated = await pedidosApi.actualizar(pedido.idPedido, {
        idMesa: pedido.idMesa,
        idMesero: pedido.idMesero,
        fechaHora: pedido.fechaHora,
        numeroPersonas: pedido.numeroPersonas,
        estado: pedidoEstadoEdit,
      });
      setPedidosApi(pedidosApi_.map(p => p.idPedido === pedido.idPedido ? updated : p));
      setEditingPedidoId(null);
      toast.success('Pedido actualizado');
    } catch {
      toast.error('Error al actualizar pedido');
    }
  };

  const handleCerrarPedido = async (id: number) => {
    try {
      const updated = await pedidosApi.cerrar(id);
      setPedidosApi(pedidosApi_.map(p => p.idPedido === id ? updated : p));
      toast.success('Pedido cerrado');
    } catch {
      toast.error('Error al cerrar pedido');
    }
  };

  const handleAddDetalle = async (idPedido: number) => {
    if (!newDetalleForm.idProducto) { toast.error('Selectioná un producto'); return; }
    try {
      const created = await detallesPedidoApi.crear({ idPedido, idProducto: newDetalleForm.idProducto, cantidad: newDetalleForm.cantidad, precioUnitario: newDetalleForm.precioUnitario, estado: newDetalleForm.estado });
      setAllDetalles(prev => [...prev, created]);
      setAddingDetalleForPedido(null);
      setNewDetalleForm({ idProducto: 0, cantidad: 1, precioUnitario: 0, estado: 'Activo' });
      toast.success('Producto agregado');
    } catch {
      toast.error('Error al agregar producto');
    }
  };

  const handleUpdateDetalle = async (detalle: DetallePedidoResponseDto) => {
    try {
      const updated = await detallesPedidoApi.actualizar(detalle.idDetalle, { idPedido: detalle.idPedido, idProducto: editDetalleForm.idProducto, cantidad: editDetalleForm.cantidad, precioUnitario: editDetalleForm.precioUnitario, estado: editDetalleForm.estado });
      setAllDetalles(prev => prev.map(d => d.idDetalle === detalle.idDetalle ? updated : d));
      setEditingDetalleId(null);
      toast.success('Detalle actualizado');
    } catch {
      toast.error('Error al actualizar detalle');
    }
  };

  const handleDeleteDetalle = async (idDetalle: number) => {
    if (!confirm('¿Eliminar este producto del pedido?')) return;
    try {
      await detallesPedidoApi.eliminar(idDetalle);
      setAllDetalles(prev => prev.filter(d => d.idDetalle !== idDetalle));
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error al eliminar producto');
    }
  };

  const handleUpdateCuenta = async (cuenta: CuentaResponseDto) => {
    try {
      const updated = await cuentasApi.actualizar(cuenta.idCuenta, { idPedido: cuenta.idPedido, subtotal: editCuentaForm.subtotal, impuestos: editCuentaForm.impuestos, total: editCuentaForm.total, estado: editCuentaForm.estado });
      setCuentas(prev => prev.map(c => c.idCuenta === cuenta.idCuenta ? updated : c));
      setEditingCuentaId(null);
      toast.success('Cuenta actualizada');
    } catch {
      toast.error('Error al actualizar cuenta');
    }
  };

  const handleGenerarPago = async (idCuenta: number) => {
    if (!pagoForm.monto) { toast.error('Ingresá un monto'); return; }
    try {
      await pagosApi.crear({ idCuenta, metodo: pagoForm.metodo, monto: pagoForm.monto, fecha: new Date().toISOString().slice(0, 19) });
      // Close cuenta after pago
      const cerrada = await cuentasApi.cerrar(idCuenta);
      setCuentas(prev => prev.map(c => c.idCuenta === idCuenta ? cerrada : c));
      // Close pedido and release mesa
      const cuenta = cuentas.find(c => c.idCuenta === idCuenta);
      if (cuenta) {
        const pedidoCerrado = await pedidosApi.cerrar(cuenta.idPedido);
        setPedidosApi(prev => prev.map(p => p.idPedido === cuenta.idPedido ? pedidoCerrado : p));
        const pedido = pedidosApi_.find(p => p.idPedido === cuenta.idPedido);
        if (pedido) {
          const mesa = mesas.find(m => m.idMesa === pedido.idMesa);
          if (mesa) {
            const mesaLiberada = await mesasApi.actualizar(mesa.idMesa, { numero: mesa.numero, capacidad: mesa.capacidad, estado: 'Disponible' });
            setMesas(prev => prev.map(m => m.idMesa === mesa.idMesa ? mesaLiberada : m));
          }
        }
      }
      setGeneratingPagoForCuenta(null);
      toast.success('Pago registrado, cuenta cerrada y mesa liberada');
    } catch {
      toast.error('Error al registrar pago');
    }
  };

  const handleGenerarRecibo = async () => {
    if (!selectedPedidoForRecibo) { toast.error('Seleccioná un pedido'); return; }
    const detallesRecibo = allDetalles.filter(d => d.idPedido === selectedPedidoForRecibo && d.estado === 'Activo');
    if (detallesRecibo.length === 0) { toast.error('El pedido no tiene productos activos'); return; }
    const subtotal = detallesRecibo.reduce((sum, d) => sum + d.cantidad * Number(d.precioUnitario), 0);
    const impuestos = subtotal * 0.13;
    const total = subtotal + impuestos;
    try {
      const cuenta = await cuentasApi.crear({ idPedido: selectedPedidoForRecibo, subtotal, impuestos, total, estado: 'Abierta' });
      setCuentas(prev => [...prev, cuenta]);
      if (splitEnabled && pendingDivisiones.length > 0) {
        for (const div of pendingDivisiones) {
          await divisionesCuentaApi.crear({ idCuenta: cuenta.idCuenta, descripcion: div.descripcion, monto: div.monto });
        }
      }
      await pagosApi.crear({ idCuenta: cuenta.idCuenta, metodo: metodoPago, monto: total, fecha: new Date().toISOString().slice(0, 19) });
      // Close cuenta after pago
      const cerrada = await cuentasApi.cerrar(cuenta.idCuenta);
      setCuentas(prev => prev.map(c => c.idCuenta === cuenta.idCuenta ? cerrada : c));
      // Close pedido
      const pedidoCerrado = await pedidosApi.cerrar(selectedPedidoForRecibo);
      setPedidosApi(prev => prev.map(p => p.idPedido === selectedPedidoForRecibo ? pedidoCerrado : p));
      // Release mesa
      const pedidoRef = pedidosApi_.find(p => p.idPedido === selectedPedidoForRecibo);
      if (pedidoRef) {
        const mesa = mesas.find(m => m.idMesa === pedidoRef.idMesa);
        if (mesa) {
          const mesaLiberada = await mesasApi.actualizar(mesa.idMesa, { numero: mesa.numero, capacidad: mesa.capacidad, estado: 'Disponible' });
          setMesas(prev => prev.map(m => m.idMesa === mesa.idMesa ? mesaLiberada : m));
        }
      }
      setSelectedPedidoForRecibo(null);
      setSplitEnabled(false);
      setPendingDivisiones([]);
      toast.success('Recibo generado, cuenta cerrada y mesa liberada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al generar recibo');
    }
  };

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
            <TabsTrigger value="mesas">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Mesas
            </TabsTrigger>
            <TabsTrigger value="mis-pedidos">
              <ClipboardList className="w-4 h-4 mr-2" />
              Mis Pedidos
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

          <TabsContent value="mesas">
            <div className="space-y-4">
              <h2>Gestión de Mesas</h2>

              {editingMesaId !== null && (
                <Card>
                  <CardHeader><CardTitle>Editar Mesa</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Número</Label>
                        <Input type="number" value={mesaForm.numero} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMesaForm({ ...mesaForm, numero: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Capacidad</Label>
                        <Input type="number" value={mesaForm.capacidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMesaForm({ ...mesaForm, capacidad: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={mesaForm.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMesaForm({ ...mesaForm, estado: e.target.value as MesaEstado })}>
                          <option value="Disponible">Disponible</option>
                          <option value="Ocupada">Ocupada</option>
                          <option value="Reservada">Reservada</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateMesa}><Save className="w-4 h-4 mr-2" />Guardar</Button>
                      <Button variant="outline" onClick={() => setEditingMesaId(null)}><X className="w-4 h-4 mr-2" />Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {creatingOrderForMesa !== null && (
                <Card>
                  <CardHeader><CardTitle>Nuevo Pedido — Mesa {mesas.find(m => m.idMesa === creatingOrderForMesa)?.numero}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Número de Personas</Label>
                      <Input type="number" min={1} value={pedidoForm.numeroPersonas} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPedidoForm({ numeroPersonas: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCrearPedido}><Plus className="w-4 h-4 mr-2" />Crear Pedido</Button>
                      <Button variant="outline" onClick={() => setCreatingOrderForMesa(null)}><X className="w-4 h-4 mr-2" />Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mesas.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-gray-500">No hay mesas disponibles</CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mesas.map((mesa) => (
                    <Card key={mesa.idMesa}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>Mesa {mesa.numero}</CardTitle>
                          <Badge className={mesa.estado === 'Disponible' ? 'bg-green-100 text-green-800' : mesa.estado === 'Ocupada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {mesa.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditMesa(mesa)}>
                            <Edit2 className="w-4 h-4 mr-1" />Editar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setCreatingOrderForMesa(mesa.idMesa); setEditingMesaId(null); }}>
                            <Plus className="w-4 h-4 mr-1" />Pedido
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteMesa(mesa.idMesa)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mis-pedidos">
            <div className="space-y-4">
              <h2>Mis Pedidos</h2>

              <Tabs defaultValue="activos" className="w-full">
                <TabsList>
                  <TabsTrigger value="activos">
                    Activos y en preparación
                    {pedidosApi_.filter(p => p.estado === 'Abierto' || p.estado === 'En preparacion').length > 0 && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                        {pedidosApi_.filter(p => p.estado === 'Abierto' || p.estado === 'En preparacion').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="historial">
                    Historial
                    {pedidosApi_.filter(p => p.estado === 'Cerrado').length > 0 && (
                      <Badge className="ml-2 bg-gray-200 text-gray-700 text-xs">
                        {pedidosApi_.filter(p => p.estado === 'Cerrado').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activos" className="mt-4">
                  {pedidosApi_.filter(p => p.estado === 'Abierto' || p.estado === 'En preparacion').length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500">No tenés pedidos activos</CardContent></Card>
                  ) : (
                    <div className="space-y-4">
                      {pedidosApi_.filter(p => p.estado === 'Abierto' || p.estado === 'En preparacion').map((pedido) => {
                    const detallesPedido = allDetalles.filter(d => d.idPedido === pedido.idPedido);
                    const isExpanded = expandedPedidoId === pedido.idPedido;
                    const isAddingDetalle = addingDetalleForPedido === pedido.idPedido;
                    const cuentaPedido = cuentas.find(c => c.idPedido === pedido.idPedido);
                    return (
                      <Card key={pedido.idPedido}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">Pedido #{pedido.idPedido} — Mesa {pedido.idMesa}</CardTitle>
                              <p className="text-sm text-gray-600">{new Date(pedido.fechaHora).toLocaleString()} · {pedido.numeroPersonas} personas</p>
                            </div>
                            <Badge className={pedido.estado === 'Abierto' ? 'bg-blue-100 text-blue-800' : pedido.estado === 'En preparacion' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                              {pedido.estado}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {cuentaPedido ? (
                            <>
                              {/* Cuenta info */}
                              <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold">Cuenta #{cuentaPedido.idCuenta}</p>
                                  <Badge className={cuentaPedido.estado === 'Abierta' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>{cuentaPedido.estado}</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-gray-700">
                                  <div>Subtotal: ${Number(cuentaPedido.subtotal).toFixed(2)}</div>
                                  <div>IVA: ${Number(cuentaPedido.impuestos).toFixed(2)}</div>
                                  <div className="font-bold">Total: ${Number(cuentaPedido.total).toFixed(2)}</div>
                                </div>
                              </div>
                              {editingCuentaId === cuentaPedido.idCuenta && (
                                <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
                                  <p className="text-sm font-semibold">Actualizar cuenta</p>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <div><Label className="text-xs">Subtotal</Label><Input type="number" min={0} step="0.01" value={editCuentaForm.subtotal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCuentaForm(f => ({ ...f, subtotal: parseFloat(e.target.value) || 0 }))} /></div>
                                    <div><Label className="text-xs">IVA</Label><Input type="number" min={0} step="0.01" value={editCuentaForm.impuestos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCuentaForm(f => ({ ...f, impuestos: parseFloat(e.target.value) || 0 }))} /></div>
                                    <div><Label className="text-xs">Total</Label><Input type="number" min={0} step="0.01" value={editCuentaForm.total} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCuentaForm(f => ({ ...f, total: parseFloat(e.target.value) || 0 }))} /></div>
                                    <div>
                                      <Label className="text-xs">Estado</Label>
                                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={editCuentaForm.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditCuentaForm(f => ({ ...f, estado: e.target.value as CuentaEstado }))}>
                                        <option value="Abierta">Abierta</option>
                                        <option value="Cerrada">Cerrada</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleUpdateCuenta(cuentaPedido)}><Save className="w-4 h-4 mr-1" />Guardar</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingCuentaId(null)}><X className="w-4 h-4" /></Button>
                                  </div>
                                </div>
                              )}
                              {generatingPagoForCuenta === cuentaPedido.idCuenta && (
                                <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
                                  <p className="text-sm font-semibold">Registrar pago</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Método</Label>
                                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={pagoForm.metodo} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPagoForm(f => ({ ...f, metodo: e.target.value as MetodoPago }))}>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Transferencia">Transferencia</option>
                                      </select>
                                    </div>
                                    <div><Label className="text-xs">Monto</Label><Input type="number" min={0} step="0.01" value={pagoForm.monto} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPagoForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} /></div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleGenerarPago(cuentaPedido.idCuenta)}><Save className="w-4 h-4 mr-1" />Confirmar pago</Button>
                                    <Button size="sm" variant="outline" onClick={() => setGeneratingPagoForCuenta(null)}><X className="w-4 h-4" /></Button>
                                  </div>
                                </div>
                              )}
                              {editingCuentaId !== cuentaPedido.idCuenta && generatingPagoForCuenta !== cuentaPedido.idCuenta && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => { setEditingCuentaId(cuentaPedido.idCuenta); setEditCuentaForm({ subtotal: Number(cuentaPedido.subtotal), impuestos: Number(cuentaPedido.impuestos), total: Number(cuentaPedido.total), estado: cuentaPedido.estado }); }}>
                                    <Edit2 className="w-4 h-4 mr-1" />Actualizar cuenta
                                  </Button>
                                  <Button size="sm" onClick={() => { setGeneratingPagoForCuenta(cuentaPedido.idCuenta); setPagoForm({ metodo: 'Efectivo', monto: Number(cuentaPedido.total) }); }}>
                                    <Receipt className="w-4 h-4 mr-1" />Generar pago
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Acciones del pedido */}
                              {editingPedidoId === pedido.idPedido ? (
                            <div className="flex gap-2 items-center">
                              <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={pedidoEstadoEdit} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPedidoEstadoEdit(e.target.value as PedidoEstado)}>
                                <option value="Abierto">Abierto</option>
                                <option value="En preparacion">En preparacion</option>
                                <option value="Cerrado">Cerrado</option>
                              </select>
                              <Button size="sm" onClick={() => handleUpdatePedido(pedido)}><Save className="w-4 h-4 mr-1" />Guardar</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingPedidoId(null)}><X className="w-4 h-4" /></Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" disabled={pedido.estado === 'Cerrado'} onClick={() => { setEditingPedidoId(pedido.idPedido); setPedidoEstadoEdit(pedido.estado); }}>
                                <Edit2 className="w-4 h-4 mr-1" />Actualizar estado
                              </Button>
                              <Button size="sm" variant="outline" disabled={pedido.estado === 'Cerrado'} onClick={() => handleCerrarPedido(pedido.idPedido)}>
                                <X className="w-4 h-4 mr-1" />Cerrar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setExpandedPedidoId(isExpanded ? null : pedido.idPedido)}>
                                <ClipboardList className="w-4 h-4 mr-1" />{isExpanded ? 'Ocultar' : `Productos (${detallesPedido.length})`}
                              </Button>
                              <Button size="sm" disabled={pedido.estado === 'Cerrado'} onClick={() => { setAddingDetalleForPedido(isAddingDetalle ? null : pedido.idPedido); setExpandedPedidoId(pedido.idPedido); setNewDetalleForm({ idProducto: 0, cantidad: 1, precioUnitario: 0, estado: 'Activo' }); }}>
                                <Plus className="w-4 h-4 mr-1" />Agregar producto
                              </Button>
                            </div>
                          )}

                          {/* Formulario agregar detalle */}
                          {isAddingDetalle && (
                            <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
                              <p className="text-sm font-semibold">Nuevo producto</p>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <div>
                                  <Label className="text-xs">Producto</Label>
                                  <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={newDetalleForm.idProducto}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                      const prod = productos.find(p => p.idProducto === parseInt(e.target.value));
                                      setNewDetalleForm(f => ({ ...f, idProducto: parseInt(e.target.value), precioUnitario: prod ? prod.precio : f.precioUnitario }));
                                    }}
                                  >
                                    <option value={0}>-- Seleccionar --</option>
                                    {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombre} (${p.precio})</option>)}
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs">Cantidad</Label>
                                  <Input type="number" min={1} value={newDetalleForm.cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDetalleForm(f => ({ ...f, cantidad: parseInt(e.target.value) || 1 }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Precio unit.</Label>
                                  <Input type="number" min={0} step="0.01" value={newDetalleForm.precioUnitario} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDetalleForm(f => ({ ...f, precioUnitario: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div>
                                  <Label className="text-xs">Estado</Label>
                                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={newDetalleForm.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDetalleForm(f => ({ ...f, estado: e.target.value as DetallePedidoEstado }))}>
                                    <option value="Activo">Activo</option>
                                    <option value="Cancelado">Cancelado</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAddDetalle(pedido.idPedido)}><Save className="w-4 h-4 mr-1" />Guardar</Button>
                                <Button size="sm" variant="outline" onClick={() => setAddingDetalleForPedido(null)}><X className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          )}

                          {/* Lista de detalles */}
                          {isExpanded && detallesPedido.length === 0 && (
                            <p className="text-sm text-gray-500">Sin productos en este pedido</p>
                          )}
                          {isExpanded && detallesPedido.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="text-left px-3 py-2">Producto</th>
                                    <th className="text-left px-3 py-2">Cant.</th>
                                    <th className="text-left px-3 py-2">Precio unit.</th>
                                    <th className="text-left px-3 py-2">Total</th>
                                    <th className="text-left px-3 py-2">Estado</th>
                                    <th className="px-3 py-2"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detallesPedido.map((det) => (
                                    editingDetalleId === det.idDetalle ? (
                                      <tr key={det.idDetalle} className="border-t bg-yellow-50">
                                        <td className="px-2 py-1">
                                          <select className="h-8 w-full rounded border border-input text-sm px-2" value={editDetalleForm.idProducto} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { const prod = productos.find(p => p.idProducto === parseInt(e.target.value)); setEditDetalleForm(f => ({ ...f, idProducto: parseInt(e.target.value), precioUnitario: prod ? prod.precio : f.precioUnitario })); }}>
                                            {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
                                          </select>
                                        </td>
                                        <td className="px-2 py-1"><Input type="number" min={1} className="h-8 w-20" value={editDetalleForm.cantidad} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDetalleForm(f => ({ ...f, cantidad: parseInt(e.target.value) || 1 }))} /></td>
                                        <td className="px-2 py-1"><Input type="number" min={0} step="0.01" className="h-8 w-24" value={editDetalleForm.precioUnitario} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDetalleForm(f => ({ ...f, precioUnitario: parseFloat(e.target.value) || 0 }))} /></td>
                                        <td className="px-3 py-2">${(editDetalleForm.cantidad * editDetalleForm.precioUnitario).toFixed(2)}</td>
                                        <td className="px-2 py-1">
                                          <select className="h-8 rounded border border-input text-sm px-2" value={editDetalleForm.estado} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditDetalleForm(f => ({ ...f, estado: e.target.value as DetallePedidoEstado }))}>
                                            <option value="Activo">Activo</option>
                                            <option value="Cancelado">Cancelado</option>
                                          </select>
                                        </td>
                                        <td className="px-2 py-1">
                                          <div className="flex gap-1">
                                            <Button size="sm" className="h-7 px-2" onClick={() => handleUpdateDetalle(det)}><Save className="w-3 h-3" /></Button>
                                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setEditingDetalleId(null)}><X className="w-3 h-3" /></Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ) : (
                                      <tr key={det.idDetalle} className="border-t">
                                        <td className="px-3 py-2">{productos.find(p => p.idProducto === det.idProducto)?.nombre ?? `#${det.idProducto}`}</td>
                                        <td className="px-3 py-2">{det.cantidad}</td>
                                        <td className="px-3 py-2">${Number(det.precioUnitario).toFixed(2)}</td>
                                        <td className="px-3 py-2">${(det.cantidad * Number(det.precioUnitario)).toFixed(2)}</td>
                                        <td className="px-3 py-2"><Badge className={det.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{det.estado}</Badge></td>
                                        <td className="px-3 py-2">
                                          <div className="flex gap-1">
                                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { setEditingDetalleId(det.idDetalle); setEditDetalleForm({ idProducto: det.idProducto, cantidad: det.cantidad, precioUnitario: Number(det.precioUnitario), estado: det.estado }); }}><Edit2 className="w-3 h-3" /></Button>
                                            <Button size="sm" variant="outline" className="h-7 px-2 text-red-600" onClick={() => handleDeleteDetalle(det.idDetalle)}><Trash2 className="w-3 h-3" /></Button>
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="historial" className="mt-4">
                  {pedidosApi_.filter(p => p.estado === 'Cerrado').length === 0 ? (
                    <Card><CardContent className="py-8 text-center text-gray-500">No tenés pedidos cerrados en el historial</CardContent></Card>
                  ) : (
                    <div className="space-y-4">
                      {pedidosApi_.filter(p => p.estado === 'Cerrado').map((pedido) => {
                        const detallesPedido = allDetalles.filter(d => d.idPedido === pedido.idPedido);
                        const isExpanded = expandedPedidoId === pedido.idPedido;
                        const cuentaPedido = cuentas.find(c => c.idPedido === pedido.idPedido);
                        return (
                          <Card key={pedido.idPedido} className="opacity-80">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">Pedido #{pedido.idPedido} — Mesa {pedido.idMesa}</CardTitle>
                                  <p className="text-sm text-gray-600">{new Date(pedido.fechaHora).toLocaleString()} · {pedido.numeroPersonas} personas</p>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">{pedido.estado}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {cuentaPedido && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                                  <div className="flex justify-between items-center">
                                    <p className="font-semibold">Cuenta #{cuentaPedido.idCuenta}</p>
                                    <Badge className={cuentaPedido.estado === 'Abierta' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>{cuentaPedido.estado}</Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-gray-700">
                                    <div>Subtotal: ${Number(cuentaPedido.subtotal).toFixed(2)}</div>
                                    <div>IVA: ${Number(cuentaPedido.impuestos).toFixed(2)}</div>
                                    <div className="font-bold">Total: ${Number(cuentaPedido.total).toFixed(2)}</div>
                                  </div>
                                </div>
                              )}
                              <Button size="sm" variant="outline" onClick={() => setExpandedPedidoId(isExpanded ? null : pedido.idPedido)}>
                                <ClipboardList className="w-4 h-4 mr-1" />{isExpanded ? 'Ocultar productos' : `Ver productos (${detallesPedido.length})`}
                              </Button>
                              {isExpanded && detallesPedido.length === 0 && (
                                <p className="text-sm text-gray-500">Sin productos registrados</p>
                              )}
                              {isExpanded && detallesPedido.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left px-3 py-2">Producto</th>
                                        <th className="text-left px-3 py-2">Cant.</th>
                                        <th className="text-left px-3 py-2">Precio unit.</th>
                                        <th className="text-left px-3 py-2">Total</th>
                                        <th className="text-left px-3 py-2">Estado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detallesPedido.map((det) => (
                                        <tr key={det.idDetalle} className="border-t">
                                          <td className="px-3 py-2">{productos.find(p => p.idProducto === det.idProducto)?.nombre ?? `#${det.idProducto}`}</td>
                                          <td className="px-3 py-2">{det.cantidad}</td>
                                          <td className="px-3 py-2">${Number(det.precioUnitario).toFixed(2)}</td>
                                          <td className="px-3 py-2">${(det.cantidad * Number(det.precioUnitario)).toFixed(2)}</td>
                                          <td className="px-3 py-2"><Badge className={det.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{det.estado}</Badge></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
                    <Label>Seleccionar Pedido</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={selectedPedidoForRecibo ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedPedidoForRecibo(parseInt(e.target.value) || null); setSplitEnabled(false); setPendingDivisiones([]); }}
                    >
                      <option value="">-- Selecciona un pedido --</option>
                      {pedidosApi_
                        .filter(p => !cuentas.find(c => c.idPedido === p.idPedido) && p.estado !== 'Cerrado')
                        .map(p => (
                          <option key={p.idPedido} value={p.idPedido}>
                            Pedido #{p.idPedido} — Mesa {p.idMesa} ({p.estado})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {selectedPedidoForRecibo && (() => {
                    const det = allDetalles.filter(d => d.idPedido === selectedPedidoForRecibo && d.estado === 'Activo');
                    const subtotal = det.reduce((s, d) => s + d.cantidad * Number(d.precioUnitario), 0);
                    const impuestos = subtotal * 0.13;
                    const total = subtotal + impuestos;
                    return (
                      <div className="border rounded-lg p-4 space-y-2">
                        <Label>Detalle del pedido</Label>
                        {det.length === 0 && <p className="text-gray-500 text-sm">Sin productos activos</p>}
                        {det.map(d => (
                          <div key={d.idDetalle} className="flex justify-between text-sm">
                            <span>{productos.find(p => p.idProducto === d.idProducto)?.nombre ?? `#${d.idProducto}`} ×{d.cantidad}</span>
                            <span>${(d.cantidad * Number(d.precioUnitario)).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between text-sm"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between text-sm"><span>IVA (13%):</span><span>${impuestos.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Split bill */}
                  {selectedPedidoForRecibo && (() => {
                    const detSplit = allDetalles.filter(d => d.idPedido === selectedPedidoForRecibo && d.estado === 'Activo');
                    const subtotalSplit = detSplit.reduce((s, d) => s + d.cantidad * Number(d.precioUnitario), 0);
                    const totalSplit = subtotalSplit + subtotalSplit * 0.13;
                    const count = pendingDivisiones.length;
                    const montoPerPerson = count > 0 ? totalSplit / count : totalSplit;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="split-toggle"
                            checked={splitEnabled}
                            onChange={e => { setSplitEnabled(e.target.checked); if (!e.target.checked) setPendingDivisiones([]); }}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="split-toggle">Dividir cuenta entre personas</Label>
                        </div>

                        {splitEnabled && (
                          <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Label className="text-xs">Nombre de la persona</Label>
                                <Input
                                  value={newDivisionForm.descripcion}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDivisionForm(f => ({ ...f, descripcion: e.target.value }))}
                                  placeholder="Ej. Persona 1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newDivisionForm.descripcion) {
                                      const newCount = count + 1;
                                      const newMonto = totalSplit / newCount;
                                      setPendingDivisiones(prev => [...prev.map(d => ({ ...d, monto: newMonto })), { descripcion: newDivisionForm.descripcion, monto: newMonto }]);
                                      setNewDivisionForm({ descripcion: '', monto: 0 });
                                    }
                                  }}
                                />
                              </div>
                              <Button size="sm" onClick={() => {
                                if (!newDivisionForm.descripcion) return;
                                const newCount = count + 1;
                                const newMonto = totalSplit / newCount;
                                setPendingDivisiones(prev => [...prev.map(d => ({ ...d, monto: newMonto })), { descripcion: newDivisionForm.descripcion, monto: newMonto }]);
                                setNewDivisionForm({ descripcion: '', monto: 0 });
                              }}>
                                <Plus className="w-4 h-4 mr-1" />Agregar
                              </Button>
                            </div>

                            {count > 0 && (
                              <div className="space-y-1">
                                {pendingDivisiones.map((div, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm border-b pb-1">
                                    <span>{div.descripcion}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">${montoPerPerson.toFixed(2)}</span>
                                      <Button size="sm" variant="outline" className="h-6 px-2 text-red-600" onClick={() => {
                                        const newList = pendingDivisiones.filter((_, j) => j !== i);
                                        const newMonto = newList.length > 0 ? totalSplit / newList.length : 0;
                                        setPendingDivisiones(newList.map(d => ({ ...d, monto: newMonto })));
                                      }}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-between text-sm font-semibold pt-1 text-gray-700">
                                  <span>{count} persona{count !== 1 ? 's' : ''} · ${montoPerPerson.toFixed(2)} c/u</span>
                                  <span>Total: ${totalSplit.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div>
                    <Label>Método de Pago</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={metodoPago}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMetodoPago(e.target.value as MetodoPago)}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>

                  <Button onClick={handleGenerarRecibo} disabled={!selectedPedidoForRecibo}>
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
