# NOVA — Sistema de Gestión de Novedades

NOVA es una plataforma web para gestionar ausencias y solicitudes de personal (coders) dentro de un bootcamp. Permite registrar novedades, administrar usuarios, gestionar catálogos de clanes/cohortes y analizar solicitudes con inteligencia artificial.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Instalación](#instalación)
4. [Configuración del entorno](#configuración-del-entorno)
5. [Base de datos](#base-de-datos)
6. [Ejecución](#ejecución)
7. [Dependencias](#dependencias)
8. [Funcionalidades](#funcionalidades)
9. [Roles y permisos](#roles-y-permisos)
10. [Variables de entorno](#variables-de-entorno)
11. [Carga masiva de usuarios](#carga-masiva-de-usuarios)
12. [Integración con servicios externos](#integración-con-servicios-externos)
13. [Credenciales iniciales](#credenciales-iniciales)
14. [Solución de problemas frecuentes](#solución-de-problemas-frecuentes)

---

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18.x o superior | https://nodejs.org |
| npm | 9.x o superior | Incluido con Node.js |
| MySQL | 5.7 o superior | https://dev.mysql.com/downloads/ |
| MongoDB | 6.x (opcional) | https://www.mongodb.com/try/download |

MySQL es obligatorio. MongoDB es opcional — si no se configura, el módulo de auditoría queda deshabilitado pero el sistema funciona normalmente.

---

## Estructura del proyecto

```
nova/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js     Configuración de Cloudinary (subida de archivos)
│   │   ├── mailer.js         Configuración de Nodemailer + templates de email
│   │   ├── mongo.js          Conexión a MongoDB (auditoría)
│   │   └── mysql.js          Pool de conexiones MySQL
│   ├── controllers/
│   │   ├── auth.controller.js        Login, registro, recuperación de contraseña
│   │   ├── catalogs.controller.js    CRUD de clanes y cohortes
│   │   ├── novedades.controller.js   CRUD novedades + análisis IA
│   │   └── users.controller.js       CRUD usuarios + importación CSV
│   ├── middleware/
│   │   └── auth.js           Verificación de JWT y roles
│   ├── models/
│   │   └── AuditLog.js       Modelo MongoDB para auditoría
│   ├── routes/
│   │   ├── audit.routes.js
│   │   ├── auth.routes.js
│   │   ├── catalogs.routes.js
│   │   ├── novedades.routes.js
│   │   └── users.routes.js
│   ├── package.json
│   └── server.js             Punto de entrada de la aplicación
├── frontend/
│   ├── assets/img/           Logos e imágenes
│   ├── css/
│   │   └── global.css        Estilos globales con soporte Light/Dark
│   ├── js/
│   │   └── utils.js          Utilidades compartidas (auth, http, toasts, tema)
│   └── pages/
│       ├── audit.html        Panel de auditoría (solo admin)
│       ├── config.html       Configuración: clanes, cohortes, CSV (solo admin)
│       ├── login.html        Pantalla de login y registro
│       ├── novedades.html    Panel principal de novedades (solo admin)
│       ├── reset-password.html  Restablecimiento de contraseña
│       ├── user.html         Vista de usuario (coder)
│       └── users.html        Gestión de usuarios (solo admin)
├── nova_schema.sql           Schema completo de la base de datos
└── usuarios_prueba.csv       CSV de ejemplo para carga masiva
```

---

## Instalación

### 1. Clonar o descomprimir el proyecto

```bash
# Si tienes el zip:
unzip nova.zip
cd nova
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

Esto instala automáticamente todas las dependencias listadas en `package.json`.

### 3. Crear el archivo de configuración

```bash
# Desde la carpeta backend/
cp .env.example .env
# O crear el archivo .env manualmente (ver sección siguiente)
```

---

## Configuración del entorno

Crea el archivo `backend/.env` con el siguiente contenido. Los campos marcados con (*) son obligatorios para el funcionamiento básico.

```env
# ── Servidor ──────────────────────────────────────────
PORT=3000                          # Puerto del servidor (*)

# ── JWT ───────────────────────────────────────────────
JWT_SECRET=cambia_esto_por_un_string_aleatorio_largo   # (*)
# Ejemplo seguro: openssl rand -hex 32

# ── MySQL ─────────────────────────────────────────────
DB_HOST=localhost                  # (*)
DB_PORT=3306
DB_USER=root                       # (*)
DB_PASSWORD=tu_password_mysql      # (*)
DB_NAME=nova                       # (*)

# ── MongoDB (opcional — para auditoría) ───────────────
# Si no se configura, el módulo de auditoría se deshabilita automáticamente
MONGO_URI=mongodb://localhost:27017/nova

# ── Cloudinary (opcional — para subida de archivos) ───
# Si no se configura, los adjuntos en novedades no funcionarán
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ── SMTP (opcional — para envío de emails) ────────────
# Si no se configura, los emails se omiten sin error
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password_de_gmail
# Nota: usar "contraseñas de aplicación" de Google, no la contraseña normal

# ── Groq IA (opcional — para análisis automático) ─────
# Si no se configura, la prioridad por defecto es "Media"
GROQ_API_KEY=gsk_...

# ── URL del frontend ──────────────────────────────────
# Usada en los enlaces de emails de recuperación de contraseña
FRONTEND_URL=http://localhost:3000
```

---

## Base de datos

### Crear la base de datos desde cero

```bash
mysql -u root -p < nova_schema.sql
```

Este comando:
- Elimina la base de datos `nova` si existe
- Crea todas las tablas con sus relaciones
- Inserta los datos iniciales (roles, estados, tipos de documento, etc.)
- Crea el usuario administrador inicial

### Verificar la instalación

```sql
USE nova;
SHOW TABLES;
SELECT id, correo, role_id, estado_id FROM usuarios;
```

Deberías ver las tablas: `tipos_documento`, `roles`, `estados`, `horarios`, `prioridades`, `clan`, `cohorte`, `usuarios`, `novedades`.

### Si ya tienes la base de datos pero le falta la columna reset_token_expires

```sql
USE nova;
ALTER TABLE usuarios ADD COLUMN reset_token_expires DATETIME DEFAULT NULL AFTER reset_token;
```

---

## Ejecución

### Modo desarrollo (con recarga automática)

```bash
cd backend
npm run dev
```

Requiere `nodemon` (incluido como devDependency).

### Modo producción

```bash
cd backend
npm start
```

### Acceder a la aplicación

Abre el navegador en: `http://localhost:3000`

El servidor sirve automáticamente los archivos del frontend desde `frontend/`.

---

## Dependencias

### Dependencias de producción (`backend/package.json`)

| Paquete | Versión | Propósito |
|---|---|---|
| `express` | ^4.19.2 | Framework HTTP principal |
| `mysql2` | ^3.11.3 | Driver MySQL con soporte de Promises |
| `bcryptjs` | ^2.4.3 | Hash seguro de contraseñas (no requiere compilación nativa) |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de tokens JWT |
| `dotenv` | ^16.4.5 | Carga de variables de entorno desde `.env` |
| `cors` | ^2.8.5 | Habilitación de CORS en la API |
| `mongoose` | ^8.4.3 | ODM para MongoDB (módulo de auditoría) |
| `nodemailer` | ^6.9.14 | Envío de emails (recuperación de contraseña, notificaciones) |
| `multer` | ^1.4.5-lts.1 | Manejo de archivos multipart (subida de CSV y adjuntos) |
| `cloudinary` | ^1.41.0 | Almacenamiento de imágenes y archivos en la nube |
| `streamifier` | ^0.1.1 | Convierte buffers en streams para Cloudinary |
| `groq-sdk` | ^0.5.0 | Cliente oficial de Groq para análisis con IA (LLaMA) |
| `express-validator` | ^7.2.0 | Validación de datos en rutas |

### Dependencias de desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| `nodemon` | ^3.1.4 | Reinicio automático del servidor en desarrollo |

### Frontend (sin dependencias npm)

El frontend usa únicamente recursos CDN:
- **Bootstrap Icons 1.11.3** — iconografía
- **Google Fonts** — tipografías Inter y Outfit

---

## Funcionalidades

### Módulo de autenticación
- Login con correo y contraseña
- Registro de nuevos usuarios (quedan en estado Inactivo hasta ser activados por admin)
- Recuperación de contraseña por email (enlace con expiración de 1 hora)
- Restablecimiento de contraseña desde enlace seguro
- Tokens JWT con expiración configurable
- Soporte Light/Dark mode persistente por usuario

### Módulo de novedades (panel admin)
- Listado de todas las novedades con filtros por estado y búsqueda
- Ver detalle completo de cada novedad (descripción, adjunto, prioridad)
- Aprobar o rechazar solicitudes con campo de observación
- Prioridad asignada automáticamente por IA al crear la novedad (Alta/Media/Baja)
- Análisis IA avanzado por novedad: recomendación, confianza, alertas, contexto temporal, historial del usuario, observación sugerida con botón de copia

### Módulo de novedades (panel coder)
- Registrar nuevas solicitudes de ausencia
- Adjuntar documentos de soporte (imágenes o PDF vía Cloudinary)
- Ver historial de novedades propias con estados

### Módulo de usuarios (solo admin)
- Listado con filtros por rol, estado y búsqueda
- Crear, editar y eliminar usuarios
- Activar/desactivar usuarios (el usuario recibe email al ser activado)
- Asignación de clan, cohorte y horario
- Carga masiva vía CSV con vista previa antes de confirmar

### Módulo de configuración (solo admin)
- CRUD de clanes
- CRUD de cohortes (numeradas como entero)
- Carga masiva de usuarios con:
  - Detección automática de columnas por nombre (no por posición)
  - Vista previa de hasta 10 filas antes de confirmar
  - Validación de columnas obligatorias
  - Botón de confirmación explícita

### Módulo de auditoría (solo admin)
- Historial de todas las acciones del sistema
- Filtros por entidad (usuarios / novedades)
- Almacenado en MongoDB (deshabilitado si no hay conexión)

---

## Roles y permisos

| Funcionalidad | Administrador | Coder |
|---|---|---|
| Ver todas las novedades | SI | No |
| Aprobar/rechazar novedades | SI | No |
| Gestionar usuarios | SI | No |
| Ver auditoría | SI | No |
| Configuración (clanes/cohortes) | SI | No |
| Carga masiva CSV | SI | No |
| Registrar novedad propia | SI | SI |
| Ver historial propio | SI | SI |

---

## Variables de entorno

Referencia rápida de las variables de entorno requeridas:

```
Variable               Requerida   Descripción
─────────────────────────────────────────────────────────────────
PORT                   SI          Puerto del servidor (default: 3000)
JWT_SECRET             SI          Clave secreta para firmar JWT
DB_HOST                SI          Host de MySQL
DB_PORT                No          Puerto MySQL (default: 3306)
DB_USER                SI          Usuario MySQL
DB_PASSWORD            SI          Contraseña MySQL
DB_NAME                SI          Nombre de la base de datos (nova)
MONGO_URI              No          URI de MongoDB para auditoría
CLOUDINARY_CLOUD_NAME  No          Cloud name de Cloudinary
CLOUDINARY_API_KEY     No          API Key de Cloudinary
CLOUDINARY_API_SECRET  No          API Secret de Cloudinary
SMTP_HOST              No          Servidor SMTP
SMTP_PORT              No          Puerto SMTP (default: 587)
SMTP_USER              No          Usuario SMTP
SMTP_PASS              No          Contraseña o App Password SMTP
GROQ_API_KEY           No          API Key de Groq para IA
FRONTEND_URL           No          URL base del frontend para emails
```

---

## Carga masiva de usuarios

El sistema acepta archivos CSV con detección automática de columnas por nombre.

### Columnas obligatorias
```
nombre, apellido, documento, correo, password
```

### Columnas opcionales
```
tipo_documento, telefono, role, estado, clan, cohorte, horario, observaciones
```

### Ejemplo de archivo CSV
```csv
nombre,apellido,documento,correo,password,telefono,clan,cohorte,horario
Laura,Martinez,1020304050,laura@correo.com,MiPassword123,3101234567,Tesla,3,Manana
Carlos,Perez,1030405060,carlos@correo.com,MiPassword123,3209876543,Turing,3,Tarde
```

### Notas importantes
- El orden de las columnas no importa — el sistema las detecta por nombre
- Los clanes y cohortes deben existir previamente en el sistema
- Los correos y documentos duplicados se ignoran (no generan error)
- Todos los usuarios importados quedan en estado Inactivo por defecto
- La contraseña se hashea automáticamente con bcrypt al importar

---

## Integración con servicios externos

### Gmail como SMTP
1. Habilitar verificación en 2 pasos en la cuenta de Google
2. Ir a Seguridad > Contraseñas de aplicaciones
3. Crear una contraseña de aplicación para "Correo"
4. Usar esa contraseña (16 caracteres) como `SMTP_PASS`

### Cloudinary
1. Crear cuenta en cloudinary.com
2. Copiar Cloud Name, API Key y API Secret desde el dashboard
3. Agregar esos valores al `.env`

### Groq (IA)
1. Crear cuenta en console.groq.com
2. Generar una API Key
3. Agregar como `GROQ_API_KEY` en el `.env`
4. El modelo usado es `llama-3.3-70b-versatile` (gratuito en el tier básico)

---

## Credenciales iniciales

Después de ejecutar `nova_schema.sql`:

| Campo | Valor |
|---|---|
| Correo | admin@nova.com |
| Contraseña | 123456 |
| Rol | Administrador |

**Cambiar la contraseña inmediatamente** después del primer inicio de sesión.

Para regenerar el hash de una nueva contraseña en el servidor:

```bash
cd backend
node -e "const b=require('bcryptjs'); b.hash('TuNuevaPassword', 12, (e,h) => console.log(h));"
```

Luego ejecutar en MySQL:
```sql
UPDATE usuarios SET password='<hash_generado>' WHERE correo='admin@nova.com';
```

---

## Solución de problemas frecuentes

### Error: "Unknown column 'u.estado' in 'on clause'"
La base de datos tiene el schema antiguo. Ejecutar:
```sql
ALTER TABLE usuarios ADD COLUMN estado_id INT NOT NULL DEFAULT 2 AFTER password;
UPDATE usuarios SET estado_id = 1;
```

### Error: "ER_ACCESS_DENIED_ERROR"
Las credenciales de MySQL en el `.env` son incorrectas. Verificar `DB_USER` y `DB_PASSWORD`.

### El login devuelve "Correo o contraseña incorrectos" pero los datos son correctos
El hash en la base de datos no corresponde a bcryptjs. Regenerar el hash desde el servidor del proyecto (donde está instalado bcryptjs) y actualizarlo directamente en MySQL.

### Los emails no se envían
- Verificar que `SMTP_USER` y `SMTP_PASS` estén configurados en `.env`
- Para Gmail, usar una "contraseña de aplicación", no la contraseña normal
- El sistema omite el envío silenciosamente si SMTP no está configurado

### El análisis de IA no funciona / retorna prioridad Media siempre
Verificar que `GROQ_API_KEY` esté configurado en `.env`. Si no está, el sistema asigna prioridad Media por defecto sin generar error.

### El enlace de recuperación de contraseña lleva a "no se puede acceder al sitio"
La variable `FRONTEND_URL` en el `.env` apunta a `localhost`. Si accedes al sistema desde otra máquina o IP, actualizar esa variable con la URL correcta:
```env
FRONTEND_URL=http://192.168.1.100:3000
```

### Error al ejecutar el schema SQL: "IF NOT EXISTS para columna"
MySQL no soporta esa sintaxis para columnas. Usar directamente:
```sql
ALTER TABLE usuarios ADD COLUMN reset_token_expires DATETIME DEFAULT NULL AFTER reset_token;
```
