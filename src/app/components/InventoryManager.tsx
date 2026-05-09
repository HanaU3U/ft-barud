import { useState } from 'react';
import { Product } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Package, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type InventoryManagerProps = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export function InventoryManager({ products, setProducts }: InventoryManagerProps) {
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

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Producto eliminado');
  };

  const handleAddStock = (id: number, quantity: number) => {
    setProducts(products.map(p =>
      p.id === id
        ? { ...p, stock: p.stock + quantity }
        : p
    ));
    toast.success(`Stock actualizado: +${quantity}`);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { label: 'Bajo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Inventario</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
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
                <Label>Stock Inicial</Label>
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
                  <Button onClick={handleUpdate}>Actualizar</Button>
                  <Button variant="outline" onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', category: '', price: 0, stock: 0 });
                  }}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleAdd}>Guardar</Button>
                  <Button variant="outline" onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: '', category: '', price: 0, stock: 0 });
                  }}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3>{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(p => p.category === category).map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          <CardTitle className="text-base">{product.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </div>

                      {product.stock < 10 && (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Stock bajo</span>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <Label className="mb-2 block">Agregar Stock</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddStock(product.id, 5)}
                          >
                            +5
                          </Button>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
