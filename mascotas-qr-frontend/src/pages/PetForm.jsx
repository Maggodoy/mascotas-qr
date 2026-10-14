import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, QrCode, Heart, FileText, AlertCircle, 
  RefreshCw, LogOut, Upload, Calendar, Trash2, AlertTriangle, CheckCircle 
} from 'lucide-react';

export default function PetForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    qr_code: '',
    medical_info: '',
    is_lost: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  };

  useEffect(() => {
    if (isEditing) {
      const fetchPetData = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/pets/${id}`, getAuthHeaders());
          const pet = response.data?.data || response.data;

          if (!pet) {
            throw new Error('No se encontraron datos para esta mascota.');
          }

          const formattedDate = pet.birth_date ? pet.birth_date.split('T')[0] : '';

          setFormData({
            name: pet.name || '',
            birth_date: formattedDate,
            qr_code: pet.qr_code || '',
            medical_info: pet.medical_info || '',
            is_lost: Boolean(pet.is_lost),
          });

          if (pet.photo_url) {
            setPreviewUrl(pet.photo_url);
          }
        } catch (err) {
          console.error('Error al obtener datos:', err);
          setError(err.response?.data?.message || 'No se pudieron cargar los datos de la mascota.');
        } finally {
          setFetching(false);
        }
      };

      fetchPetData();
    }
  }, [id, isEditing]);

  const generateRandomQR = () => {
    const randomCode = 'PET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, qr_code: randomCode }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleResetSession = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleToggleLostStatus = async () => {
    if (!isEditing) return;
    try {
      setLoading(true);
      const newStatus = !formData.is_lost;
      await api.patch(`/pets/${id}/status`, { is_lost: newStatus }, getAuthHeaders());
      setFormData((prev) => ({ ...prev, is_lost: newStatus }));
    } catch (err) {
      console.error('Error al cambiar alerta:', err);
      setError(err.response?.data?.message || 'No se pudo actualizar la alerta.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const nameText = formData.name ? `a "${formData.name}"` : 'esta mascota';
    if (!window.confirm(`¿Estás seguro de que querés eliminar ${nameText}?`)) return;

    try {
      setLoading(true);
      await api.delete(`/pets/${id}`, getAuthHeaders());
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
      setError(err.response?.data?.message || 'Error al eliminar la mascota.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor volvé a iniciar sesión.');
      setLoading(false);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name.trim());
    
    const finalQr = formData.qr_code.trim() || 'PET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    dataToSend.append('qr_code', finalQr);

    if (formData.birth_date) {
      dataToSend.append('birth_date', formData.birth_date);
    }

    if (formData.medical_info) {
      dataToSend.append('medical_info', formData.medical_info.trim());
    }

    dataToSend.append('is_lost', String(formData.is_lost));

    if (selectedFile) {
      // Únicamente enviamos 'photo', respetando lo configurado en upload.single('photo')
      dataToSend.append('photo', selectedFile);
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (isEditing) {
        await api.put(`/pets/${id}`, dataToSend, config);
      } else {
        await api.post('/pets', dataToSend, config);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al guardar mascota:', err.response || err);
      
      const serverMsg = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.response?.data?.details || 
        'Error al procesar la solicitud.';

      const statusInfo = err.response?.status ? `[Status ${err.response.status}]: ` : '';
      setError(`${statusInfo}${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
        <p className="text-primary font-medium text-sm">Cargando datos de la mascota...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist text-gray-800 pb-12">
      <nav className="bg-white border-b border-secondary/20 py-3.5 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo-petID-mist.png" 
                alt="petID Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-primary text-base">petID</span>
          </div>
          <button
            type="button"
            onClick={handleResetSession}
            title="Reiniciar sesión"
            className="text-xs text-alert hover:bg-alert/10 font-semibold flex items-center gap-1 bg-alert/5 px-2.5 py-1.5 rounded-lg border border-alert/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Re-iniciar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-xl mx-auto p-4 md:p-6 mt-6">
        <div className="bg-white rounded-3xl shadow-lg border border-secondary/20 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-1">
                {isEditing ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
              </h1>
              <p className="text-xs text-gray-500">
                {isEditing 
                  ? 'Modificá la información de tu mascota y guardá los cambios.'
                  : 'Ingresá los datos de tu mascota para vincularla a un código QR.'}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleToggleLostStatus}
                disabled={loading}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  formData.is_lost
                    ? 'bg-alert text-white shadow-md shadow-alert/20 animate-pulse'
                    : 'bg-warm-bg text-primary border border-secondary/30 hover:bg-alert/10 hover:text-alert'
                }`}
              >
                {formData.is_lost ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Mascota Perdida
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Activar Alerta
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-alert/10 text-alert p-3.5 rounded-xl text-xs font-medium mb-6 flex items-center gap-2 border border-alert/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-alert" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
                Nombre de la mascota
              </label>
              <div className="relative">
                <Heart className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                  placeholder="Ej. Yuki, Itoi, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
                Fecha de Nacimiento (Opcional)
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
                Foto de la mascota (Galería / Cámara)
              </label>
              <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-secondary/40 rounded-2xl p-4 bg-warm-bg/20 hover:bg-warm-bg/40 transition-colors cursor-pointer relative">
                {previewUrl ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-xl shadow-sm mb-2 border border-secondary/20"
                    />
                    <span className="text-xs text-secondary font-medium">Toca abajo para cambiar foto</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <Upload className="w-8 h-8 text-accent mb-2" />
                    <span className="text-xs font-semibold text-primary">Seleccionar desde tu galería</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG o WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                  Código del QR
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={generateRandomQR}
                    className="text-xs text-accent hover:text-primary font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Generar automáticamente
                  </button>
                )}
              </div>
              <div className="relative">
                <QrCode className="w-5 h-5 text-secondary/60 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="qr_code"
                  value={formData.qr_code}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono text-sm text-primary font-semibold"
                  placeholder="PET-XXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
                Información médica / Recomendaciones (Opcional)
              </label>
              <div className="relative">
                <FileText className="w-5 h-5 text-secondary/60 absolute left-3 top-3" />
                <textarea
                  name="medical_info"
                  rows="3"
                  value={formData.medical_info}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-warm-bg/20 border border-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-800"
                  placeholder="Dieta especial, alergias, medicación o señas particulares..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-primary/20 mt-4 disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Mascota' : 'Guardar Mascota')}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-alert/10 hover:bg-alert/20 text-alert font-semibold py-3 rounded-xl transition-colors border border-alert/20 mt-2 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-alert" />
                Eliminar Mascota
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}