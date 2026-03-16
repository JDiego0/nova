<div align="center">

<img src="frontend/assets/img/logo_oscuro_SF.png" alt="NOVA Logo" width="120" />

# NOVA — Sistema de Gestión de Novedades

**Plataforma web para gestionar ausencias, permisos e incapacidades del personal**

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?style=flat-square&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Render-Starter-46E3B7?style=flat-square&logo=render&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail-SMTP-EA4335?style=flat-square&logo=gmail&logoColor=white)

</div>

---

## Tabla de contenidos

1. [Descripción](#-descripción)
2. [Funcionalidades](#-funcionalidades)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Requisitos previos](#-requisitos-previos)
5. [Instalación](#-instalación)
6. [Variables de entorno](#️-variables-de-entorno)
7. [Base de datos](#️-base-de-datos)
8. [Ejecución](#️-ejecución)
9. [Dependencias](#-dependencias)
10. [Roles y permisos](#-roles-y-permisos)
11. [Carga masiva de usuarios](#-carga-masiva-de-usuarios)
12. [Servicios externos](#-servicios-externos)
13. [Despliegue en Render](#️-despliegue-en-render)
14. [Credenciales iniciales](#-credenciales-iniciales)
15. [Estructura del proyecto](#-estructura-del-proyecto)
16. [Solución de problemas](#-solución-de-problemas)

---

## 📋 Descripción

NOVA es una aplicación web **full-stack** que reemplaza procesos informales de gestión de ausencias por un sistema centralizado, trazable y con inteligencia artificial incorporada.

Permite a los **usuarios** registrar solicitudes de ausencia con documentos adjuntos, y a los **administradores** revisarlas con apoyo de IA, mientras el sistema notifica automáticamente a todos los involucrados por email a cualquier correo del mundo.

> **Nota sobre el despliegue:** NOVA requiere el plan **Starter ($7/mes)** de Render para que el envío de emails via SMTP funcione correctamente. El plan gratuito bloquea los puertos SMTP (587 y 465).

---

## ✨ Funcionalidades

### Panel del Usuario
- Registrar solicitudes: incapacidad médica, calamidad doméstica, permiso, constancia de entrenamiento, solicitud de egresado
- Adjuntar documento de soporte (imagen o PDF, máx. 10 MB) con drag-and-drop
- Ver historial de solicitudes con estado actualizado
- Recibir notificaciones por email en cada cambio de estado
- Recuperación de contraseña con enlace seguro por email

### Panel del Administrador
- Dashboard con estadísticas en tiempo real (total, pendientes, aprobadas, rechazadas)
- Listado con filtros por estado y búsqueda full-text
- Ver detalle completo de cada solicitud incluyendo adjunto
- **Análisis IA** bajo demanda: recomendación APROBAR/RECHAZAR/REVISAR, confianza 1-10, retroactividad, historial del usuario, observación sugerida
- Prioridad asignada automáticamente por IA al crear la novedad (Alta / Media / Baja)
- Gestión completa de usuarios: crear, editar, activar, desactivar, eliminar
- Importación masiva vía CSV con vista previa y validación
- Administración de catálogos: clanes y cohortes
- Historial de auditoría de todas las acciones

### General
- JWT stateless con expiración configurable
- Recuperación de contraseña por email con token seguro de 1 hora
- Light Mode / Dark Mode persistente por usuario
- Responsive — accesible desde cualquier dispositivo

---

## 🛠 Stack tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Runtime | Node.js 18.x | Entorno de ejecución del servidor |
| Framework | Express.js 4.19 | API REST + archivos estáticos del frontend |
| Autenticación | JSON Web Tokens | Sesiones stateless firmadas con HS256 |
| Hashing | bcryptjs | Hash seguro de contraseñas (cost factor 12) |
| BD principal | MySQL 5.7+ | Datos relacionales transaccionales |
| BD auditoría | MongoDB Atlas | Historial de acciones (opcional) |
| Email | Nodemailer + SMTP Gmail | Notificaciones a cualquier correo del mundo |
| Archivos | Cloudinary | Avatares y adjuntos de novedades |
| IA | Groq SDK — LLaMA 3.3 70B | Prioridad automática y análisis de novedades |
| Frontend | HTML5 / CSS3 / JS vanilla | Sin framework, SPA manual |
| Iconos | Bootstrap Icons 1.11.3 | Vía CDN |
| Despliegue | Render Starter | PaaS con SMTP habilitado y auto-deploy |

---

## 📦 Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Node.js | 18.x o superior | https://nodejs.org |
| npm | 9.x o superior | Incluido con Node.js |
| MySQL | 5.7 o superior | https://dev.mysql.com/downloads/ |
| MongoDB | Atlas en la nube | https://www.mongodb.com/atlas |

---

## 🚀 Instalación

```bash
# 1. Descomprimir el proyecto
unzip nova.zip && cd nova

# 2. Instalar dependencias
cd backend && npm install

# 3. Crear archivo de configuración
cp .env.example .env
```

---

## ⚙️ Variables de entorno

Edita `backend/.env` con tus valores. Los campos marcados con `*` son **obligatorios**.

```env
# ── Servidor ──────────────────────────────────────
PORT=3000                              # *

# ── JWT ───────────────────────────────────────────
JWT_SECRET=cambia_esto_aleatorio_largo # * (openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# ── MySQL ─────────────────────────────────────────
DB_HOST=localhost                      # *
DB_PORT=3306
DB_USER=root                           # *
DB_PASSWORD=tu_password_mysql          # *
DB_NAME=nova                           # *

# ── MongoDB Atlas (opcional — auditoría) ──────────
MONGO_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/nova

# ── Cloudinary (opcional — archivos adjuntos) ─────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Gmail SMTP (opcional — envío de emails) ───────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucorreo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx          # Contraseña de aplicación Google (16 chars)
SMTP_FROM=NOVA <tucorreo@gmail.com>

# ── Groq IA (opcional — análisis automático) ──────
GROQ_API_KEY=gsk_...

# ── URL del frontend ──────────────────────────────
FRONTEND_URL=https://tu-servicio.onrender.com
```

---

## 🗄️ Base de datos

```bash
# Crear esquema desde cero
mysql -u root -p < nova_schema.sql
```

Crea todas las tablas, relaciones y datos iniciales (roles, estados, prioridades, tipos de documento, etc.).

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Datos del personal con rol, estado, clan, cohorte y avatar |
| `novedades` | Solicitudes de ausencia con adjunto, prioridad IA y estado |
| `roles` | Administrador, Coder |
| `estados` | Activo, Inactivo, Egresado, Abandono, Retirado |
| `prioridades` | Alta, Media, Baja — asignada por IA al crear |
| `clan` | Grupos de usuarios |
| `cohorte` | Generaciones numeradas |

---

## ▶️ Ejecución

```bash
# Desarrollo (con recarga automática)
cd backend && npm run dev

# Producción
cd backend && npm start
```

Abre `http://localhost:3000` — el servidor sirve automáticamente el frontend.

---

## 📚 Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `express` | ^4.19.2 | Framework HTTP principal |
| `mysql2` | ^3.11.3 | Driver MySQL con Promises |
| `bcryptjs` | ^2.4.3 | Hash de contraseñas pure JS |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación JWT |
| `dotenv` | ^16.4.5 | Variables de entorno desde .env |
| `cors` | ^2.8.5 | Control de orígenes cruzados |
| `mongoose` | ^8.4.3 | ODM para MongoDB (auditoría) |
| `nodemailer` | ^6.9.14 | Envío de emails vía SMTP Gmail |
| `multer` | ^1.4.5-lts.1 | Archivos multipart en memoria |
| `cloudinary` | ^1.41.0 | CDN de imágenes y archivos |
| `streamifier` | ^0.1.1 | Buffer a stream para Cloudinary |
| `groq-sdk` | ^0.5.0 | Cliente Groq para IA LLaMA |
| `express-validator` | ^7.2.0 | Validación de inputs |
| `nodemon` (dev) | ^3.1.4 | Recarga automática en desarrollo |

---

## 👥 Roles y permisos

| Funcionalidad | Administrador | Usuario |
|---------------|:---:|:---:|
| Ver todas las novedades | ✅ | ❌ |
| Aprobar / rechazar | ✅ | ❌ |
| Análisis IA | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Ver auditoría | ✅ | ❌ |
| Configuración catálogos | ✅ | ❌ |
| Carga masiva CSV | ✅ | ❌ |
| Registrar novedad propia | ✅ | ✅ |
| Ver historial propio | ✅ | ✅ |

---

## 📤 Carga masiva de usuarios

El sistema detecta columnas por nombre — el orden no importa.

**Columnas obligatorias:** `nombre, apellido, documento, correo, password`

**Columnas opcionales:** `tipo_documento, telefono, role, estado, clan, cohorte, horario, observaciones`

```csv
nombre,apellido,documento,correo,password,telefono,clan,cohorte
Laura,Martinez,1020304050,laura@correo.com,Pass123,3101234567,Tesla,3
Carlos,Perez,1030405060,carlos@correo.com,Pass123,3209876543,Turing,3
```

> Los usuarios importados quedan en estado **Inactivo** por defecto. Las contraseñas se hashean automáticamente.

---

## 🔗 Servicios externos

### Gmail — Envío de emails (Nodemailer + SMTP)

> Permite enviar a **cualquier correo del mundo** sin restricciones.

1. Activar **Verificación en 2 pasos** en tu cuenta de Google
2. Ir a **Seguridad → Contraseñas de aplicación**
3. Crear contraseña para "Correo" — se generan 16 caracteres
4. Usar esos 16 caracteres **sin espacios** como `SMTP_PASS`
5. Configurar `SMTP_FROM` como `NOVA <tucorreo@gmail.com>`

### MongoDB Atlas — Auditoría en la nube

1. Crear cluster **M0 Free** en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear usuario con permisos de lectura/escritura
3. En **Network Access** agregar `0.0.0.0/0`
4. Copiar URI y agregarla como `MONGO_URI`

### Cloudinary — Archivos adjuntos

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Copiar Cloud Name, API Key y API Secret del dashboard

### Groq — Inteligencia Artificial

1. Crear cuenta en [console.groq.com](https://console.groq.com)
2. Generar API Key y agregarla como `GROQ_API_KEY`
3. Modelo: `llama-3.3-70b-versatile` — 14.400 peticiones/día gratis

---

## ☁️ Despliegue en Render

> ⚠️ Requiere el **plan Starter ($7/mes)** para desbloquear los puertos SMTP.

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | **Starter** — requerido para SMTP |

1. Conectar repositorio de GitHub en [render.com](https://render.com)
2. Configurar los campos anteriores
3. Agregar todas las variables de entorno en **Environment**
4. Render redespliega automáticamente en cada push
5. Los redespliegues no tienen costo adicional — precio fijo mensual

---

## 🔑 Credenciales iniciales

| Campo | Valor |
|-------|-------|
| Correo | `admin@nova.com` |
| Contraseña | `123456` |
| Rol | Administrador |

> ⚠️ **Cambiar la contraseña inmediatamente** tras el primer inicio de sesión.

---

## 📁 Estructura del proyecto

```
nova/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js        Configuración Cloudinary
│   │   ├── mailer.js            Nodemailer + SMTP + templates email
│   │   ├── mongo.js             Conexión MongoDB Atlas
│   │   └── mysql.js             Pool conexiones MySQL
│   ├── controllers/
│   │   ├── auth.controller.js   Login, registro, recuperación
│   │   ├── catalogs.controller.js  CRUD clanes y cohortes
│   │   ├── novedades.controller.js CRUD novedades + IA
│   │   └── users.controller.js  CRUD usuarios + CSV
│   ├── middleware/auth.js        Verificación JWT y roles
│   ├── models/AuditLog.js        Modelo MongoDB auditoría
│   ├── routes/                  auth, catalogs, novedades, users, audit
│   ├── package.json
│   └── server.js                Punto de entrada
├── frontend/
│   ├── assets/img/              Logos e imágenes
│   ├── css/global.css           Estilos globales Light/Dark
│   ├── js/
│   │   ├── config.js            URL base de la API
│   │   └── utils.js             Helpers compartidos
│   └── pages/                  login, user, users, novedades, config, audit, reset-password
├── nova_schema.sql              Esquema completo de la BD
├── render.yaml                  Configuración despliegue Render
└── usuarios_prueba.csv          CSV de ejemplo
```

---

## 🔧 Solución de problemas

<details>
<summary><strong>Emails no se envían — Connection timeout</strong></summary>

El servidor está en plan gratuito de Render que bloquea los puertos SMTP. Subir al **plan Starter ($7/mes)** soluciona el problema permanentemente.

</details>

<details>
<summary><strong>Emails no se envían — Invalid login</strong></summary>

`SMTP_PASS` no es la contraseña de aplicación de Google. Regenerarla en:
Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación.

</details>

<details>
<summary><strong>Error ER_ACCESS_DENIED_ERROR</strong></summary>

Credenciales de MySQL incorrectas. Verificar `DB_USER` y `DB_PASSWORD`.

</details>

<details>
<summary><strong>Análisis de IA retorna prioridad Media siempre</strong></summary>

Verificar que `GROQ_API_KEY` esté configurado. Sin esta key el sistema asigna Media por defecto sin error.

</details>

<details>
<summary><strong>Imágenes o adjuntos no se suben</strong></summary>

Verificar las tres variables de Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.

</details>

<details>
<summary><strong>Módulo de auditoría no registra acciones</strong></summary>

Verificar que `MONGO_URI` apunte a un cluster activo y que `0.0.0.0/0` esté permitido en Network Access de MongoDB Atlas.

</details>

<details>
<summary><strong>El menú hamburguesa no abre en móvil</strong></summary>

Verificar que `toggleSidebar()` en `utils.js` incluya el manejo de `mobile-open` para pantallas menores a 768px.

</details>

---

<div align="center">

Hecho con 💜 — NOVA v2.0.0

</div>
