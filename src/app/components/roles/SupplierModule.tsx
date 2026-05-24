import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LogOut, Package, Plus, Edit2, Save, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { productosApi, ProductoResponseDto, ProductoTipo } from '../../../services/api';

type SupplierModuleProps = {
  onLogout: () => void;
};

export function SupplierModule({ onLogout }: SupplierModuleProps) {
  const [products, setProducts] = useState<ProductoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '' as ProductoTipo | '',
    precio: 0,
    stock: 0,
  });

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productosApi.listar();
      setProducts(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.nombre || !formData.tipo || formData.precio <= 0) {
      toast.error('Completa todos los campos correctamente');
      return;
    }

    try {
      const newProduct = await productosApi.crear({
        nombre: formData.nombre,
        tipo: formData.tipo as ProductoTipo,
        precio: formData.precio,
        stock: formData.stock,
      });

      setProducts([...products, newProduct]);
      setFormData({ nombre: '', tipo: '', precio: 0, stock: 0 });
      setIsAdding(false);
      toast.success('Producto agregado');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear producto');
    }
  };

  const handleEdit = (product: ProductoResponseDto) => {
    setEditingId(product.idProducto);
    setFormData({
      nombre: product.nombre,
      tipo: product.tipo,
      precio: product.precio,
      stock: product.stock,
    });
  };

  const handleUpdate = async () => {
    if (!formData.nombre || !formData.tipo || formData.precio <= 0 || !editingId) {
      toast.error('Completa todos los campos correctamente');
      return;
    }

    try {
      const updated = await productosApi.actualizar(editingId, {
        nombre: formData.nombre,
        tipo: formData.tipo as ProductoTipo,
        precio: formData.precio,
        stock: formData.stock,
      });

      setProducts(products.map(p => p.idProducto === editingId ? updated : p));
      setEditingId(null);
      setFormData({ nombre: '', tipo: '', precio: 0, stock: 0 });
      toast.success('Producto actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productosApi.eliminar(id);
      setProducts(products.filter(p => p.idProducto !== id));
      toast.success('Producto eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar producto');
    }
  };

  const handleAddStock = async (id: number, quantity: number) => {
    const product = products.find(p => p.idProducto === id);
    if (!product) return;

    try {
      const updated = await productosApi.actualizar(id, {
        nombre: product.nombre,
        tipo: product.tipo as ProductoTipo,
        precio: product.precio,
        stock: product.stock + quantity,
      });

      setProducts(products.map(p => p.idProducto === id ? updated : p));
      toast.success(`Stock actualizado: +${quantity}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar stock');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ nombre: '', tipo: '', precio: 0, stock: 0 });
  };

  const categories = [...new Set(products.map(p => p.tipo))];

  const tiposProducto: ProductoTipo[] = ['Bebida alcoholica', 'Bebida no alcoholica', 'Comida'];

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Módulo de Proveedor</h1>
            <p className="text-gray-600">Gestión de Productos del Bar</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadProducts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2>Inventario de Productos</h2>
            <Button onClick={() => setIsAdding(!isAdding)} disabled={editingId !== null}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          {(isAdding || editingId !== null) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Producto</Label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Cerveza Artesanal"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value as ProductoTipo })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposProducto.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Precio ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingId ? (
                    <>
                      <Button onClick={handleUpdate}>
                        <Save className="w-4 h-4 mr-2" />
                        Actualizar
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleAdd}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <h3>{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(p => p.tipo === category).map((product) => (
                    <Card key={product.idProducto}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            <CardTitle className="text-base">{product.nombre}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio:</span>
                          <span className="font-bold">${product.precio.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stock:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{product.stock}</span>
                            {product.stock < 10 && (
                              <Badge className="bg-yellow-100 text-yellow-800">Bajo</Badge>
                            )}
                            {product.stock === 0 && (
                              <Badge className="bg-red-100 text-red-800">Agotado</Badge>
                            )}
                          </div>
                        </div>

                        {product.stock < 10 && (
                          <div className="flex items-center gap-2 text-yellow-600 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Stock bajo</span>
                          </div>
                        )}

                        <div className="pt-2 border-t space-y-3">
                          <div>
                            <Label className="mb-2 block">Agregar Stock</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddStock(product.idProducto, 10)}
                              >
                                +10
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddStock(product.idProducto, 25)}
                              >
                                +25
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddStock(product.idProducto, 50)}
                              >
                                +50
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleEdit(product)}
                              disabled={isAdding || editingId !== null}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleDelete(product.idProducto)}
                              disabled={isAdding || editingId !== null}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
