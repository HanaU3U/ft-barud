import { API_CONFIG } from './config';

// API Base URL
const API_BASE_URL = API_CONFIG.baseURL;

// Tipos de datos basados en la API
export type ProductoTipo = 'Bebida alcoholica' | 'Bebida no alcoholica' | 'Comida';
export type PedidoEstado = 'Abierto' | 'En preparacion' | 'Cerrado';
export type DetallePedidoEstado = 'Activo' | 'Cancelado';
export type CuentaEstado = 'Abierta' | 'Cerrada';
export type EmpleadoRol = 'Mesero' | 'Bartender' | 'Cajero' | 'Administrador';
export type EmpleadoEstado = 'Activo' | 'Inactivo';
export type MesaEstado = 'Disponible' | 'Ocupada' | 'Reservada';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

// DTOs de respuesta
export interface ProductoResponseDto {
  idProducto: number;
  nombre: string;
  tipo: ProductoTipo;
  precio: number;
  stock: number;
}

export interface PedidoResponseDto {
  idPedido: number;
  idMesa: number;
  idMesero: number;
  fechaHora: string;
  numeroPersonas: number;
  estado: PedidoEstado;
}

export interface DetallePedidoResponseDto {
  idDetalle: number;
  idPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  estado: DetallePedidoEstado;
}

export interface CuentaResponseDto {
  idCuenta: number;
  idPedido: number;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: CuentaEstado;
}

export interface DivisionCuentaResponseDto {
  idDivision: number;
  idCuenta: number;
  descripcion: string;
  monto: number;
}

export interface PagoResponseDto {
  idPago: number;
  idCuenta: number;
  metodo: MetodoPago;
  monto: number;
  fecha: string;
}

export interface EmpleadoResponseDto {
  idEmpleado: number;
  nombre: string;
  rol: EmpleadoRol;
  fechaIngreso: string;
  estado: EmpleadoEstado;
}

export interface MesaResponseDto {
  idMesa: number;
  numero: number;
  capacidad: number;
  estado: MesaEstado;
}

// DTOs de vistas
export interface DetalleCuentaMesaViewDto {
  idCuenta: number;
  numeroMesa: number;
  resumenProductos: string;
  subtotal: number;
  impuestos: number;
  total: number;
  fecha: string;
  cuentaDividida: string;
}

export interface IngresosDiaSemanaViewDto {
  diaSemana: string;
  totalPagos: number;
  ingresosTotales: number;
  promedioPago: number;
}

export interface ProductosMasVendidosViewDto {
  nombre: string;
  tipo: ProductoTipo;
  totalVendido: number;
  ingresos: number;
}

export interface BebidaAlcoholicaMasVendidaViewDto {
  nombre: string;
  totalVendido: number;
}

export interface ComidaNoPedidaViewDto {
  nombre: string;
  precio: number;
}

export interface PedidosPorDiaViewDto {
  fecha: string;
  totalPedidos: number;
  ingresos: number;
}

export interface ProductoDisponibleViewDto {
  idProducto: number;
  nombre: string;
  tipo: ProductoTipo;
  precio: number;
  stock: number;
}

export interface DetallePedidoCompletoViewDto {
  idPedido: number;
  mesa: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: DetallePedidoEstado;
}

export interface PedidosMeseroViewDto {
  idPedido: number;
  numeroMesa: number;
  mesero: string;
  fechaHora: string;
  numeroPersonas: number;
  estado: PedidoEstado;
}

export interface DetallePedidoMeseroViewDto {
  idPedido: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CuentaMesaViewDto {
  idCuenta: number;
  numeroMesa: number;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: CuentaEstado;
}

// Helper para construir query params
function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// API de Productos
export const productosApi = {
  listar: async (filters?: {
    nombre?: string;
    tipo?: ProductoTipo;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    disponibles?: boolean;
    page?: number;
    size?: number;
  }): Promise<ProductoResponseDto[]> => {
    const query = buildQueryParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/productos${query}`);
    if (!response.ok) throw new Error('Error al listar productos');
    return response.json();
  },

  obtener: async (id: number): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`);
    if (!response.ok) throw new Error('Error al obtener producto');
    return response.json();
  },

  crear: async (producto: {
    nombre: string;
    tipo: ProductoTipo;
    precio: number;
    stock: number;
  }): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  },

  actualizar: async (id: number, producto: {
    nombre: string;
    tipo: ProductoTipo;
    precio: number;
    stock: number;
  }): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
  },
};

