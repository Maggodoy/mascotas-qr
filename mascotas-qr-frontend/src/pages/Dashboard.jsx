import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Eye, Copy, Check, Sparkles, AlertTriangle, Bell, BellOff, Calendar, Download } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [copiedId, setCopiedId] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Función auxiliar para calcular la edad en base a la fecha de nacimiento
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age === 0) {
      // Si tiene menos de 1 año, calculamos los meses
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      return months <= 1 ? 'Menos de 1 mes' : `${months} meses`;
    }
    
    return age === 1 ? '1 año' : `${age} años`;
  };

  // Cargar mascotas reales desde el backend
  const fetchPets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/pets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedPets = response.data?.data || response.data || [];
      setPets(fetchedPets);
    } catch (err) {
      console.error('Error al cargar mascotas en el dashboard:', err);
      setError('No se pudieron cargar las mascotas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleCopyLink = (qrCode, id) => {
    const url = `${window.location.origin}/scan/${qrCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Función para activar o desactivar la alerta de pérdida directo desde el Dashboard
  const handleToggleLostStatus = async (petId, currentStatus) => {
    try {
      setActionLoadingId(petId);
      const token = localStorage.getItem('token');
      const newStatus = !currentStatus;

      await api.patch(
        `/pets/${petId}/status`, 
        { is_lost: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado localmente para reflejar el cambio al instante
      setPets((prevPets) =>
        prevPets.map((pet) =>
          pet.id === petId ? { ...pet, is_lost: newStatus } : pet
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado de alerta:', err);
      alert('No se pudo actualizar el estado de la alerta.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
        <p className="text-primary font-medium text-sm">Cargando tus mascotas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist text-gray-800 pb-16">
      
      {/* Barra Superior / Header */}
      <header className="bg-white border-b border-secondary/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/logo-petID-mist.png" 
                alt="petID Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight">Panel de Mascotas</h1>
              <p className="text-xs text-gray-500">Gestión de placas y QR identificadores</p>
            </div>
          </div>

          <Link
            to="/pets/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Mascota</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Banner de bienvenida */}
        <div className="bg-primary rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-warm-bg mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Protección 24/7 para tus compañeros</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Tus placas QR activas</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Mantené actualizados tus datos de contacto y teléfonos de emergencia para que cualquiera que escanee el collar de tu mascota pueda contactarte al instante.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-alert/10 text-alert p-4 rounded-2xl text-sm mb-6 border border-alert/20 font-medium">
            {error}
          </div>
        )}

        {/* Listado de Mascotas */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-secondary/40 max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-warm-bg text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-secondary/20">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">Aún no registraste ninguna mascota</h3>
            <p className="text-sm text-gray-600 mb-6">
              Agregá tu primera mascota para generar su código QR único y vincular su placa identificadora.
            </p>
            <Link
              to="/pets/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Mascota Ahora</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => {
              const BACKEND_URL = 'http://localhost:3000';
              const photoPath = pet.photo_url 
                ? (pet.photo_url.startsWith('http') 
                    ? pet.photo_url 
                    : `${BACKEND_URL}${pet.photo_url.startsWith('/') ? '' : '/'}${pet.photo_url}`) 
                : '/placeholder-pet.png';

              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                `${window.location.origin}/scan/${pet.qr_code}`
              )}`;

              // URL en alta resolución (500x500) ideal para impresión y chapitas
              const qrPrintUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                `${window.location.origin}/scan/${pet.qr_code}`
              )}`;

              const petAge = calculateAge(pet.birth_date);

              return (
                <div
                  key={pet.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col group shadow-sm hover:shadow-md ${
                    pet.is_lost ? 'border-alert/80 ring-2 ring-alert/30' : 'border-secondary/20'
                  }`}
                >
                  {/* Imagen y Estado */}
                  <div className="relative h-48 w-full bg-warm-bg/30 overflow-hidden">
                    <img
                      src={photoPath}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-3 right-3 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm ${
                      pet.is_lost 
                        ? 'bg-alert text-white border-alert animate-pulse' 
                        : 'bg-warm-bg/95 text-primary border-secondary/30'
                    }`}>
                      {pet.is_lost ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>¡ALERTA: PERDIDA!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                          <span>Mascota Protegida</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info de la mascota */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-primary">{pet.name}</h3>
                          {petAge && (
                            <span className="bg-warm-bg text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-secondary/20">
                              {petAge}
                            </span>
                          )}
                        </div>
                        {pet.medical_info && (
                          <p className="text-xs font-medium text-gray-500 line-clamp-2 mt-1">
                            {pet.medical_info}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botón rápido de Alerta de Pérdida */}
                    <div className="mt-2">
                      <button
                        onClick={() => handleToggleLostStatus(pet.id, pet.is_lost)}
                        disabled={actionLoadingId === pet.id}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                          pet.is_lost
                            ? 'bg-alert hover:bg-alert/90 text-white animate-bounce'
                            : 'bg-warm-bg text-primary hover:bg-alert/10 hover:text-alert border border-secondary/30'
                        }`}
                      >
                        {pet.is_lost ? (
                          <>
                            <BellOff className="w-4 h-4" />
                            <span>Desactivar Alerta de Pérdida</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 text-alert" />
                            <span>¡Avisar que está Perdida!</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Previsualización del QR */}
                    <div className="mt-4 p-3 bg-warm-bg/30 rounded-2xl border border-secondary/20 flex items-center gap-4">
                      <img
                        src={qrImageUrl}
                        alt={`QR de ${pet.name}`}
                        className="w-16 h-16 rounded-xl border border-white shadow-sm bg-white p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-0.5">
                          Código de Placa
                        </span>
                        <p className="text-xs font-mono text-primary truncate font-semibold">
                          {pet.qr_code}
                        </p>
                        <button
                          onClick={() => handleCopyLink(pet.qr_code, pet.id)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-primary transition-colors cursor-pointer"
                        >
                          {copiedId === pet.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-accent" />
                              <span className="text-accent font-semibold">¡Enlace copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar link del QR</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Acciones de la Tarjeta (Incluye Descargar QR y Ver Vista QR) */}
                    <div className="mt-6 pt-4 border-t border-secondary/20 grid grid-cols-3 gap-2">
                      <Link
                        to={`/pets/edit/${pet.id}`}
                        className="inline-flex justify-center items-center gap-1 py-2 px-2 bg-warm-bg/50 hover:bg-warm-bg text-primary text-[11px] font-semibold rounded-xl transition-colors border border-secondary/20 text-center"
                      >
                        Editar
                      </Link>
                      
                      <a
                        href={qrPrintUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={`QR-${pet.name}.png`}
                        className="inline-flex justify-center items-center gap-1 py-2 px-2 bg-warm-bg/80 hover:bg-warm-bg text-primary text-[11px] font-semibold rounded-xl transition-colors border border-secondary/30 text-center"
                        title="Descargar QR en alta resolución para chapita"
                      >
                        <Download className="w-3 h-3 text-accent" />
                        <span>Descargar QR</span>
                      </a>

                      <a
                        href={`/scan/${pet.qr_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex justify-center items-center gap-1 py-2 px-2 bg-primary hover:bg-accent text-white text-[11px] font-semibold rounded-xl transition-colors shadow-sm text-center"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver QR</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}