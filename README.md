# 🐾 PetID — Sistema de Identificación Dinámica y Gestión de Emergencias

> **Rol:** Product Owner / Functional Analyst & Full Stack Developer  
> **Estatus:** MVP Completado & Desplegado  
> **Demo en Vivo:** [mascotas-qr-iota.vercel.app](https://mascotas-qr-iota.vercel.app)

---

## 🎯 1. Declaración del Problema & Oportunidad (Problem Statement)

### **El Problema**
Las placas de identificación tradicionales para mascotas presentan limitaciones severas en situaciones de extravío:
1. **Riesgo de seguridad para quien rescata:** Para leer una placa metálica tradicional, la persona debe sujetar físicamente al animal y manipular el collar, lo cual genera un riesgo real de mordeduras o escape si el animal está asustado, estresado o reacciona de forma agresiva.
2. **Estaticidad e insuficiencia de datos:** La placa física cuenta con espacio reducido (por lo general solo el nombre y un número de teléfono). Si el dueño cambia de número o si la mascota requiere medicación crítica/dieta especial, la placa queda obsoleta o insuficiente.
3. **Exposición de privacidad:** Exponer un número telefónico de forma abierta en el collar de la mascota vulnera la privacidad del tutor ante miradas de terceros en la vía pública.

### **La Oportunidad & Propuesta de Valor**
**PetID** resuelve la fricción en el momento del hallazgo mediante **mecanismos de contacto sin contacto físico directo y datos dinámicos**:
* **Lectura a distancia y versatilidad:** El código QR se puede imprimir o adaptar no solo al collar, sino a pretales, ropa o arneses, facilitando la captura del código mediante la cámara del celular a una distancia segura.
* **Privacidad protegida:** La vista pública no expone la dirección exacta del tutor, enfocándose únicamente en canales de contacto directo inmediatos.
* **Información médica y estado en tiempo real:** El tutor actualiza la ficha (alergias, datos veterinarios, fotos recientes) de forma remota sin necesidad de reemplazar la placa física.
* **Gestión de emergencia en 1-Clic:** Quien encuentra a la mascota activa llamadas, mensajes con la **ubicación geográfica precisa vía WhatsApp**, o alertas automáticas por e-mail al dueño.

---

## 👤 2. Arquetipos de Usuario (User Personas)

| Arquetipo | Rol en el Sistema | Necesidad Principal |
| :--- | :--- | :--- |
| **Tutor / Dueño de Mascota** | Administrador | Mantener la información de sus mascotas (una o varias) actualizada en tiempo real, poder cambiar el estado a *"Perdida"* de forma inmediata y recibir alertas geolocalizadas. |
| **Rescatista / Transeúnte** | Usuario Público (Sin Registro) | Identificar rápido a la mascota encontrada, conocer su estado de salud/temperamento de forma segura y notificar al dueño en el menor tiempo posible sin instalar apps. |

---

## 🗺️ 3. Alcance del MVP vs. Visión de Producto (Product Scope)
┌─────────────────────────────────────────────────────────┐
│                    ALCANCE DEL MVP                      │
├─────────────────────────────────────────────────────────┤
│ • Autenticación segura y recuperación de contraseña.    │
│ • Dashboard multidispositivo para N mascotas por tutor.  │
│ • Generación y descarga directa de QR único y dinámico. │
│ • Toggle de Alerta "Mascota Perdida" en tiempo real.    │
│ • Integración con WhatsApp API (envío de geolocalización)│
│   y llamadas directas.                                  │
│ • Notificaciones por correo electrónico (SMTP).         │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│               ROADMAP / EVOLUTIVOS FUTUROS              │
├─────────────────────────────────────────────────────────┤
│ • Historial / Recordatorios de Vacunación y Desparasitado.│
│ • Exportación de Carnet de Vacunación en PDF.          │
│ • Múltiples contactos de emergencia por mascota.        │
│ • Impresión de chapitas/stickers directamente desde app.│
└─────────────────────────────────────────────────────────┘

---

## 📐 4. Análisis Funcional y Reglas de Negocio (Resumen)

### 📋 Reglas de Negocio (RN)
* **RN-01 (Privacidad de Datos):** La vista pública del QR no expone datos sensibles ni la dirección exacta del dueño, priorizando canales de contacto directo (teléfono/e-mail/WhatsApp).
* **RN-02 (Escaneo Dinámico):** El código QR almacena una URL estática con un token/ID único. La información mostrada se actualiza en tiempo real según los cambios realizados por el dueño en el panel de administración.
* **RN-03 (Notificación de Emergencia):** Toda alerta enviada mediante el formulario de contacto público despacha un correo electrónico instantáneo al dueño mediante Nodemailer.
* **RN-04 (Estado de Alerta):** Al marcar a la mascota como "Perdida", la interfaz pública muestra un distintivo de alerta destacado con prioridad de contacto.

> 📄 **Especificación Funcional Completa:** Para consultar los flujos detallados, caminos felices y excepciones de cada módulo, accede a la [Especificación Detallada de Casos de Uso](./docs/CASOS_DE_USO.md).

---

## 🧪 5. Estrategia de Calidad y Pruebas (QA Testing)

Como parte del ciclo de vida del desarrollo y aseguramiento de calidad (QA), se definieron las siguientes pruebas funcionales prioritarias:

* **TC-01 (Escaneo en Caso de Emergencia):** Validar que la lectura del QR desde dispositivos móviles (iOS/Android) abra la ficha pública en menos de 2 segundos sin solicitar autenticación.
* **TC-02 (Privacidad y Aislamiento):** Verificar que ningún endpoint público exponga tokens de sesión, e-mails de tutores o datos sensibles en las respuestas JSON.
* **TC-03 (Geolocalización vía WhatsApp):** Confirmar la correcta generación del enlace profundo (`whatsapp://send` / `https://wa.me`) incorporando las coordenadas geográficas reales capturadas por el navegador del smartphone.

---

## 🛠️ 6. Arquitectura y Stack Tecnológico

* **Frontend:** React + Vite + Lucide React (UI & UX)
* **Backend:** Node.js + Express
* **Base de Datos & Auth:** Supabase (PostgreSQL)
* **Servicio SMTP:** Nodemailer
* **Deploy:** Vercel (Frontend) / Render (Backend)