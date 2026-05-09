import { useState } from 'react';
import { Toaster } from 'sonner';
import { Login } from './components/Login';
import { WaiterModule } from './components/roles/WaiterModule';
import { SupplierModule } from './components/roles/SupplierModule';
import { AdminModule } from './components/roles/AdminModule';

export type Table = {
  id: number;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  waiterId?: number;
};

export type Waiter = {
  id: number;
  name: string;
  active: boolean;
  email?: string;
  phone?: string;
  hireDate?: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
};

export type OrderItem = {
  productId: number;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  tableId: number;
  waiterId?: number;
  items: OrderItem[];
  status: 'pending' | 'completed' | 'cancelled';
  paid: boolean;
  createdAt: Date;
  total: number;
};

export type Invoice = {
  id: number;
  orderId: number;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  paymentMethod: string;
};

export type UserRole = 'waiter' | 'supplier' | 'admin' | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: '1', capacity: 4, status: 'available' },
    { id: 2, number: '2', capacity: 2, status: 'available' },
    { id: 3, number: '3', capacity: 6, status: 'available' },
    { id: 4, number: '4', capacity: 4, status: 'available' },
    { id: 5, number: '5', capacity: 4, status: 'available' },
    { id: 6, number: '6', capacity: 8, status: 'available' },
  ]);

  const [waiters, setWaiters] = useState<Waiter[]>([
    { id: 1, name: 'Juan Pérez', active: true, email: 'juan@bar.com', phone: '555-0101', hireDate: '2024-01-15' },
    { id: 2, name: 'María García', active: true, email: 'maria@bar.com', phone: '555-0102', hireDate: '2024-02-20' },
    { id: 3, name: 'Carlos López', active: true, email: 'carlos@bar.com', phone: '555-0103', hireDate: '2024-03-10' },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Cerveza', category: 'Bebidas', price: 5.00, stock: 100, active: true },
    { id: 2, name: 'Mojito', category: 'Cócteles', price: 8.50, stock: 50, active: true },
    { id: 3, name: 'Nachos', category: 'Comida', price: 7.00, stock: 30, active: true },
    { id: 4, name: 'Alitas', category: 'Comida', price: 9.50, stock: 25, active: true },
    { id: 5, name: 'Margarita', category: 'Cócteles', price: 9.00, stock: 40, active: true },
    { id: 6, name: 'Agua Mineral', category: 'Bebidas', price: 2.50, stock: 150, active: true },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleLogin = (role: UserRole, userId?: number) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    setCurrentUserId(userId || null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole(null);
    setCurrentUserId(null);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="size-full bg-gray-50">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : currentRole === 'waiter' ? (
          <WaiterModule
            waiterId={currentUserId!}
            waiters={waiters}
            tables={tables}
            setTables={setTables}
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            invoices={invoices}
            setInvoices={setInvoices}
            onLogout={handleLogout}
          />
        ) : currentRole === 'supplier' ? (
          <SupplierModule
            products={products}
            setProducts={setProducts}
            onLogout={handleLogout}
          />
        ) : currentRole === 'admin' ? (
          <AdminModule
            tables={tables}
            setTables={setTables}
            waiters={waiters}
            setWaiters={setWaiters}
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            invoices={invoices}
            onLogout={handleLogout}
          />
        ) : null}
      </div>
    </>
  );
}