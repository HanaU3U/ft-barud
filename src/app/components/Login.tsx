import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserRole } from '../App';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type LoginProps = {
  onLogin: (role: UserRole, userId?: number) => void;
};

type Credential = {
  username: string;
  password: string;
  role: UserRole;
  userId?: number;
  name: string;
};

const CREDENTIALS: Credential[] = [
  // Meseros
  { username: 'juan', password: 'mesero123', role: 'waiter', userId: 1, name: 'Juan Pérez' },
  { username: 'maria', password: 'mesero123', role: 'waiter', userId: 2, name: 'María García' },
  { username: 'carlos', password: 'mesero123', role: 'waiter', userId: 3, name: 'Carlos López' },

  // Proveedor
  { username: 'proveedor', password: 'proveedor123', role: 'supplier', name: 'Proveedor' },

  // Administrador
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
];

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const credential = CREDENTIALS.find(
      c => c.username.toLowerCase() === username.toLowerCase() && c.password === password
    );

    if (credential) {
      toast.success(`Bienvenido, ${credential.name}`);
      onLogin(credential.role, credential.userId);
    } else {
      toast.error('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="size-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Sistema de Gestión - Bar</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              {showCredentials ? 'Ocultar' : 'Ver'} Credenciales de Prueba
            </Button>

            {showCredentials && (
              <div className="mt-4 space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-2">Meseros:</p>
                  <p className="text-blue-800">Usuario: <span className="font-mono">juan</span> / Contraseña: <span className="font-mono">mesero123</span></p>
                  <p className="text-blue-800">Usuario: <span className="font-mono">maria</span> / Contraseña: <span className="font-mono">mesero123</span></p>
                  <p className="text-blue-800">Usuario: <span className="font-mono">carlos</span> / Contraseña: <span className="font-mono">mesero123</span></p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">Proveedor:</p>
                  <p className="text-green-800">Usuario: <span className="font-mono">proveedor</span> / Contraseña: <span className="font-mono">proveedor123</span></p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-purple-900 mb-2">Administrador:</p>
                  <p className="text-purple-800">Usuario: <span className="font-mono">admin</span> / Contraseña: <span className="font-mono">admin123</span></p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
