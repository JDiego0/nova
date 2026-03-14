<div align="center">

<img src="frontend/assets/img/logo_oscuro_SF.png" alt="NOVA Logo" width="120" />

# NOVA — Sistema de Gestión de Novedades

**Plataforma web para gestionar ausencias, permisos e incapacidades en empresas**

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?style=flat-square&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

</div>

---

## Tabla de contenidos

1. [Descripción](#-descripción)
2. [Funcionalidades](#-funcionalidades)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Requisitos previos](#-requisitos-previos)
5. [Instalación](#-instalación)
6. [Configuración del entorno](#-configuración-del-entorno)
7. [Base de datos](#-base-de-datos)
8. [Ejecución](#-ejecución)
9. [Roles y permisos](#-roles-y-permisos)
10. [Carga masiva de usuarios](#-carga-masiva-de-usuarios)
11. [Servicios externos](#-servicios-externos)
12. [Despliegue en Render](#-despliegue-en-render)
13. [Credenciales iniciales](#-credenciales-iniciales)
14. [Estructura del proyecto](#-estructura-del-proyecto)
15. [Solución de problemas](#-solución-de-problemas)

---

## 📋 Descripción

NOVA es una aplicación web **full-stack** que reemplaza procesos informales de gestión de ausencias (mensajes de WhatsApp, correos sin registro) por un sistema centralizado, trazable y con inteligencia artificial incorporada.

Permite a los **coders** registrar solicitudes de ausencia con documentos adjuntos, y a los **administradores** revisarlas, aprobarlas o rechazarlas con apoyo de análisis de IA, mientras el sistema notifica automáticamente a todos los involucrados por email.

---

## ✨ Funcionalidades

### Panel del Coder
- Registrar solicitudes: incapacidad médica, calamidad doméstica, permiso, constancia de entrenamiento, solicitud de egresado
- Adjuntar documento de soporte (imagen o PDF, máx. 10 MB)
- Ver historial de solicitudes con estado en tiempo real
- Recibir notificaciones por email en cada cambio de estado

### Panel del Administrador
- Listado de todas las novedades con filtros por estado y búsqueda full-text
- Ver detalle completo de cada solicitud incluyendo el adjunto
- **Análisis IA** bajo demanda por novedad:
  - Recomendación: `aprobar` / `revisar` / `rechazar`
  - Nivel de confianza del 1 al 10
  - Detección de solicitudes retroactivas
  - Historial previo del coder
  - Observación sugerida con botón de copia directa
- Prioridad asignada automáticamente por IA al crear la novedad (`Alta` / `Media` / `Baja`)
- Gestión completa de usuarios: crear, editar, activar, desactivar
- Importación masiva de coders vía CSV con vista previa y validación
- Administración de catálogos: clanes y cohortes
- Historial de auditoría de todas las acciones del sistema

### General
- Autenticación con JWT — tokens seguros y sin estado
- Recuperación de contraseña por email con enlace de expiración de 1 hora
- Soporte completo de **Light Mode / Dark Mode** persistente por usuario
- Responsive — accesible desde cualquier dispositivo con navegador

---

## 🛠 Stack tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Runtime | Node.js 18.x | Entorno de ejecución del servidor |
| Framework | Express.js 4.19 | API REST y servidor de archivos estáticos |
| Autenticación | JSON Web Tokens | Sesiones stateless firmadas con HS256 |
| Hashing | bcryptjs | Hash seguro de contraseñas (cost factor 12) |
| Base de datos principal | MySQL 5.7+ | Datos relacionales transaccionales |
| Base de datos secundaria | MongoDB Atlas | Historial de auditoría (opcional) |
| ORM/ODM | mysql2 + mongoose | Drivers para MySQL y MongoDB |
| Almacenamiento de archivos | Cloudinary | Avatares y adjuntos de novedades |
| Email transaccional | Resend | Notificaciones y recuperación de contraseña |
| Inteligencia Artificial | Groq SDK (LLaMA 3.3 70B) | Prioridad automática y análisis de novedades |
| Archivos multipart | multer | Subida de imágenes, PDFs y CSV |
| Frontend | HTML5 / CSS3 / JS vanilla | Sin framework, SPA manual |
| Iconos | Bootstrap Icons 1.11.3 | Librería de iconos vía CDN |
| Despliegue | Render | PaaS para Node.js en la nube |

---

## 📦 Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Node.js | 18.x o superior | https://nodejs.org |
| npm | 9.x o superior | Incluido con Node.js |
| MySQL | 5.7 o superior | https://dev.mysql.com/downloads/ |
| MongoDB | Atlas (en la nube) | https://www.mongodb.com/atlas |

> **MySQL** es obligatorio. **MongoDB** es opcional — si no se configura, el módulo de auditoría queda deshabilitado pero el sistema funciona con normalidad.

---

## 🚀 Instalación

### 1. Clonar o descomprimir el proyecto

```bash
unzip nova.zip
cd nova
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Crear el archivo de configuración

```bash
cp .env.example .env
```

Luego edita `.env` con tus valores reales (ver sección siguiente).

---

## ⚙️ Configuración del entorno

Crea el archivo `backend/.env`. Los campos marcados con `*` son **obligatorios**.

```env
# ── Servidor ─────────────────────────────────────────
PORT=3000                               # *

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=cambia_esto_por_un_hash_largo  # * (openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# ── MySQL ─────────────────────────────────────────────
DB_HOST=localhost                       # *
DB_PORT=3306
DB_USER=root                            # *
DB_PASSWORD=tu_password_mysql           # *
DB_NAME=nova                            # *

# ── MongoDB Atlas (opcional — auditoría) ──────────────
# Formato: mongodb+srv://usuario:password@cluster.mongodb.net/nova
MONGO_URI=

# ── Cloudinary (opcional — archivos adjuntos) ─────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Resend (opcional — envío de emails) ───────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
SMTP_FROM=NOVA <onboarding@resend.dev>

# ── Groq IA (opcional — análisis automático) ──────────
# Sin esta key la prioridad por defecto es "Media"
GROQ_API_KEY=gsk_...

# ── URL del frontend ──────────────────────────────────
# Usada en los enlaces de recuperación de contraseña
FRONTEND_URL=http://localhost:3000
```

---

## 🗄 Base de datos

### Crear el esquema desde cero

```bash
mysql -u root -p < nova_schema.sql
```

Este comando:
- Elimina la base de datos `nova` si ya existe
- Crea todas las tablas con sus relaciones y restricciones
- Inserta los datos iniciales (roles, estados, tipos de documento, prioridades, etc.)
- Crea el usuario administrador inicial

### Verificar la instalación

```sql
USE nova;
SHOW TABLES;
SELECT id, correo, role_id, estado_id FROM usuarios;
```

Deberías ver las tablas: `tipos_documento`, `roles`, `estados`, `horarios`, `prioridades`, `clan`, `cohorte`, `usuarios`, `novedades`.

### Migración — columna faltante

Si tienes una base de datos existente sin la columna `reset_token_expires`:

```sql
USE nova;
ALTER TABLE usuarios
  ADD COLUMN reset_token_expires DATETIME DEFAULT NULL AFTER reset_token;
```

---

## ▶️ Ejecución

### Modo desarrollo (con recarga automática)

```bash
cd backend
npm run dev
```

### Modo producción

```bash
cd backend
npm start
```

Abre el navegador en `http://localhost:3000`. El servidor sirve automáticamente los archivos del frontend desde la carpeta `frontend/`.

---

## 👥 Roles y permisos

| Funcionalidad | Administrador | Coder |
|---------------|:---:|:---:|
| Ver todas las novedades | ✅ | ❌ |
| Aprobar / rechazar novedades | ✅ | ❌ |
| Análisis IA de novedades | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Ver auditoría | ✅ | ❌ |
| Configuración (clanes / cohortes) | ✅ | ❌ |
| Carga masiva CSV | ✅ | ❌ |
| Registrar novedad propia | ✅ | ✅ |
| Ver historial propio | ✅ | ✅ |

---

## 📤 Carga masiva de usuarios

El sistema acepta archivos CSV con **detección automática de columnas por nombre** (el orden no importa).

### Columnas obligatorias

```
nombre, apellido, documento, correo, password
```

### Columnas opcionales

```
tipo_documento, telefono, role, estado, clan, cohorte, horario, observaciones
```

### Ejemplo de archivo

```csv
nombre,apellido,documento,correo,password,telefono,clan,cohorte,horario
Laura,Martinez,1020304050,laura@correo.com,MiPassword123,3101234567,Tesla,3,Mañana
Carlos,Perez,1030405060,carlos@correo.com,MiPassword123,3209876543,Turing,3,Tarde
```

### Notas

- Los clanes y cohortes deben existir previamente en el sistema
- Correos y documentos duplicados se omiten sin generar error
- Los usuarios importados quedan en estado **Inactivo** por defecto
- Las contraseñas se hashean automáticamente con bcrypt al importar
- Vista previa de hasta 10 filas antes de confirmar la importación

---

## 🔗 Servicios externos

### Resend — Email transaccional

> Recomendado para producción. No requiere configuración de puertos SMTP.

1. Crear cuenta gratuita en [resend.com](https://resend.com)
2. Ir a **API Keys** → **Create API Key**
3. Agregar `RESEND_API_KEY` en las variables de entorno
4. Configurar `SMTP_FROM` como `NOVA <onboarding@resend.dev>`

> Para usar tu propio dominio como remitente, debes verificarlo en el panel de Resend.

### MongoDB Atlas — Auditoría en la nube

1. Crear cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear un cluster **M0 Free**
3. Crear un usuario en **Database Access** con permisos de lectura/escritura
4. En **Network Access** agregar `0.0.0.0/0` (necesario para Render)
5. Copiar la cadena de conexión desde **Connect → Drivers → Node.js**
6. Reemplazar `<password>` y agregar `/nova` antes del `?`:

```
mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/nova?retryWrites=true&w=majority
```

### Cloudinary — Archivos adjuntos

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Copiar **Cloud Name**, **API Key** y **API Secret** desde el dashboard
3. Agregar los tres valores en las variables de entorno

### Groq — Inteligencia Artificial

1. Crear cuenta en [console.groq.com](https://console.groq.com)
2. Generar una **API Key**
3. Agregar como `GROQ_API_KEY` en las variables de entorno

> Modelo utilizado: `llama-3.3-70b-versatile` — gratuito en el tier básico con 14.400 peticiones/día.

---

## ☁️ Despliegue en Render

1. Conectar el repositorio de GitHub en [render.com](https://render.com)
2. Crear un nuevo **Web Service** con la siguiente configuración:

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

3. En la sección **Environment**, agregar todas las variables del `.env`
4. Render redespliega automáticamente en cada push al repositorio

> **Nota:** El plan gratuito de Render apaga el servidor tras 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos en despertar el servicio.

---

## 🔑 Credenciales iniciales

Después de ejecutar `nova_schema.sql`:

| Campo | Valor |
|-------|-------|
| Correo | `admin@nova.com` |
| Contraseña | `123456` |
| Rol | Administrador |

> ⚠️ **Cambiar la contraseña inmediatamente** después del primer inicio de sesión.

Para regenerar el hash de una nueva contraseña:

```bash
cd backend
node -e "const b=require('bcryptjs'); b.hash('TuNuevaPassword', 12, (e,h) => console.log(h));"
```

Luego actualizar en MySQL:

```sql
UPDATE usuarios SET password='<hash_generado>' WHERE correo='admin@nova.com';
```

---

## 📁 Estructura del proyecto

```
nova/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js        Configuración de Cloudinary
│   │   ├── mailer.js            Configuración de Resend + templates de email
│   │   ├── mongo.js             Conexión a MongoDB Atlas
│   │   └── mysql.js             Pool de conexiones MySQL
│   ├── controllers/
│   │   ├── auth.controller.js   Login, registro, recuperación de contraseña
│   │   ├── catalogs.controller.js  CRUD de clanes y cohortes
│   │   ├── novedades.controller.js CRUD novedades + análisis IA
│   │   └── users.controller.js  CRUD usuarios + importación CSV
│   ├── middleware/
│   │   └── auth.js              Verificación de JWT y roles
│   ├── models/
│   │   └── AuditLog.js          Modelo MongoDB para auditoría
│   ├── routes/
│   │   ├── audit.routes.js
│   │   ├── auth.routes.js
│   │   ├── catalogs.routes.js
│   │   ├── novedades.routes.js
│   │   └── users.routes.js
│   ├── package.json
│   └── server.js                Punto de entrada de la aplicación
├── frontend/
│   ├── assets/img/              Logos e imágenes
│   ├── css/
│   │   └── global.css           Estilos globales con soporte Light/Dark
│   ├── js/
│   │   ├── config.js            URL base de la API
│   │   └── utils.js             Helpers compartidos (auth, http, toasts, tema)
│   └── pages/
│       ├── audit.html           Panel de auditoría (solo admin)
│       ├── config.html          Configuración: clanes, cohortes, CSV
│       ├── login.html           Login, registro y recuperación de contraseña
│       ├── novedades.html       Panel principal de novedades (solo admin)
│       ├── reset-password.html  Restablecimiento de contraseña
│       ├── user.html            Vista del coder
│       └── users.html           Gestión de usuarios (solo admin)
├── nova_schema.sql              Esquema completo de la base de datos
├── usuarios_prueba.csv          CSV de ejemplo para carga masiva
└── render.yaml                  Configuración de despliegue en Render
```

---

## 🔧 Solución de problemas

<details>
<summary><strong>Error: ER_ACCESS_DENIED_ERROR</strong></summary>

Las credenciales de MySQL en el `.env` son incorrectas. Verificar `DB_USER` y `DB_PASSWORD`.

</details>

<details>
<summary><strong>El login falla con datos correctos</strong></summary>

El hash en la base de datos no corresponde a bcryptjs. Regenerar el hash desde el servidor del proyecto y actualizarlo directamente en MySQL.

</details>

<details>
<summary><strong>Los emails no se envían</strong></summary>

- Verificar que `RESEND_API_KEY` esté configurado correctamente
- Asegurarse de que `SMTP_FROM` use `onboarding@resend.dev` o un dominio verificado en Resend
- Revisar los logs del servidor para ver el error exacto

</details>

<details>
<summary><strong>El análisis de IA retorna prioridad Media siempre</strong></summary>

Verificar que `GROQ_API_KEY` esté configurado en las variables de entorno. Sin esta key el sistema asigna prioridad Media por defecto.

</details>

<details>
<summary><strong>Las imágenes o adjuntos no se suben</strong></summary>

Verificar que las tres variables de Cloudinary estén configuradas: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.

</details>

<details>
<summary><strong>El módulo de auditoría no registra acciones</strong></summary>

Verificar que `MONGO_URI` apunte a un cluster de MongoDB Atlas activo y que la IP `0.0.0.0/0` esté permitida en Network Access.

</details>

<details>
<summary><strong>El enlace de recuperación de contraseña no funciona en producción</strong></summary>

La variable `FRONTEND_URL` debe apuntar a la URL pública del proyecto en Render, no a `localhost`:

```env
FRONTEND_URL=https://nova-backend-c3ui.onrender.com
```

</details>

<details>
<summary><strong>Cold start lento al abrir la aplicación</strong></summary>

El plan gratuito de Render apaga el servidor tras 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos. Es el comportamiento esperado en el plan gratuito.

</details>

---

<div align="center">

Hecho con 💜 — NOVA v1.0.0

</div>
