import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'initial' | 'verify' | 'complete'>('initial');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupTwoFactor = async () => {
    try {
      const response = await api.post('/auth/2fa/setup');
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setStep('verify');
    } catch (error) {
      toast.error('Error al configurar 2FA');
    }
  };

  const verifyAndEnable = async () => {
    try {
      const response = await api.post('/auth/2fa/enable', { token });
      setBackupCodes(response.data.backupCodes);
      setStep('complete');
      toast.success('2FA activado correctamente');
      onComplete?.();
    } catch (error) {
      toast.error('Código inválido');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {step === 'initial' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Configurar Autenticación de Dos Factores</h2>
          <p className="mb-4">
            La autenticación de dos factores añade una capa extra de seguridad a tu cuenta.
            Necesitarás una aplicación como Google Authenticator o Authy.
          </p>
          <button
            onClick={setupTwoFactor}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Comenzar Configuración
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Escanea el Código QR</h2>
          <div className="mb-4">
            <img src={qrCode} alt="QR Code" className="mx-auto" />
          </div>
          <p className="mb-4">
            Si no puedes escanear el código QR, ingresa este código manualmente en tu aplicación:
            <code className="block bg-gray-100 p-2 mt-2 rounded">{secret}</code>
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Ingresa el código de verificación:
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="000000"
            />
          </div>
          <button
            onClick={verifyAndEnable}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Verificar y Activar
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">¡2FA Activado!</h2>
          <p className="mb-4">
            Guarda estos códigos de respaldo en un lugar seguro. Los necesitarás si pierdes
            acceso a tu aplicación de autenticación.
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            {backupCodes.map((code, index) => (
              <code key={index} className="block mb-1">
                {code}
              </code>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 mb-2"
          >
            Imprimir Códigos
          </button>
          <button
            onClick={onComplete}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
}; 