## Productos — `/api/productos`

### `GET /api/productos`
Lista productos con filtros opcionales y paginación.

**Query params:**

| Parámetro   | Tipo          | Requerido | Descripción                                      |
|-------------|---------------|-----------|--------------------------------------------------|
| `nombre`    | `string`      | No        | Filtra por nombre (búsqueda parcial, ignora mayúsculas) |
| `tipo`      | `ProductoTipo`| No        | Filtra por tipo de producto                      |
| `minPrecio` | `number`      | No        | Precio mínimo                                    |
| `maxPrecio` | `number`      | No        | Precio máximo                                    |
| `minStock`  | `integer`     | No        | Stock mínimo                                     |
| `disponibles` | `boolean`   | No        | `true` = stock > 0 / `false` = stock = 0        |
| `page`      | `integer`     | No        | Número de página (default `0`)                  |
| `size`      | `integer`     | No        | Tamaño de página (default `10`)                 |

**Retorna:** `200 OK` — `List<ProductoResponseDto>`

```json
[
  {
    "idProducto": 1,
    "nombre": "Coca Cola",
    "tipo": "Bebida",
    "precio": 1500.00,
    "stock": 20
  }
]
```

---

### `GET /api/productos/{id}`
Obtiene un producto por su ID.

**Path param:** `id` — ID del producto.

**Retorna:**
- `200 OK` — `ProductoResponseDto`
- `404 Not Found` — si no existe

---

### `POST /api/productos`
Crea un nuevo producto.

**Body:** `Producto` (JSON)

```json
{
  "nombre": "Coca Cola",
  "tipo": "Bebida",
  "precio": 1500.00,
  "stock": 20
}
```

**Retorna:** `200 OK` — `ProductoResponseDto` con el ID generado.

---

### `PUT /api/productos/{id}`
Actualiza un producto existente.

**Path param:** `id` — ID del producto.  
**Body:** `Producto` (JSON) con los campos a actualizar.

**Retorna:**
- `200 OK` — `ProductoResponseDto` actualizado
- `404 Not Found` — si no existe

---

### `DELETE /api/productos/{id}`
Elimina un producto por su ID.

**Path param:** `id` — ID del producto.

**Retorna:**
- `204 No Content` — eliminado correctamente
- `404 Not Found` — si no existe

---

## Pedidos — `/api/pedidos`

### `GET /api/pedidos`
Lista pedidos con filtros opcionales y paginación.

**Query params:**

| Parámetro     | Tipo             | Requerido | Descripción                         |
|---------------|------------------|-----------|-------------------------------------|
| `idMesa`      | `integer`        | No        | Filtra por mesa                     |
| `idMesero`    | `integer`        | No        | Filtra por mesero                   |
| `estado`      | `PedidoEstado`   | No        | Filtra por estado del pedido        |
| `fechaDesde`  | `LocalDateTime`  | No        | Fecha/hora mínima del pedido        |
| `fechaHasta`  | `LocalDateTime`  | No        | Fecha/hora máxima del pedido        |
| `page`        | `integer`        | No        | Número de página (default `0`)     |
| `size`        | `integer`        | No        | Tamaño de página (default `10`)    |

**Retorna:** `200 OK` — `List<PedidoResponseDto>`

```json
[
  {
    "idPedido": 1,
    "idMesa": 3,
    "idMesero": 2,
    "fechaHora": "2026-05-16T14:30:00",
    "numeroPersonas": 4,
    "estado": "Abierto"
  }
]
```

---

### `GET /api/pedidos/{id}`
Obtiene un pedido por su ID.

**Retorna:**
- `200 OK` — `PedidoResponseDto`
- `404 Not Found`

---

### `POST /api/pedidos`
Crea un nuevo pedido.

**Body:** `Pedido` (JSON)

```json
{
  "idMesa": 3,
  "idMesero": 2,
  "numeroPersonas": 4
}
```

**Retorna:** `200 OK` — `PedidoResponseDto`

---

### `PUT /api/pedidos/{id}`
Actualiza un pedido existente.

**Retorna:**
- `200 OK` — `PedidoResponseDto`
- `404 Not Found`

---

### `PUT /api/pedidos/{id}/cerrar`
Cierra el pedido y libera la mesa asociada (cambia su estado a disponible).

**Retorna:**
- `200 OK` — `PedidoResponseDto`
- `404 Not Found`

---

### `DELETE /api/pedidos/{id}`
Elimina un pedido por su ID.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Detalles de Pedido — `/api/detalles-pedido`

### `GET /api/detalles-pedido`
Lista todos los detalles de pedido.

**Retorna:** `200 OK` — `List<DetallePedidoResponseDto>`

