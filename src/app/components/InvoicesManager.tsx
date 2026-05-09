import { useState } from 'react';
import { Invoice, Order, Table, Product } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { FileText, Download, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

type InvoicesManagerProps = {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  tables: Table[];
  products: Product[];
};

export function InvoicesManager({
  invoices,
  setInvoices,
  orders,
  setOrders,
  tables,
  products,
}: InvoicesManagerProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const uninvoicedOrders = completedOrders.filter(
    o => !invoices.some(inv => inv.orderId === o.id)
  );

  const handleGenerateInvoice = () => {
    if (!selectedOrderId) {
      toast.error('Selecciona un pedido');
      return;
    }

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    const table = tables.find(t => t.id === order.tableId);
    const subtotal = order.total;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now(),
      orderId: order.id,
      tableNumber: table?.number || 'N/A',
      items: order.items,
      subtotal,
      tax,
      total,
      createdAt: new Date(),
      paymentMethod,
    };

    setInvoices([...invoices, newInvoice]);
    setSelectedOrderId(null);
    setPaymentMethod('cash');
    toast.success('Factura generada exitosamente');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const content = generateInvoiceText(invoice);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Factura descargada');
  };

  const generateInvoiceText = (invoice: Invoice) => {
    const lines = [
      '========================================',
      '          FACTURA - BAR',
      '========================================',
      '',
      `Factura N°: ${invoice.id.toString().slice(-8)}`,
      `Fecha: ${new Date(invoice.createdAt).toLocaleString()}`,
      `Mesa: ${invoice.tableNumber}`,
      '',
      '----------------------------------------',
      'DETALLE',
      '----------------------------------------',
    ];

    invoice.items.forEach((item) => {
      const product = products.find(p => p.id === item.productId);
      const name = product?.name || 'Producto';
      lines.push(
        `${item.quantity}x ${name.padEnd(20)} $${(item.price * item.quantity).toFixed(2)}`
      );
    });

    lines.push(
      '----------------------------------------',
      `Subtotal:                  $${invoice.subtotal.toFixed(2)}`,
      `IVA (13%):                  $${invoice.tax.toFixed(2)}`,
      '',
      `TOTAL:                     $${invoice.total.toFixed(2)}`,
      '',
      `Método de pago: ${getPaymentMethodLabel(invoice.paymentMethod)}`,
      '',
      '========================================',
      '       ¡Gracias por su visita!',
      '========================================',
    );

    return lines.join('\n');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Producto desconocido';
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return invoices
      .filter(inv => new Date(inv.createdAt).toDateString() === today)
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Facturas</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Hoy</p>
            <p className="text-xl font-bold">${getTodayTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {uninvoicedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generar Nueva Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Seleccionar Pedido Completado</Label>
              <Select
                value={selectedOrderId?.toString() || ''}
                onValueChange={(value) => setSelectedOrderId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un pedido" />
                </SelectTrigger>
                <SelectContent>
                  {uninvoicedOrders.map((order) => {
                    const table = tables.find(t => t.id === order.tableId);
                    return (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        Pedido #{order.id.toString().slice(-6)} - Mesa {table?.number} - ${order.total.toFixed(2)}
                      </SelectItem>
                    );
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

            <Button onClick={handleGenerateInvoice} disabled={!selectedOrderId}>
              <FileText className="w-4 h-4 mr-2" />
              Generar Factura
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3>Facturas Generadas</h3>
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No hay facturas generadas
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...invoices].reverse().map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Factura #{invoice.id.toString().slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Mesa {invoice.tableNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {getProductName(item.productId)}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (13%):</span>
                      <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