// API de Pedidos
export const pedidosApi = {
  listar: async (filters?: {
    idMesa?: number;
    idMesero?: number;
    estado?: PedidoEstado;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    size?: number;
  }): Promise<PedidoResponseDto[]> => {
    const query = buildQueryParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/pedidos${query}`);
    if (!response.ok) throw new Error('Error al listar pedidos');
    return response.json();
  },

  obtener: async (id: number): Promise<PedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
    if (!response.ok) throw new Error('Error al obtener pedido');
    return response.json();
  },

  crear: async (pedido: {
    idMesa: number;
    idMesero: number;
    fechaHora: string;
    numeroPersonas: number;
    estado: PedidoEstado;
  }): Promise<PedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    });
    if (!response.ok) throw new Error('Error al crear pedido');
    return response.json();
  },

  actualizar: async (id: number, pedido: {
    idMesa: number;
    idMesero: number;
    fechaHora: string;
    numeroPersonas: number;
    estado: PedidoEstado;
  }): Promise<PedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    });
    if (!response.ok) throw new Error('Error al actualizar pedido');
    return response.json();
  },

  cerrar: async (id: number): Promise<PedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}/cerrar`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al cerrar pedido');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar pedido');
  },
};

// API de Detalles de Pedido
export const detallesPedidoApi = {
  listar: async (): Promise<DetallePedidoResponseDto[]> => {
    const response = await fetch(`${API_BASE_URL}/detalles-pedido`);
    if (!response.ok) throw new Error('Error al listar detalles');
    return response.json();
  },

  obtener: async (id: number): Promise<DetallePedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/detalles-pedido/${id}`);
    if (!response.ok) throw new Error('Error al obtener detalle');
    return response.json();
  },

  crear: async (detalle: {
    idPedido: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    estado: DetallePedidoEstado;
  }): Promise<DetallePedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/detalles-pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detalle),
    });
    if (!response.ok) throw new Error('Error al crear detalle');
    return response.json();
  },

  actualizar: async (id: number, detalle: {
    idPedido: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    estado: DetallePedidoEstado;
  }): Promise<DetallePedidoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/detalles-pedido/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detalle),
    });
    if (!response.ok) throw new Error('Error al actualizar detalle');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/detalles-pedido/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar detalle');
  },
};

// API de Cuentas
export const cuentasApi = {
  listar: async (filters?: {
    idPedido?: number;
    estado?: CuentaEstado;
    minTotal?: number;
    maxTotal?: number;
    page?: number;
    size?: number;
  }): Promise<CuentaResponseDto[]> => {
    const query = buildQueryParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/cuentas${query}`);
    if (!response.ok) throw new Error('Error al listar cuentas');
    return response.json();
  },

  obtener: async (id: number): Promise<CuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/cuentas/${id}`);
    if (!response.ok) throw new Error('Error al obtener cuenta');
    return response.json();
  },

  crear: async (cuenta: {
    idPedido: number;
    subtotal: number;
    impuestos: number;
    total: number;
    estado: CuentaEstado;
  }): Promise<CuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/cuentas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuenta),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear cuenta');
    }
    return response.json();
  },

  actualizar: async (id: number, cuenta: {
    idPedido: number;
    subtotal: number;
    impuestos: number;
    total: number;
    estado: CuentaEstado;
  }): Promise<CuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/cuentas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuenta),
    });
    if (!response.ok) throw new Error('Error al actualizar cuenta');
    return response.json();
  },

  cerrar: async (id: number): Promise<CuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/cuentas/${id}/cerrar`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al cerrar cuenta');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/cuentas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar cuenta');
  },
};

// API de Pagos
export const pagosApi = {
  listar: async (): Promise<PagoResponseDto[]> => {
    const response = await fetch(`${API_BASE_URL}/pagos`);
    if (!response.ok) throw new Error('Error al listar pagos');
    return response.json();
  },

  obtener: async (id: number): Promise<PagoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pagos/${id}`);
    if (!response.ok) throw new Error('Error al obtener pago');
    return response.json();
  },

  crear: async (pago: {
    idCuenta: number;
    metodo: MetodoPago;
    monto: number;
    fecha: string;
  }): Promise<PagoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pago),
    });
    if (!response.ok) throw new Error('Error al crear pago');
    return response.json();
  },

  actualizar: async (id: number, pago: {
    idCuenta: number;
    metodo: MetodoPago;
    monto: number;
    fecha: string;
  }): Promise<PagoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/pagos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pago),
    });
    if (!response.ok) throw new Error('Error al actualizar pago');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/pagos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar pago');
  },
};

// API de Empleados
export const empleadosApi = {
  listar: async (filters?: {
    nombre?: string;
    rol?: EmpleadoRol;
    estado?: EmpleadoEstado;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<EmpleadoResponseDto[]> => {
    const query = buildQueryParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/empleados${query}`);
    if (!response.ok) throw new Error('Error al listar empleados');
    return response.json();
  },

  obtener: async (id: number): Promise<EmpleadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`);
    if (!response.ok) throw new Error('Error al obtener empleado');
    return response.json();
  },

  crear: async (empleado: {
    nombre: string;
    rol: EmpleadoRol;
    fechaIngreso: string;
    estado: EmpleadoEstado;
  }): Promise<EmpleadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/empleados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empleado),
    });
    if (!response.ok) throw new Error('Error al crear empleado');
    return response.json();
  },

  actualizar: async (id: number, empleado: {
    nombre: string;
    rol: EmpleadoRol;
    fechaIngreso: string;
    estado: EmpleadoEstado;
  }): Promise<EmpleadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empleado),
    });
    if (!response.ok) throw new Error('Error al actualizar empleado');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar empleado');
  },
};

// API de Mesas
export const mesasApi = {
  listar: async (): Promise<MesaResponseDto[]> => {
    const response = await fetch(`${API_BASE_URL}/mesas`);
    if (!response.ok) throw new Error('Error al listar mesas');
    return response.json();
  },

  obtener: async (id: number): Promise<MesaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`);
    if (!response.ok) throw new Error('Error al obtener mesa');
    return response.json();
  },

  crear: async (mesa: {
    numero: number;
    capacidad: number;
    estado: MesaEstado;
  }): Promise<MesaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/mesas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mesa),
    });
    if (!response.ok) throw new Error('Error al crear mesa');
    return response.json();
  },

  actualizar: async (id: number, mesa: {
    numero: number;
    capacidad: number;
    estado: MesaEstado;
  }): Promise<MesaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mesa),
    });
    if (!response.ok) throw new Error('Error al actualizar mesa');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar mesa');
  },
};

