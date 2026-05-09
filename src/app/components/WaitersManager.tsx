import { useState } from 'react';
import { Waiter, Table } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { UserPlus, User, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Switch } from './ui/switch';

type WaitersManagerProps = {
  waiters: Waiter[];
  setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
};

export function WaitersManager({ waiters, setWaiters, tables, setTables }: WaitersManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const handleAdd = () => {
    if (!formData.name) return;
    const newWaiter: Waiter = {
      id: Date.now(),
      name: formData.name,
      active: true,
    };
    setWaiters([...waiters, newWaiter]);
    setFormData({ name: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    setTables(tables.map(t => t.waiterId === id ? { ...t, waiterId: undefined } : t));
    setWaiters(waiters.filter(w => w.id !== id));
  };

  const handleToggleActive = (id: number) => {
    setWaiters(waiters.map(w => {
      if (w.id === id) {
        if (w.active) {
          setTables(tables.map(t => t.waiterId === id ? { ...t, waiterId: undefined } : t));
        }
        return { ...w, active: !w.active };
      }
      return w;
    }));
  };

  const getAssignedTables = (waiterId: number) => {
    return tables.filter(t => t.waiterId === waiterId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Meseros</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Mesero
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Mesero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
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
        {waiters.map((waiter) => {
          const assignedTables = getAssignedTables(waiter.id);
          return (
            <Card key={waiter.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <CardTitle>{waiter.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(waiter.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Activo</Label>
                  <Switch
                    checked={waiter.active}
                    onCheckedChange={() => handleToggleActive(waiter.id)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Estado</Label>
                  {waiter.active ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Mesas Asignadas</Label>
                  {assignedTables.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin mesas asignadas</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assignedTables.map((table) => (
                        <Badge key={table.id} variant="outline">
                          Mesa {table.number}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total mesas:</span>
                    <span>{assignedTables.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
