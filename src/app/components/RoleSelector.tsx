import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { UserRole, Waiter } from '../App';
import { UserCircle, Package, ShieldCheck } from 'lucide-react';

type RoleSelectorProps = {
  onSelectRole: (role: UserRole) => void;
  waiters: Waiter[];
  onSelectWaiter: (waiterId: number) => void;
};

export function RoleSelector({ onSelectRole, waiters, onSelectWaiter }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>('');

  const handleContinue = () => {
    if (selectedRole === 'waiter' && selectedWaiterId) {
      onSelectWaiter(parseInt(selectedWaiterId));
      onSelectRole('waiter');
    } else if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  const roles = [
    {
      id: 'waiter',
      name: 'Mesero',
      description: 'Gestiona tus mesas y genera recibos',
      icon: UserCircle,
      color: 'bg-blue-500',
    },
    {
      id: 'supplier',
      name: 'Proveedor',
      description: 'Administra productos del inventario',
      icon: Package,
      color: 'bg-green-500',
    },
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      icon: ShieldCheck,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="size-full flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sistema de Gestión - Bar</CardTitle>
          <CardDescription>Selecciona tu rol para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRole(role.id as UserRole)}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedRole === 'waiter' && (
            <div className="space-y-2">
              <Label>Selecciona tu usuario</Label>
              <Select value={selectedWaiterId} onValueChange={setSelectedWaiterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mesero" />
                </SelectTrigger>
                <SelectContent>
                  {waiters.filter(w => w.active).map((waiter) => (
                    <SelectItem key={waiter.id} value={waiter.id.toString()}>
                      {waiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || (selectedRole === 'waiter' && !selectedWaiterId)}
              size="lg"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
