# 🐾 Mascotas QR - Sistema de Identificación y Rastreo Dinámico

Aplicación web full-stack diseñada para la localización rápida y segura de mascotas perdidas mediante chapitas inteligentes con código QR dinámico.

---

## 🎯 Objetivo y Propuesta de Valor

Permitir a los dueños mantener actualizada la información de contacto y salud de sus mascotas en tiempo real sin necesidad de cambiar la chapita física. Brinda a cualquier persona que encuentre una mascota la posibilidad de contactar al dueño inmediatamente de forma ágil, directa y segura.

---

## 📐 Análisis Funcional y Módulos

### 🛠️ Módulo de Administración (Dueño)
* **CU-01 - Autenticación y Seguridad:** Registro de usuario, inicio de sesión seguro y flujo de recuperación de contraseña vía correo electrónico.
* **CU-02 - Ficha Médica y de Contacto:** Registro, edición y eliminación de datos clave (nombre, especie, raza, foto, teléfono de contacto, indicaciones veterinarias, dieta y cuidados especiales).
* **CU-03 - Panel de Alerta:** Toggle rápido para activar/desactivar el estado de **"Mascota Perdida"**, lo que destaca visualmente la ficha pública de emergencia.
* **CU-04 - Emisión de QR:** Generación automática del código QR único vinculado dinámicamente a la ficha de la mascota.

### 📱 Módulo Público (Escáner)
* **CU-05 - Acceso Libre:** Lectura directa del código QR desde cualquier smartphone sin requerir registro ni descarga de aplicaciones.
* **CU-06 - Ficha de Emergencia:** Despliegue inmediato de foto, datos prioritarios e indicaciones médicas de urgencia.
* **CU-07 - Contacto Inmediato y Ubicación:**
  * **Llamada Telefónica:** Botón de marcado rápido al número telefónico registrado por el dueño.
  * **WhatsApp Directo:** Envío de mensaje automático preconfigurado con la opción de compartir la ubicación actual del hallazgo.
  * **Notificación por Email:** Envío de alerta de contacto al correo del dueño mediante servicio SMTP.

---

## 📋 Reglas de Negocio (RN)

* **RN-01 (Privacidad de Datos):** La vista pública del QR no expone datos sensibles ni la dirección exacta del dueño, priorizando canales de contacto directo (teléfono/e-mail/WhatsApp).
* **RN-02 (Escaneo Dinámico):** El código QR almacena una URL estática con un token único. La información mostrada se actualiza en tiempo real según los cambios realizados por el dueño en el panel de administración.
* **RN-03 (Notificación de Emergencia):** Toda alerta enviada mediante el formulario de contacto público despacha un correo electrónico instantáneo al dueño mediante Nodemailer.
* **RN-04 (Estado de Alerta):** Al marcar a la mascota como "Perdida", la interfaz pública muestra un distintivo de alerta destacado con prioridad de contacto.

---

## 🗺️ Diagrama de Casos de Uso

```text
+-----------------------------------------------------------------------+
|                         SISTEMA MASCOTAS QR                           |
+-----------------------------------------------------------------------+
|                                                                       |
|   [ Dueño / Administrador ]                                           |
|        ├── CU-01: Autenticación (Registro, Login, Recuperar Clave)    |
|        ├── CU-02: Registrar / Editar Perfil de Mascota                |
|        ├── CU-03: Cambiar Estado (Localizado / Perdido)               |
|        ├── CU-04: Generar y Descargar Código QR                       |
|        └── CU-05: Recibir Alerta por Email o Mensaje Directo          |
|                                                                       |
|   [ Escaneador / Usuario Público ]                                   |
|        ├── CU-06: Escanear Chapita QR (Sin Autenticación)             |
|        ├── CU-07: Visualizar Ficha Pública de Emergencia              |
|        └── CU-08: Contactar Dueño (Llamada, WhatsApp con Ubicación   |
|                    o Formulario por Email)                            |
|                                                                       |
+-----------------------------------------------------------------------+

🛠️ Arquitectura y Stack Tecnológico
 Frontend: React + Vite + Lucide React (UI & Iconos)

 Backend: Node.js + Express

 Base de Datos & Auth: Supabase (PostgreSQL)

 Servicio SMTP: Nodemailer (Gmail App Password)

 Despliegue: Vercel (Frontend) / Render (Backend)

🚀 Estructura del Proyecto
mascotas-qr/
├── mascotas-qr-frontend/   # Aplicación cliente en React (Vite)
├── src/ / server.js        # API RESTful en Node.js / Express
└── README.md               # Documentación principal del sistema

> 📄 **Documentación completa:** Puedes consultar la [Especificación Detallada de Casos de Uso (Camino Feliz y Excepciones)](./docs/CASOS_DE_USO.md).