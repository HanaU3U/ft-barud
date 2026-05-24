
# Bar Management Dashboard — ft-barud

Sistema de gestión integral para bares y restaurantes. Permite administrar mesas, pedidos, productos, empleados y cuentas desde una interfaz web con roles diferenciados.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Componentes UI | shadcn/ui (Radix UI) |
| Iconos | Lucide React |
| Notificaciones | Sonner |
| Gráficas | Recharts |
| Gestión de formularios | React Hook Form |
| Gestor de paquetes | pnpm |

---

## Requisitos

- **Node.js** 18 o superior
- **pnpm** 8 o superior

```bash
npm install -g pnpm
```

---

## Instalación

```bash
git clone https://github.com/tu-usuario/ft-barud.git
cd ft-barud
pnpm install
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
```

Si no se define `VITE_API_URL`, todas las llamadas se harán contra `/api` (útil con un proxy de Vite).

---

## Ejecución

```bash
# Servidor de desarrollo
pnpm dev

# Build de producción
pnpm build
```

---

## Estructura del proyecto

```
src/
├── main.tsx                   # Punto de entrada
├── app/
│   ├── App.tsx                # Lógica de autenticación y tipos globales
│   └── components/
│       ├── Login.tsx          # Pantalla de inicio de sesión
│       ├── RoleSelector.tsx   # Selección de rol tras autenticar
│       ├── InventoryManager.tsx
│       ├── InvoicesManager.tsx
│       ├── OrdersManager.tsx
│       ├── TablesManager.tsx
│       ├── WaitersManager.tsx
│       ├── roles/
│       │   ├── WaiterModule.tsx    # Módulo del mesero
│       │   ├── AdminModule.tsx     # Módulo del administrador
│       │   └── SupplierModule.tsx  # Módulo del proveedor/bartender
│       └── ui/                     # Componentes shadcn/ui
├── services/
│   ├── api.ts                 # Clientes HTTP y tipos DTO
│   └── config.ts              # URL base de la API
└── styles/
    ├── globals.css
    ├── theme.css
    └── index.css
```

---

## Roles y funcionalidades

### Mesero (`waiter`)

| Sección | Descripción |
|---------|------------|
| **Mesas** | Ver estado de mesas (disponible / ocupada / reservada), abrir y cerrar mesas |
| **Mis Pedidos — Activos** | Pedidos con estado `Abierto` o `En preparación`; agregar/editar/eliminar productos |
| **Mis Pedidos — Historial** | Pedidos `Cerrados`; vista de solo lectura con detalle de productos |
| **Recibos** | Generar cuenta, registrar pago (efectivo / tarjeta / transferencia), división de cuenta automática por número de personas |

**División de cuenta:** Al activar la opción, basta con ingresar el nombre de cada persona; el monto por persona se calcula automáticamente dividiendo el total del pedido entre el número de comensales.

---

### Administrador (`admin`)

| Sección | Descripción |
|---------|------------|
| **Dashboard** | Resumen de mesas activas, pedidos del día e ingresos |
| **Pedidos — Pedidos por Día** | Tabla de pedidos agrupados por fecha con total de ingresos |
| **Pedidos — Cuentas por Mesa** | Detalle de cuentas por mesa; al seleccionar una fila se despliega el detalle de pedidos filtrado por esa mesa |
| **Reportes — Ingresos por Día** | Gráfica de ingresos diarios de la semana |
| **Reportes — Productos Más Vendidos** | Ranking de productos con mayor demanda |
| **Inventario — Bebidas alcohólicas más vendidas** | Consulta de bebidas alcohólicas más pedidas |
| **Inventario — Comidas no pedidas** | Productos de comida sin movimiento |
| **Empleados** | Gestión de meseros y bartenders (alta, edición, activar/desactivar) |

---

### Proveedor / Bartender (`supplier`)

| Sección | Descripción |
|---------|------------|
| **Pedidos activos** | Lista de pedidos en preparación asignados al bartender |
| **Inventario** | Gestión de productos: crear, editar precio/stock, eliminar |

---

## API REST

La aplicación consume una API REST. Los endpoints principales son:

| Recurso | Base path |
|---------|----------|
| Productos | `/api/productos` |
| Mesas | `/api/mesas` |
| Pedidos | `/api/pedidos` |
| Detalles de pedido | `/api/detalles-pedido` |
| Cuentas | `/api/cuentas` |
| Pagos | `/api/pagos` |
| Divisiones de cuenta | `/api/divisiones-cuenta` |
| Empleados | `/api/empleados` |
| Vistas de reportes | `/api/vistas/...` |

Consulta [`src/imports/pasted_text/api-docs.md`](src/imports/pasted_text/api-docs.md) para la documentación completa de cada endpoint.

### Tipos de datos principales

```ts
type ProductoTipo   = 'Bebida alcoholica' | 'Bebida no alcoholica' | 'Comida'
type PedidoEstado   = 'Abierto' | 'En preparacion' | 'Cerrado'
type MesaEstado     = 'Disponible' | 'Ocupada' | 'Reservada'
type EmpleadoRol    = 'Mesero' | 'Bartender' | 'Cajero' | 'Administrador'
type MetodoPago     = 'Efectivo' | 'Tarjeta' | 'Transferencia'
```

---

## Diseño original

El diseño base del proyecto fue creado en Figma:  
[Bar Management Dashboard — Figma](https://www.figma.com/design/qoBD2koi1AEKUhUrkiXMgk/Bar-Management-Dashboard)
