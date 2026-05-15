// config/mysql.js
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// Aiven requiere SSL obligatoriamente.
// Opciones en orden de prioridad:
//   1. DB_SSL_CA (base64) → para producción en Render (variable de entorno)
//   2. archivo ca.pem     → para desarrollo local (backend/ca.pem)
//   3. DB_SSL=false       → para bases de datos locales sin SSL
function buildSslConfig() {
  if (process.env.DB_SSL === 'false') return false;

  if (process.env.DB_SSL_CA) {
    return { ca: Buffer.from(process.env.DB_SSL_CA, 'base64') };
  }

  const caPath = path.join(__dirname, '..', 'ca.pem');
  if (fs.existsSync(caPath)) {
    return { ca: fs.readFileSync(caPath) };
  }

  return false;
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'nova',
  port:               parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '-05:00',
  // ── Mantiene las conexiones vivas con pings TCP ──────
  enableKeepAlive:       true,
  keepAliveInitialDelay: 10000, // primer ping a los 10 segundos
  // ── SSL para Aiven ────────────────────────────────────
  ssl: buildSslConfig() || undefined,
});

module.exports = pool;
