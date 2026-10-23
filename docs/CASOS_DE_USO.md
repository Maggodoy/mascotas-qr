# 📋 Especificación Detallada de Casos de Uso
**Proyecto:** PetID 
**Versión:** 1.0  
**Fecha:** 2026  

---

## 🛠️ Módulo de Administración (Dueño)

### **CU-01: Autenticación de Usuario (Registro, Login y Recuperación)**
* **Actor Principal:** Dueño de Mascota.
* **Precondiciones:** Ninguna para registro; cuenta previa para login/recuperación.
* **Postcondiciones:** Sesión activa con token de autenticación (JWT) o clave restablecida.
* **Flujo Principal (Camino Feliz):**
  1. El usuario ingresa a la interfaz de autenticación (`/login`).
  2. Completa las credenciales solicitadas (correo electrónico y contraseña).
  3. Confirma el formulario.
  4. El sistema valida el formato de datos y autentica las credenciales contra la base de datos (Supabase).
  5. El sistema otorga la sesión y redirige al panel privado `/dashboard`.
* **Flujos Alternativos y Excepciones:**
  * **A1: Credenciales inválidas:**
    * 4a. El sistema detecta que el correo no existe o la contraseña es incorrecta.
    * 4b. Se despliega un mensaje de error visual (*"Credenciales inválidas"*).
    * 4c. El usuario permanece en la pantalla de inicio de sesión.
  * **A2: Recuperación de contraseña:**
    * 2a. El usuario selecciona la opción *"¿Olvidaste tu contraseña?"*.
    * 2b. Ingresa su correo registrado y el sistema envía un e-mail con token único mediante Nodemailer.
    * 2c. El usuario accede al enlace recibido y define una nueva contraseña.

---

### **CU-02: Gestión de Ficha de Mascota (Alta, Edición y Baja)**
* **Actor Principal:** Dueño de Mascota (Autenticado).
* **Precondiciones:** Tener sesión activa en la plataforma.
* **Postcondiciones:** La base de datos actualiza el registro de la mascota.
* **Flujo Principal (Camino Feliz):**
  1. El usuario selecciona la opción de registrar o editar una mascota en el Dashboard.
  2. Completa o modifica los datos requeridos (nombre, especie, raza, foto, contacto secundario, indicación veterinaria y dieta).
  3. Presiona *"Guardar Cambios"*.
  4. El sistema valida los campos obligatorios y persiste la información en Supabase.
  5. Se muestra una confirmación en pantalla y se actualiza la lista del Dashboard.
* **Flujos Alternativos y Excepciones:**
  * **A1: Campos obligatorios incompletos:**
    * 4a. El sistema detecta la falta de datos requeridos (ej. nombre o teléfono).
    * 4b. Bloquea el envío y resalta en rojo los campos pendientes.
  * **A2: Fallo de carga de imagen:**
    * 4a. El archivo subido excede el límite de tamaño o no es un formato de imagen permitido.
    * 4b. El sistema emite una alerta y permite al usuario reintentar con otra imagen.

---

### **CU-03: Activación de Alerta "Mascota Perdida"**
* **Actor Principal:** Dueño de Mascota.
* **Precondiciones:** La mascota debe estar registrada en el perfil del usuario.
* **Postcondiciones:** El estado de la mascota cambia en la base de datos a `is_lost = true`.
* **Flujo Principal (Camino Feliz):**
  1. El dueño acciona el interruptor (toggle) de *"Mascota Perdida"* en la tarjeta de la mascota.
  2. El sistema envía la petición al servidor backend.
  3. El estado se actualiza en tiempo real en la base de datos.
  4. La ficha pública de esa mascota pasa a mostrar la bandera roja de alerta de emergencia.
* **Flujos Alternativos y Excepciones:**
  * **A1: Error de conexión:**
    * 2a. Ocurre una interrupción de red al intentar cambiar el estado.
    * 2b. El sistema revierte el toggle visualmente y muestra una notificación: *"No se pudo actualizar el estado. Reintente más tarde"*.

---

### **CU-04: Emisión y Descarga del Código QR**
* **Actor Principal:** Dueño de Mascota.
* **Precondiciones:** Mascota registrada con un ID único.
* **Postcondiciones:** Se genera una imagen vectorial/rasterizada con la URL del escáner público.
* **Flujo Principal (Camino Feliz):**
  1. El usuario presiona *"Ver QR"* o *"Descargar QR"*.
  2. La aplicación utiliza el componente `qrcode.react` para codificar la URL estática (ej: `https://dominio.com/scan/:id`).
  3. Se muestra el código en pantalla con opción de descarga en formato PNG para imprimir.

---

## 📱 Módulo Público (Escáner)

### **CU-05: Lectura e Identificación Pública**
* **Actor Principal:** Escaneador / Tercero (Usuario no registrado).
* **Precondiciones:** Escanear el código QR impreso mediante un smartphone.
* **Postcondiciones:** Se despliega la vista `/scan/:id` con la ficha de la mascota.
* **Flujo Principal (Camino Feliz):**
  1. El usuario escanea el código QR con la cámara de su dispositivo.
  2. El navegador abre la URL pública del sistema.
  3. El frontend solicita los datos al backend enviando el ID único.
  4. El sistema responde con la ficha pública conteniendo foto, cuidados médicos e instrucciones inmediatas.
* **Flujos Alternativos y Excepciones:**
  * **A1: ID de QR inexistente o eliminado:**
    * 3a. El ID suministrado en la URL no coincide con ningún registro activo.
    * 3b. El sistema muestra una vista de error 404: *"Mascota no encontrada o código inactivo"*.

---

### **CU-06: Contacto Inmediato y Envío de Ubicación**
* **Actor Principal:** Escaneador / Tercero.
* **Precondiciones:** Ficha pública cargada con éxito.
* **Postcondiciones:** Comunicación entablada vía llamada, WhatsApp o e-mail enviado al dueño.
* **Flujo Principal (Camino Feliz - WhatsApp con Ubicación):**
  1. El escaneador presiona el botón *"Contactar por WhatsApp"*.
  2. El sistema solicita permiso del navegador para acceder a la geolocalización.
  3. El escaneador acepta la solicitud de ubicación.
  4. El sistema construye el enlace a WhatsApp con un mensaje preconfigurado que incluye las coordenadas / enlace de mapa.
  5. Se abre la aplicación de WhatsApp lista para enviar el mensaje al dueño.
* **Flujos Alternativos y Excepciones:**
  * **A1: Geolocalización denegada:**
    * 3a. El escaneador rechaza la solicitud de permisos de ubicación.
    * 3b. El sistema genera la plantilla de mensaje en WhatsApp omitiendo la ubicación y permitiendo enviar la alerta de hallazgo de todas formas.
  * **A2: Envío de alerta por E-mail (Servicio SMTP caído):**
    * 1a. El escaneador opta por enviar un mensaje a través del formulario de correo electrónico.
    * 2a. Ocurre una falla en el servidor SMTP de Nodemailer.
    * 3a. El sistema captura la excepción y notifica: *"No se pudo enviar el correo. Por favor contacta directamente por teléfono o WhatsApp"*.