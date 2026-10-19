import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Phone, MessageCircle, AlertTriangle, Heart, ShieldCheck, Calendar, MapPin } from 'lucide-react';

export default function PublicScan() {
  const { qrCode } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null); // Estado para guardar la ubicación

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/scan/${qrCode}`);
        setPet(response.data.data);
      } catch (err) {
        console.error('Error al cargar mascota por QR:', err);
        setError('No se pudo encontrar la información de la mascota o el código QR no es válido.');
      } finally {
        setLoading(false);
      }
    };

    if (qrCode) {
      fetchPet();
    }
  }, [qrCode]);

  // Obtener la geolocalización del escannear al cargar la vista
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            mapUrl: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
          });
        },
        (err) => {
          console.warn('El usuario denegó la geolocalización o no está disponible:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Función para calcular la edad exacta en años o meses
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years < 1) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    return `${years} ${years === 1 ? 'año' : 'años'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-primary font-medium">Buscando información de la mascota...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-secondary/20">
          <AlertTriangle className="w-16 h-16 text-alert mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-primary mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error || 'El código QR no es válido.'}</p>
        </div>
      </div>
    );
  }

  // Construcción robusta de la ruta de la foto apuntando al backend en producción o local
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mascotas-qr-backend.onrender.com';
  const photoPath = pet.photo_url 
    ? (pet.photo_url.startsWith('http') 
        ? pet.photo_url 
        : `${BACKEND_URL}${pet.photo_url.startsWith('/') ? '' : '/'}${pet.photo_url}`) 
    : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';

  const cleanPhone = pet.owner_phone ? pet.owner_phone.replace(/[^0-9]/g, '') : '';
  
  // Construimos el mensaje de WhatsApp incluyendo la ubicación si el navegador la otorgó
  let baseMessage = `¡Hola! Encontré a tu mascota ${pet.name}.`;
  if (location) {
    baseMessage += ` La escaneé en esta ubicación: ${location.mapUrl}`;
  }
  baseMessage += ` Por favor decime cómo podemos coordinar para reencontrarlos.`;
  
  const whatsappMessage = encodeURIComponent(baseMessage);
  const petAge = calculateAge(pet.birth_date);

  return (
    <div className={`min-h-screen py-8 px-4 flex justify-center items-center transition-colors ${pet.is_lost ? 'bg-alert/10' : 'bg-mist'}`}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-secondary/20">
        
        {/* Banner de Emergencia / Mascota Perdida */}
        {pet.is_lost && (
          <div className="bg-alert text-white font-bold text-center py-3.5 px-4 flex items-center justify-center gap-2 animate-pulse uppercase tracking-wider text-sm shadow-md">
            <AlertTriangle className="w-5 h-5" />
            <span>¡ESTA MASCOTA ESTÁ PERDIDA!</span>
          </div>
        )}

        {/* Header con foto de perfil */}
        <div className="relative bg-warm-bg/50 h-72">
          <img
            src={photoPath}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border ${
                pet.is_lost 
                  ? 'bg-alert text-white border-alert' 
                  : 'bg-warm-bg text-primary border-secondary/30'
              }`}>
                {pet.is_lost ? 'Mascota Perdida' : 'Mascota Protegida'}
              </span>

              {/* Badge de Edad */}
              {petAge && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-mist" />
                  {petAge}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-extrabold drop-shadow-md">{pet.name}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Aviso sutil si se detectó la ubicación */}
          {location && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-xs text-green-800">
              <MapPin className="w-4 h-4 text-green-600 shrink-0" />
              <span>Ubicación detectada con éxito. Se adjuntará al mensaje de WhatsApp.</span>
            </div>
          )}

          {/* Ficha Médica / Observaciones */}
          {pet.medical_info && (
            <div className="bg-warm-bg/40 border border-secondary/30 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-1.5">
                <Heart className="w-4 h-4 text-accent" />
                Información Médica / Recomendaciones
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{pet.medical_info}</p>
            </div>
          )}

          {/* Botones de Acción / Contacto */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary text-center">
              Contactar al Propietario
            </h3>

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer ${
                  pet.is_lost
                    ? 'bg-alert hover:bg-alert/90 text-white shadow-alert/20'
                    : 'bg-primary hover:bg-accent text-white shadow-primary/20'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                Enviar WhatsApp con mi ubicación
              </a>
            )}

            {pet.owner_phone && (
              <a
                href={`tel:${pet.owner_phone}`}
                className="w-full bg-warm-bg hover:bg-warm-bg/80 text-primary font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors border border-secondary/30 cursor-pointer shadow-sm"
              >
                <Phone className="w-5 h-5 text-accent" />
                Llamar Directamente
              </a>
            )}
          </div>

          {/* Footer de Marca */}
          <div className="pt-4 border-t border-secondary/20 flex items-center justify-center gap-2 text-xs text-secondary font-medium">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Identificación oficial por petID</span>
          </div>

        </div>
      </div>
    </div>
  );
}