import { useState } from 'react';
import { Table, Waiter } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';

type TablesManagerProps = {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  waiters: Waiter[];
};

export function TablesManager({ tables, setTables, waiters }: TablesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ number: '', capacity: 4, status: 'available' as const });

  const handleAdd = () => {
    if (!formData.number) return;
    const newTable: Table = {
      id: Date.now(),
      number: formData.number,
      capacity: formData.capacity,
      status: formData.status,
    };
    setTables([...tables, newTable]);
    setFormData({ number: '', capacity: 4, status: 'available' });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: number, status: Table['status']) => {
    setTables(tables.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleWaiterAssign = (id: number, waiterId: number | undefined) => {
    setTables(tables.map(t => t.id === id ? { ...t, waiterId } : t));
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Mesas</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Mesa
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Mesa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Número de Mesa</Label>
              <Input
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ej: 1, A1, VIP-1"
              />
            </div>
            <div>
              <Label>Capacidad</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Guardar</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Mesa {table.number}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm text-gray-600">{table.capacity} personas</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(table.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Estado</Label>
                <Select
                  value={table.status}
                  onValueChange={(value) => handleStatusChange(table.id, value as Table['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Ocupada</SelectItem>
                    <SelectItem value="reserved">Reservada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mesero Asignado</Label>
                <Select
                  value={table.waiterId?.toString() || 'none'}
                  onValueChange={(value) => handleWaiterAssign(table.id, value === 'none' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {waiters.filter(w => w.active).map((waiter) => (
                      <SelectItem key={waiter.id} value={waiter.id.toString()}>
                        {waiter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`px-3 py-1 rounded-full text-center ${getStatusColor(table.status)}`}>
                {getStatusLabel(table.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
