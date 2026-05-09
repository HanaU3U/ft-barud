import { useState } from 'react';
import { Product } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { LogOut, Package, Plus, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type SupplierModuleProps = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onLogout: () => void;
};

export function SupplierModule({ products, setProducts, onLogout }: SupplierModuleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
  });

  const handleAdd = () => {
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error('Completa todos los campos correctamente');
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      active: true,
    };

    setProducts([...products, newProduct]);
    setFormData({ name: '', category: '', price: 0, stock: 0 });
    setIsAdding(false);
    toast.success('Producto agregado');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast.error('Completa todos los campos correctamente');
      return;
    }

    setProducts(products.map(p =>
      p.id === editingId
        ? { ...p, ...formData }
        : p
    ));
    setEditingId(null);
    setFormData({ name: '', category: '', price: 0, stock: 0 });
    toast.success('Producto actualizado');
  };

  const handleToggleActive = (id: number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
    const product = products.find(p => p.id === id);
    toast.success(`Producto ${product?.active ? 'desactivado' : 'activado'}`);
  };

  const handleAddStock = (id: number, quantity: number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, stock: p.stock + quantity } : p
    ));
    toast.success(`Stock actualizado: +${quantity}`);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', category: '', price: 0, stock: 0 });
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="size-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Módulo de Proveedor</h1>
            <p className="text-gray-600">Gestión de Productos del Bar</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Cerveza Artesanal"
                    />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ej: Bebidas"
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <Label>Precio ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
                  {products.filter(p => p.category === category).map((product) => (
                    <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            <CardTitle className="text-base">{product.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {!product.active && (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio:</span>
                          <span className="font-bold">${product.price.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stock:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{product.stock}</span>
                            {product.stock < 10 && product.active && (
                              <Badge className="bg-yellow-100 text-yellow-800">Bajo</Badge>
                            )}
                          </div>
                        </div>

                        {product.stock < 10 && product.active && (
                          <div className="flex items-center gap-2 text-yellow-600 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Stock bajo</span>
                          </div>
                        )}

                        <div className="pt-2 border-t space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Estado</Label>
                            <Switch
                              checked={product.active}
                              onCheckedChange={() => handleToggleActive(product.id)}
                            />
                          </div>

                          {product.active && (
                            <>
                              <div>
                                <Label className="mb-2 block">Agregar Stock</Label>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddStock(product.id, 10)}
                                  >
                                    +10
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddStock(product.id, 25)}
                                  >
                                    +25
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddStock(product.id, 50)}
                                  >
                                    +50
                                  </Button>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEdit(product)}
                                disabled={isAdding || editingId !== null}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            </>
                          )}
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
