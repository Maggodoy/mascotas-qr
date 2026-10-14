import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Shield, Lock, Mail, User, AlertCircle, Phone } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        await api.post('/auth/register', formData);
        response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      } else {
        response = await api.post('/auth/login', { email: formData.email, password: formData.password });
      }

      console.log('Respuesta completa del Backend en Login:', response.data);

      // Busca el token en cualquier posible nivel del JSON retornado
      const token = 
        response.data?.token || 
        response.data?.data?.token || 
        response.data?.accessToken;

      if (!token) {
        throw new Error('El servidor no devolvió un token. Revisa la consola F12.');
      }

      localStorage.setItem('token', token);
      console.log('Token guardado correctamente en localStorage:', token);

      navigate('/dashboard');
    } catch (err) {
      console.error('Error en autenticación:', err);
      setError(err.response?.data?.message || err.message || 'Ocurrió un error. Verificá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 border border-secondary/20">
        <div className="text-center mb-8">
          <div className="bg-warm-bg text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-secondary/20">
            <img 
              src="/logo-petID-verde.png" 
              alt="petID Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {isRegistering ? 'Crear una cuenta' : 'Panel de Propietario'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isRegistering ? 'Registrate para proteger a tus mascotas' : 'Gestioná los códigos QR de tus mascotas'}
          </p>
        </div>

        {error && (
          <div className="bg-alert/10 text-alert p-3 rounded-xl text-sm mb-6 flex items-center gap-2 border border-alert/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-primary/80 mb-1 uppercase tracking-wider">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/30 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary/80 mb-1 uppercase tracking-wider">
                  Teléfono de contacto
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/30 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
                    placeholder="+543411234567"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-primary/80 mb-1 uppercase tracking-wider">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-secondary absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/30 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary/80 mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-secondary absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/30 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-gray-800"
                placeholder="••••••••"
              />
            </div>
            {!isRegistering && (
              <div className="text-right mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent hover:text-primary font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-secondary/20 pt-4">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-sm font-semibold text-accent hover:text-primary hover:underline transition-colors cursor-pointer"
          >
            {isRegistering ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}