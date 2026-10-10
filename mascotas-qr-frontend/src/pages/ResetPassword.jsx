import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Petición directa a tu API Express en lugar de Supabase Auth
      const response = await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword: password.trim(),
      });

      if (response.data.status === 'success') {
        setMessage('¡Tu contraseña se ha actualizado correctamente!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Ocurrió un error al actualizar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 border border-secondary/20">
        
        {/* Header con Logo petID */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/logo-petID-mist.png" 
              alt="petID Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">Nueva Contraseña</h1>
          <p className="text-xs text-gray-500 mt-1">
            Ingresá tu correo y tu nueva clave para actualizar tu cuenta
          </p>
        </div>

        {message && (
          <div className="bg-warm-bg/60 text-primary p-3.5 rounded-xl text-xs font-medium mb-6 flex items-center gap-2 border border-secondary/30">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-accent" />
            <span>{message} Redirigiendo al login...</span>
          </div>
        )}

        {error && (
          <div className="bg-alert/10 text-alert p-3.5 rounded-xl text-xs font-medium mb-6 flex items-center gap-2 border border-alert/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-alert" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-primary/20 mt-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}