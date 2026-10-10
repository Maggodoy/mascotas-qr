import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Eye, Copy, Check, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [copiedId, setCopiedId] = useState(null);

  // Datos mock para maquetado visual
  const [pets] = useState([
    {
      id: '1',
      name: 'Milo',
      species: 'Perro',
      breed: 'Golden Retriever',
      age: '3 años',
      photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
      qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MiloQR123',
      public_slug: 'milo-qr123',
      status: 'Mascota Protegida',
    },
    {
      id: '2',
      name: 'Luna',
      species: 'Gato',
      breed: 'Siamés',
      age: '1 año',
      photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LunaQR456',
      public_slug: 'luna-qr456',
      status: 'Mascota Protegida',
    },
  ]);

  const handleCopyLink = (slug, id) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

        {/* Listado de Mascotas */}
        {pets.length === 0 ? (
          /* Estado Vacío / Sin Mascotas */
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
          /* Grilla de Tarjetas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-3xl border border-secondary/20 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Imagen y Estado */}
                <div className="relative h-48 w-full bg-warm-bg/30 overflow-hidden">
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-warm-bg/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary border border-secondary/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    <span>{pet.status}</span>
                  </div>
                </div>

                {/* Info de la mascota */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{pet.name}</h3>
                      <p className="text-xs font-medium text-gray-500">
                        {pet.species} • {pet.breed}
                      </p>
                    </div>
                    <span className="text-xs bg-warm-bg text-primary px-2.5 py-1 rounded-lg font-medium border border-secondary/20">
                      {pet.age}
                    </span>
                  </div>

                  {/* Previsualización del QR */}
                  <div className="mt-4 p-3 bg-warm-bg/30 rounded-2xl border border-secondary/20 flex items-center gap-4">
                    <img
                      src={pet.qr_code}
                      alt={`QR de ${pet.name}`}
                      className="w-16 h-16 rounded-xl border border-white shadow-sm bg-white p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-0.5">
                        Código de Placa
                      </span>
                      <p className="text-xs font-mono text-primary truncate font-semibold">
                        {pet.public_slug}
                      </p>
                      <button
                        onClick={() => handleCopyLink(pet.public_slug, pet.id)}
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

                  {/* Acciones de la Tarjeta */}
                  <div className="mt-6 pt-4 border-t border-secondary/20 grid grid-cols-2 gap-2">
                    <Link
                      to={`/pets/edit/${pet.id}`}
                      className="inline-flex justify-center items-center gap-1.5 py-2.5 px-3 bg-warm-bg/50 hover:bg-warm-bg text-primary text-xs font-semibold rounded-xl transition-colors border border-secondary/20"
                    >
                      Editar Perfil
                    </Link>
                    <a
                      href={`/p/${pet.public_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex justify-center items-center gap-1.5 py-2.5 px-3 bg-primary hover:bg-accent text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Vista QR</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}