```json
[
  {
    "idDetalle": 1,
    "idPedido": 5,
    "idProducto": 2,
    "cantidad": 3,
    "precioUnitario": 1500.00,
    "estado": "Pendiente"
  }
]
```

---

### `GET /api/detalles-pedido/{id}`
Obtiene un detalle por su ID.

**Retorna:**
- `200 OK` — `DetallePedidoResponseDto`
- `404 Not Found`

---

### `POST /api/detalles-pedido`
Crea un nuevo detalle de pedido.

**Body:** `DetallePedido` (JSON)

```json
{
  "idPedido": 5,
  "idProducto": 2,
  "cantidad": 3,
  "precioUnitario": 1500.00,
  "estado": "Pendiente"
}
```

**Retorna:** `200 OK` — `DetallePedidoResponseDto`

---

### `PUT /api/detalles-pedido/{id}`
Actualiza un detalle de pedido.

**Retorna:**
- `200 OK` — `DetallePedidoResponseDto`
- `404 Not Found`

---

### `DELETE /api/detalles-pedido/{id}`
Elimina un detalle de pedido.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Cuentas — `/api/cuentas`

### `GET /api/cuentas`
Lista cuentas con filtros opcionales y paginación.

**Query params:**

| Parámetro  | Tipo           | Requerido | Descripción                          |
|------------|----------------|-----------|--------------------------------------|
| `idPedido` | `integer`      | No        | Filtra por pedido asociado           |
| `estado`   | `CuentaEstado` | No        | Filtra por estado de la cuenta       |
| `minTotal` | `number`       | No        | Total mínimo                         |
| `maxTotal` | `number`       | No        | Total máximo                         |
| `page`     | `integer`      | No        | Número de página (default `0`)      |
| `size`     | `integer`      | No        | Tamaño de página (default `10`)     |

**Retorna:** `200 OK` — `List<CuentaResponseDto>`

```json
[
  {
    "idCuenta": 1,
    "idPedido": 5,
    "subtotal": 10000.00,
    "impuestos": 1900.00,
    "total": 11900.00,
    "estado": "Abierta"
  }
]
```

---

### `GET /api/cuentas/{id}`
Obtiene una cuenta por su ID.

**Retorna:**
- `200 OK` — `CuentaResponseDto`
- `404 Not Found`

---

### `POST /api/cuentas`
Crea una nueva cuenta para un pedido.

**Body:** `Cuenta` (JSON)

```json
{
  "idPedido": 5,
  "subtotal": 10000.00,
  "impuestos": 1900.00,
  "total": 11900.00
}
```

**Retorna:**
- `200 OK` — `CuentaResponseDto`
- `409 Conflict` — si ya existe una cuenta abierta para ese pedido (`{ "message": "..." }`)

---

### `PUT /api/cuentas/{id}`
Actualiza una cuenta existente.

**Retorna:**
- `200 OK` — `CuentaResponseDto`
- `404 Not Found`
- `409 Conflict` — si hay conflicto de estado

---

### `PUT /api/cuentas/{id}/cerrar`
Cierra la cuenta y el pedido asociado.

**Retorna:**
- `200 OK` — `CuentaResponseDto`
- `404 Not Found`

---

### `DELETE /api/cuentas/{id}`
Elimina una cuenta.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Divisiones de Cuenta — `/api/divisiones-cuenta`

### `GET /api/divisiones-cuenta`
Lista todas las divisiones de cuenta.

**Retorna:** `200 OK` — `List<DivisionCuentaResponseDto>`

```json
[
  {
    "idDivision": 1,
    "idCuenta": 3,
    "descripcion": "Parte de Juan",
    "monto": 3500.00
  }
]
```

---

### `GET /api/divisiones-cuenta/{id}`
Obtiene una división por su ID.

**Retorna:**
- `200 OK` — `DivisionCuentaResponseDto`
- `404 Not Found`

---

### `POST /api/divisiones-cuenta`
Crea una nueva división de cuenta.

**Body:** `DivisionCuenta` (JSON)

```json
{
  "idCuenta": 3,
  "descripcion": "Parte de Juan",
  "monto": 3500.00
}
```

**Retorna:** `200 OK` — `DivisionCuentaResponseDto`

---

### `PUT /api/divisiones-cuenta/{id}`
Actualiza una división de cuenta.

**Retorna:**
- `200 OK` — `DivisionCuentaResponseDto`
- `404 Not Found`

---

### `DELETE /api/divisiones-cuenta/{id}`
Elimina una división de cuenta.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Pagos — `/api/pagos`

### `GET /api/pagos`
Lista todos los pagos.

**Retorna:** `200 OK` — `List<PagoResponseDto>`

```json
[
  {
    "idPago": 1,
    "idCuenta": 3,
    "metodo": "Efectivo",
    "monto": 11900.00,
    "fecha": "2026-05-16T15:00:00"
  }
]
```

