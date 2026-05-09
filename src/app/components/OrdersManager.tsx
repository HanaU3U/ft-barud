import { useState } from 'react';
import { Order, OrderItem, Table, Product } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type OrdersManagerProps = {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  tables: Table[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export function OrdersManager({ orders, setOrders, tables, products, setProducts }: OrdersManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

  const handleAddProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock < 1) {
      toast.error('Producto sin stock disponible');
      return;
    }

    const existingItem = selectedItems.find(item => item.productId === productId);
    if (existingItem) {
      if (product.stock < existingItem.quantity + 1) {
        toast.error('Stock insuficiente');
        return;
      }
      setSelectedItems(selectedItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1, price: product.price }]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    const existingItem = selectedItems.find(item => item.productId === productId);
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(selectedItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    }
  };

  const handleCreateOrder = () => {
    if (!selectedTableId || selectedItems.length === 0) {
      toast.error('Selecciona una mesa y agrega productos');
      return;
    }

    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    selectedItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === item.productId
              ? { ...p, stock: p.stock - item.quantity }
              : p
          )
        );
      }
    });

    const newOrder: Order = {
      id: Date.now(),
      tableId: selectedTableId,
      items: selectedItems,
      status: 'pending',
      createdAt: new Date(),
      total,
    };

    setOrders([...orders, newOrder]);
    setSelectedTableId(null);
    setSelectedItems([]);
    setIsCreating(false);
    toast.success('Pedido creado exitosamente');
  };

  const handleStatusChange = (orderId: number, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    if (status === 'completed') {
      toast.success('Pedido completado');
    } else if (status === 'cancelled') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.items.forEach(item => {
          setProducts(prevProducts =>
            prevProducts.map(p =>
              p.id === item.productId
                ? { ...p, stock: p.stock + item.quantity }
                : p
            )
          );
        });
      }
      toast.info('Pedido cancelado, stock restaurado');
    }
  };

  const getTableNumber = (tableId: number) => {
    return tables.find(t => t.id === tableId)?.number || 'N/A';
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Producto desconocido';
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

  const totalInCart = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Pedidos</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Seleccionar Mesa</Label>
              <Select
                value={selectedTableId?.toString() || ''}
                onValueChange={(value) => setSelectedTableId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una mesa" />
                </SelectTrigger>
                <SelectContent>
                  {tables.filter(t => t.status === 'occupied' || t.status === 'available').map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Mesa {table.number} ({table.status === 'occupied' ? 'Ocupada' : 'Disponible'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agregar Productos</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {products.filter(p => p.stock > 0).map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    onClick={() => handleAddProduct(product.id)}
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {product.name} - ${product.price.toFixed(2)}
                    <Badge variant="secondary" className="ml-auto">
                      Stock: {product.stock}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <Label>Carrito</Label>
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <span>{getProductName(item.productId)}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddProduct(item.productId)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${totalInCart.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreateOrder} disabled={!selectedTableId || selectedItems.length === 0}>
                Crear Pedido
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setSelectedTableId(null);
                setSelectedItems([]);
              }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3>Pedidos Activos</h3>
        {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No hay pedidos activos
            </CardContent>
          </Card>
        ) : (
          orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pedido #{order.id.toString().slice(-6)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Mesa {getTableNumber(order.tableId)} - {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
