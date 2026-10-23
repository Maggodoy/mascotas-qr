💻 PetID — Application Frontend (React + Vite)

Interfaz de usuario web del cliente desarrollada en **React** con **Vite** para el sistema de identificación y seguimiento dinámico de mascotas mediante códigos QR.

---

## 🛠️ Stack Tecnológico & Dependencias

- **Framework/Librería:** React 18
- **Empaquetador & Server:** Vite
- **Rutado:** React Router Dom (`react-router-dom`)
- **UI & Iconografía:** Lucide React (`lucide-react`)
- **Generación de QR:** `qrcode.react`
- **Cliente HTTP:** Axios / Fetch API
- **Estilos & Responsive:** Tailwind CSS / CSS Modules

---

## 📁 Estructura del Proyecto Frontend

```text
mascotas-qr-frontend/
├── public/                 # Archivos estáticos e íconos de la app
├── src/
│   ├── assets/             # Recursos multimedia y logotipos (PetID Isotipo)
│   ├── components/         # Componentes UI reutilizables (Navbar, Cards, Modales, QR Generator)
│   ├── context/            # Contextos de React (Autenticación, Estado Global)
│   ├── pages/              # Vistas principales de la aplicación
│   │   ├── Home.jsx        # Landing page promocional
│   │   ├── Login.jsx       # Inicio de sesión de tutores
│   │   ├── Register.jsx    # Registro de nuevos usuarios
│   │   ├── Dashboard.jsx   # Panel privado de gestión de mascotas
│   │   └── PublicScan.jsx  # Vista pública de emergencia / Lectura de QR
│   ├── services/           # Configuración de clientes API / HTTP
│   ├── App.jsx             # Enrutador principal y Layouts
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno (API URL)
├── package.json            # Dependencias y scripts de ejecución
└── vite.config.js          # Configuración del empaquetador Vite


🚀 Instalación y Ejecución LocalNavegar a la carpeta del frontend:

Bash
cd mascotas-qr-frontend

Instalar dependencias:
Bash
npm install

Iniciar el servidor de desarrollo:
Bash
npm run dev

Compilar para producción:
Bash
npm run build

🌐 Mapa de Rutas de la Aplicación

Ruta,Acceso,Descripción Funcional
/,Público,Landing page informativa sobre PetID y llamada a la acción.
/login,Público,Formulario de autenticación para tutores registrados.
/register,Público,Alta de nuevos usuarios en el sistema.
/dashboard,Privado (Auth),"Panel de administración: gestión de mascotas, toggle de alerta y descarga de QR."
/scan/:id,Público,"Vista de Emergencia: Ficha pública con datos médicos, botón de llamada y geolocalización vía WhatsApp."

📄 Documentación Relacionada: Para consultar la especificación funcional completa (historias de usuario y casos de uso CU-01 a CU-06), revisá el archivo /docs/CASOS_DE_USO.md en la raíz del repositorio.

