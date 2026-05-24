# Guía de Integración con Backend

## Configuración de la API

La URL base de la API se configura en `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
};
```

Para cambiar la URL, crea un archivo `.env` en la raíz del proyecto:

```
VITE_API_URL=http://tu-servidor:puerto/api
```

## Servicios Disponibles

Todos los servicios están en `src/services/api.ts`:

- `productosApi` - CRUD de productos
- `pedidosApi` - CRUD de pedidos  
- `detallesPedidoApi` - CRUD de detalles de pedido
- `cuentasApi` - CRUD de cuentas
- `pagosApi` - CRUD de pagos
- `empleadosApi` - CRUD de empleados
- `mesasApi` - CRUD de mesas
- `vistasApi` - Consultas de solo lectura (reportes)

## Mapeo de Datos Frontend ↔ Backend

### Productos
- Frontend `category` → Backend `tipo` (ProductoTipo)
- Frontend `active` → No existe en backend (manejar localmente o eliminar del stock)
- Tipos válidos: 'Bebida', 'Comida', 'Bebida Alcoholica'

### Empleados/Meseros
- Frontend `Waiter` → Backend `Empleado`
- Backend tiene `rol`: 'Mesero', 'Cocinero', 'Administrador', 'Proveedor'
- Backend tiene `estado`: 'Activo', 'Inactivo'

### Mesas
- Backend `numero` es `number`, no `string`
- Estados: 'Disponible', 'Ocupada', 'Reservada'

### Pedidos
- El backend maneja pedidos con `numeroPersonas`
- Los detalles del pedido se gestionan por separado en `/api/detalles-pedido`

### Cuentas (Facturas)
- Frontend `Invoice` → Backend `Cuenta`
- Las cuentas se crean automáticamente desde pedidos
- Estados: 'Abierta', 'Cerrada'

## Ejemplo de Uso

```typescript
import { productosApi, ProductoTipo } from '../services/api';

// Listar productos
const productos = await productosApi.listar({ disponibles: true });

// Crear producto
const nuevoProducto = await productosApi.crear({
  nombre: 'Coca Cola',
  tipo: 'Bebida',
  precio: 1500,
  stock: 20
});

// Actualizar stock
await productosApi.actualizar(id, { stock: nuevoStock });
```

## Cambios Necesarios en los Componentes

1. **SupplierModule**: Usar `productosApi` para CRUD de productos
2. **WaiterModule**: Usar `pedidosApi`, `detallesPedidoApi`, `cuentasApi` y `pagosApi`
3. **AdminModule**: Usar `vistasApi` para reportes y todos los demás servicios
4. **Login**: Usar `empleadosApi.listar()` para autenticación

## Manejo de Errores

Todos los métodos de API lanzan errores que deben capturarse:

```typescript
try {
  await productosApi.crear(producto);
  toast.success('Producto creado');
} catch (error) {
  toast.error(error.message || 'Error al crear producto');
}
```