// API de Divisiones de Cuenta
export const divisionesCuentaApi = {
  listar: async (): Promise<DivisionCuentaResponseDto[]> => {
    const response = await fetch(`${API_BASE_URL}/divisiones-cuenta`);
    if (!response.ok) throw new Error('Error al listar divisiones de cuenta');
    return response.json();
  },

  obtener: async (id: number): Promise<DivisionCuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/divisiones-cuenta/${id}`);
    if (!response.ok) throw new Error('Error al obtener división de cuenta');
    return response.json();
  },

  crear: async (division: {
    idCuenta: number;
    descripcion: string;
    monto: number;
  }): Promise<DivisionCuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/divisiones-cuenta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(division),
    });
    if (!response.ok) throw new Error('Error al crear división de cuenta');
    return response.json();
  },

  actualizar: async (id: number, division: {
    idCuenta: number;
    descripcion: string;
    monto: number;
  }): Promise<DivisionCuentaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/divisiones-cuenta/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(division),
    });
    if (!response.ok) throw new Error('Error al actualizar división de cuenta');
    return response.json();
  },

  eliminar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/divisiones-cuenta/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar división de cuenta');
  },
};

// API de Vistas (solo lectura)
export const vistasApi = {
  detalleCuentaMesa: async (): Promise<DetalleCuentaMesaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/detalle-cuenta-mesa`);
    if (!response.ok) throw new Error('Error al obtener detalle cuenta mesa');
    return response.json();
  },

  ingresosDiaSemana: async (): Promise<IngresosDiaSemanaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/ingresos-dia-semana`);
    if (!response.ok) throw new Error('Error al obtener ingresos por día');
    return response.json();
  },

  productosMasVendidos: async (): Promise<ProductosMasVendidosViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/productos-mas-vendidos`);
    if (!response.ok) throw new Error('Error al obtener productos más vendidos');
    return response.json();
  },

  pedidosPorDia: async (): Promise<PedidosPorDiaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/pedidos-por-dia`);
    if (!response.ok) throw new Error('Error al obtener pedidos por día');
    return response.json();
  },

  productosDisponibles: async (): Promise<ProductoDisponibleViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/productos-disponibles`);
    if (!response.ok) throw new Error('Error al obtener productos disponibles');
    return response.json();
  },

  detallePedidoCompleto: async (): Promise<DetallePedidoCompletoViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/detalle-pedido-completo`);
    if (!response.ok) throw new Error('Error al obtener detalle pedido completo');
    return response.json();
  },

  pedidosActivos: async (): Promise<PedidosMeseroViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/pedidos-activos`);
    if (!response.ok) throw new Error('Error al obtener pedidos activos');
    return response.json();
  },

  pedidosMesero: async (): Promise<PedidosMeseroViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/pedidos-mesero`);
    if (!response.ok) throw new Error('Error al obtener pedidos mesero');
    return response.json();
  },

  detallePedidoMesero: async (): Promise<DetallePedidoMeseroViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/detalle-pedido-mesero`);
    if (!response.ok) throw new Error('Error al obtener detalle pedido mesero');
    return response.json();
  },

  cuentaMesa: async (): Promise<CuentaMesaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/cuenta-mesa`);
    if (!response.ok) throw new Error('Error al obtener cuenta mesa');
    return response.json();
  },

  bebidasAlcoholicasMasVendidas: async (): Promise<BebidaAlcoholicaMasVendidaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/bebidas-alcoholicas-mas-vendidas`);
    if (!response.ok) throw new Error('Error al obtener bebidas alcohólicas más vendidas');
    return response.json();
  },

  comidasNoPedidas: async (): Promise<ComidaNoPedidaViewDto[]> => {
    const response = await fetch(`${API_BASE_URL}/vistas/comidas-no-pedidas`);
    if (!response.ok) throw new Error('Error al obtener comidas no pedidas');
    return response.json();
  },
};
