import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { TwoFactorSetup } from '../../components/TwoFactorSetup';
import { TwoFactorInput } from '../../components/TwoFactorInput';
import { toast } from 'react-hot-toast';

export const AdminProfile = () => {
  const { user, disable2FA } = useAuthStore();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const handleDisable2FA = async (token: string) => {
    try {
      await disable2FA(token);
      setShowDisable(false);
      toast.success('2FA desactivado correctamente');
    } catch (error) {
      toast.error('Error al desactivar 2FA');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Perfil de Usuario</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Información Personal</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <p className="mt-1 text-lg">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Seguridad</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Autenticación de Dos Factores</h3>
          <p className="text-gray-600 mb-4">
            {user?.twoFactorEnabled
              ? 'La autenticación de dos factores está activada en tu cuenta.'
              : 'Activa la autenticación de dos factores para mayor seguridad.'}
          </p>

          {!showSetup && !showDisable && (
            <button
              onClick={() => user?.twoFactorEnabled ? setShowDisable(true) : setShowSetup(true)}
              className={`px-4 py-2 rounded ${
                user?.twoFactorEnabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {user?.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
            </button>
          )}

          {showSetup && (
            <div className="mt-4">
              <TwoFactorSetup
                onComplete={() => {
                  setShowSetup(false);
                  toast.success('2FA configurado correctamente');
                }}
              />
            </div>
          )}

          {showDisable && (
            <div className="mt-4">
              <TwoFactorInput
                onSubmit={handleDisable2FA}
                onCancel={() => setShowDisable(false)}
              />
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Cambiar Contraseña</h3>
          <p className="text-gray-600 mb-4">
            Es recomendable cambiar tu contraseña regularmente.
          </p>
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            onClick={() => toast.error('Funcionalidad en desarrollo')}
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}; 