---

### `GET /api/pagos/{id}`
Obtiene un pago por su ID.

**Retorna:**
- `200 OK` — `PagoResponseDto`
- `404 Not Found`

---

### `POST /api/pagos`
Registra un nuevo pago.

**Body:** `Pago` (JSON)

```json
{
  "idCuenta": 3,
  "metodo": "Efectivo",
  "monto": 11900.00
}
```

**Retorna:** `200 OK` — `PagoResponseDto`

---

### `PUT /api/pagos/{id}`
Actualiza un pago existente.

**Retorna:**
- `200 OK` — `PagoResponseDto`
- `404 Not Found`

---

### `DELETE /api/pagos/{id}`
Elimina un pago.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Empleados — `/api/empleados`

### `GET /api/empleados`
Lista empleados con filtros opcionales.

**Query params:**

| Parámetro    | Tipo            | Requerido | Descripción                              |
|--------------|-----------------|-----------|------------------------------------------|
| `nombre`     | `string`        | No        | Filtra por nombre (búsqueda parcial)     |
| `rol`        | `EmpleadoRol`   | No        | Filtra por rol del empleado              |
| `estado`     | `EmpleadoEstado`| No        | Filtra por estado del empleado           |
| `fechaDesde` | `LocalDate`     | No        | Fecha de ingreso mínima                  |
| `fechaHasta` | `LocalDate`     | No        | Fecha de ingreso máxima                  |

**Retorna:** `200 OK` — `List<EmpleadoResponseDto>`

```json
[
  {
    "idEmpleado": 1,
    "nombre": "Carlos García",
    "rol": "Mesero",
    "fechaIngreso": "2024-01-15",
    "estado": "Activo"
  }
]
```

---

### `GET /api/empleados/{id}`
Obtiene un empleado por su ID.

**Retorna:**
- `200 OK` — `EmpleadoResponseDto`
- `404 Not Found`

---

### `POST /api/empleados`
Crea un nuevo empleado.

**Body:** `Empleado` (JSON)

```json
{
  "nombre": "Carlos García",
  "rol": "Mesero",
  "fechaIngreso": "2024-01-15",
  "estado": "Activo"
}
```

**Retorna:** `200 OK` — `EmpleadoResponseDto`

---

### `PUT /api/empleados/{id}`
Actualiza un empleado existente.

**Retorna:**
- `200 OK` — `EmpleadoResponseDto`
- `404 Not Found`

---

### `DELETE /api/empleados/{id}`
Elimina un empleado.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Mesas — `/api/mesas`

### `GET /api/mesas`
Lista todas las mesas.

**Retorna:** `200 OK` — `List<MesaResponseDto>`

```json
[
  {
    "idMesa": 1,
    "numero": 5,
    "capacidad": 4,
    "estado": "Disponible"
  }
]
```

---

### `GET /api/mesas/{id}`
Obtiene una mesa por su ID.

**Retorna:**
- `200 OK` — `MesaResponseDto`
- `404 Not Found`

---

### `POST /api/mesas`
Crea una nueva mesa.

**Body:** `Mesa` (JSON)

```json
{
  "numero": 5,
  "capacidad": 4,
  "estado": "Disponible"
}
```

**Retorna:** `200 OK` — `MesaResponseDto`

---

### `PUT /api/mesas/{id}`
Actualiza una mesa existente.

**Retorna:**
- `200 OK` — `MesaResponseDto`
- `404 Not Found`

---

### `DELETE /api/mesas/{id}`
Elimina una mesa.

**Retorna:**
- `204 No Content`
- `404 Not Found`

---

## Vistas / Consultas — `/api/vistas`

Todos los endpoints de esta sección son `GET` de solo lectura, sin parámetros. Ejecutan consultas analíticas sobre la base de datos.

---

### `GET /api/vistas/detalle-cuenta-mesa`
Muestra el detalle completo de cada cuenta con la mesa, productos, subtotal, impuestos, total y fecha.

**Retorna:** `200 OK` — `List<DetalleCuentaMesaViewDto>`

```json
[
  {
    "idCuenta": 1,
    "numeroMesa": 3,
    "resumenProductos": "Coca Cola x2, Milanesa x1",
    "subtotal": 8000.00,
    "impuestos": 1520.00,
    "total": 9520.00,
    "fecha": "2026-05-16T14:00:00",
    "cuentaDividida": "No"
  }
]
```

---

### `GET /api/vistas/ingresos-dia-semana`
Muestra los ingresos agrupados por día de la semana, con el total de pagos y el promedio por pago.

**Retorna:** `200 OK` — `List<IngresosDiaSemanaViewDto>`

