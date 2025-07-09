import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface TwoFactorInputProps {
  onSubmit: (token: string) => Promise<void>;
  onCancel: () => void;
}

export const TwoFactorInput: React.FC<TwoFactorInputProps> = ({ onSubmit, onCancel }) => {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Por favor ingresa un código');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(token);
    } catch (error) {
      toast.error('Código inválido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {showBackupCode ? 'Usar Código de Respaldo' : 'Verificación en Dos Pasos'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {showBackupCode 
              ? 'Ingresa tu código de respaldo:'
              : 'Ingresa el código de tu aplicación de autenticación:'}
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={showBackupCode ? 'Código de respaldo' : '000000'}
            maxLength={showBackupCode ? 10 : 6}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verificando...' : 'Verificar'}
          </button>

          <button
            type="button"
            onClick={() => setShowBackupCode(!showBackupCode)}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            disabled={isSubmitting}
          >
            {showBackupCode 
              ? 'Usar código de autenticación'
              : 'Usar código de respaldo'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-white text-gray-600 py-2 px-4 rounded border hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          {showBackupCode
            ? 'Los códigos de respaldo son códigos de un solo uso que puedes utilizar cuando no tienes acceso a tu aplicación de autenticación.'
            : 'Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.) y ingresa el código de 6 dígitos que se muestra.'}
        </p>
      </div>
    </div>
  );
}; 