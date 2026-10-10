import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Petición a tu API custom Express en lugar de Supabase Auth
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.data.status === 'success') {
        setMessage(response.data.message || 'Si el correo existe, se enviaron las instrucciones.');
      } else {
        setError(response.data.message || 'Ocurrió un error al procesar la solicitud.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo conectar con el servidor. Intentá de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 border border-secondary/20">
        
        {/* Header con Logo oficial petID */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/logo-petID-mist.png" 
              alt="petID Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">Recuperar Contraseña</h1>
          <p className="text-xs text-gray-500 mt-1">
            Ingresá tu correo registrado y te enviaremos las instrucciones de acceso.
          </p>
        </div>

        {message && (
          <div className="bg-warm-bg/60 text-primary p-3.5 rounded-xl text-xs font-medium mb-6 flex items-center gap-2 border border-secondary/30">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-accent" />
            <span>{message}</span>
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
            <div className="relative">
              <Mail className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-primary/20 mt-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-secondary/10 pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;