```json
[
  {
    "diaSemana": "Lunes",
    "totalPagos": 12,
    "ingresosTotales": 95000.00,
    "promedioPago": 7916.67
  }
]
```

---

### `GET /api/vistas/productos-mas-vendidos`
Lista los productos ordenados por cantidad total vendida con sus ingresos generados.

**Retorna:** `200 OK` — `List<ProductosMasVendidosViewDto>`

```json
[
  {
    "nombre": "Coca Cola",
    "tipo": "Bebida",
    "totalVendido": 150,
    "ingresos": 225000.00
  }
]
```

---

### `GET /api/vistas/pedidos-por-dia`
Muestra la cantidad de pedidos e ingresos agrupados por fecha.

**Retorna:** `200 OK` — `List<PedidosPorDiaViewDto>`

```json
[
  {
    "fecha": "2026-05-16",
    "totalPedidos": 25,
    "ingresos": 320000.00
  }
]
```

---

### `GET /api/vistas/productos-disponibles`
Lista los productos con stock mayor a cero.

**Retorna:** `200 OK` — `List<ProductoDisponibleViewDto>`

```json
[
  {
    "idProducto": 1,
    "nombre": "Coca Cola",
    "tipo": "Bebida",
    "precio": 1500.00,
    "stock": 20
  }
]
```

---

### `GET /api/vistas/detalle-pedido-completo`
Muestra el detalle completo de cada ítem de pedido: mesa, producto, cantidad, precio unitario, subtotal y estado.

**Retorna:** `200 OK` — `List<DetallePedidoCompletoViewDto>`

```json
[
  {
    "idPedido": 5,
    "mesa": 3,
    "producto": "Milanesa",
    "cantidad": 2,
    "precioUnitario": 4500.00,
    "subtotal": 9000.00,
    "estado": "Entregado"
  }
]
```

---

### `GET /api/vistas/pedidos-activos`
Lista los pedidos con estado activo (no cerrados), incluyendo mesa, mesero y número de personas.

**Retorna:** `200 OK` — `List<PedidosMeseroViewDto>`

```json
[
  {
    "idPedido": 5,
    "numeroMesa": 3,
    "mesero": "Carlos García",
    "fechaHora": "2026-05-16T14:30:00",
    "numeroPersonas": 4,
    "estado": "Abierto"
  }
]
```

---

### `GET /api/vistas/pedidos-mesero`
Lista todos los pedidos junto con la información del mesero asignado.

**Retorna:** `200 OK` — `List<PedidosMeseroViewDto>` (misma estructura que `/pedidos-activos`)

---

### `GET /api/vistas/detalle-pedido-mesero`
Muestra los ítems de cada pedido con producto, cantidad, precio unitario y subtotal, pensado para la vista del mesero.

**Retorna:** `200 OK` — `List<DetallePedidoMeseroViewDto>`

```json
[
  {
    "idPedido": 5,
    "producto": "Coca Cola",
    "cantidad": 3,
    "precioUnitario": 1500.00,
    "subtotal": 4500.00
  }
]
```

---

### `GET /api/vistas/cuenta-mesa`
Muestra el resumen de cada cuenta con su mesa, subtotal, impuestos, total y estado.

**Retorna:** `200 OK` — `List<CuentaMesaViewDto>`

```json
[
  {
    "idCuenta": 1,
    "numeroMesa": 3,
    "subtotal": 8000.00,
    "impuestos": 1520.00,
    "total": 9520.00,
    "estado": "Abierta"
  }
]
```

---

### `GET /api/vistas/division-cuenta-mesa`
Muestra las divisiones de cuenta con el número de mesa, descripción y monto de cada parte.

**Retorna:** `200 OK` — `List<DivisionCuentaMesaViewDto>`

```json
[
  {
    "idDivision": 1,
    "numeroMesa": 3,
    "descripcion": "Parte de Juan",
    "monto": 3500.00
  }
]
```

---

### `GET /api/vistas/bebidas-alcoholicas-mas-vendidas`
Retorna las bebidas alcohólicas cuya cantidad total vendida supera el promedio de sus propias ventas por pedido. Ordenadas de menor a mayor por total vendido.

**Retorna:** `200 OK` — `List<BebidaAlcoholicaMasVendidaViewDto>`

```json
[
  {
    "nombre": "Fernet con Coca",
    "totalVendido": 45
  }
]
```

---

### `GET /api/vistas/comidas-no-pedidas`
Lista los productos de tipo `Comida` que nunca han sido incluidos en ningún pedido. Ordenados por precio ascendente.

**Retorna:** `200 OK` — `List<ComidaNoPedidaViewDto>`

```json
[
  {
    "nombre": "Ensalada César",
    "precio": 3200.00
  }
]
```
