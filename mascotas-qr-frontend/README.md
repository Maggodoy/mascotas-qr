# 💻 Mascotas QR - Frontend Application

Interfaz de usuario web desarrollada en **React** con **Vite** para el sistema de identificación y seguimiento de mascotas mediante códigos QR dinámicos.

---

## 🛠️ Stack Tecnológico & Dependencias

* **Framework/Librería:** React 18
* **Empaquetador & Server:** Vite
* **Rutado:** React Router Dom (`react-router-dom`)
* **Íconos & UI:** Lucide React (`lucide-react`)
* **Generación de QR:** `qrcode.react` / `qrcode`
* **Peticiones HTTP:** Axios / Fetch API

---

## 📁 Estructura del Proyecto Frontend

```text
mascotas-qr-frontend/
├── public/                 # Archivos estáticos e íconos de la app
├── src/
│   ├── assets/             # Imágenes y recursos multimedia
│   ├── components/         # Componentes UI reutilizables (Navbar, Cards, Modales)
│   ├── context/            # Contextos de React (Autenticación, Estado Global)
│   ├── pages/              # Vistas/Páginas de la aplicación
│   │   ├── Home.jsx        # Landing page principal
│   │   ├── Login.jsx       # Inicio de sesión
│   │   ├── Register.jsx    # Registro de usuario
│   │   ├── Dashboard.jsx   # Panel privado de gestión de mascotas
│   │   └── PublicScan.jsx  # Vista pública de lectura del código QR
│   ├── services/           # Configuración de clientes API / HTTP
│   ├── App.jsx             # Enrutador principal y layout
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno
├── package.json            # Dependencias y scripts de ejecucion
└── vite.config.js          # Configuración de Vite

🚀 Instalación y Ejecución Local

Navegar a la carpeta del frontend:
cd mascotas-qr-frontend

Instalar dependencias:
npm install

Iniciar el servidor de desarrollo:
npm run dev

Compilar para producción (Build de prueba):
npm run build

🌐 Rutas Principales de la Aplicación
/ - Página de bienvenida / Landing page.

/login - Formulario de inicio de sesión de dueños.

/register - Registro de nuevos usuarios.

/dashboard - Panel privado (lista de mascotas, edición, cambiar estado a "Perdido", descarga de QR).

/scan/:id (o /mascota/:id) - Vista pública accesible al escanear la chapita QR.


---
