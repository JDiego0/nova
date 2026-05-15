// config/mysql.js
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
 
function buildSslConfig() {
  // Sin SSL (solo para MySQL local sin SSL configurado)
  if (process.env.DB_SSL === 'false') return false;
 
  // SSL verificado con certificado CA en base64 (variable de entorno en Render)
  if (process.env.DB_SSL_CA) {
    return {
      ca:                 Buffer.from(process.env.DB_SSL_CA, 'base64'),
      rejectUnauthorized: true,
    };
  }
 
  // SSL verificado con archivo ca.pem local (desarrollo)
  const caPath = path.join(__dirname, '..', 'ca.pem');
  if (fs.existsSync(caPath)) {
    return {
      ca:                 fs.readFileSync(caPath),
      rejectUnauthorized: true,
    };
  }
 
  // SSL sin verificar certificado (demo / Render gratuito sin ca.pem)
  // El tráfico sigue cifrado, solo no se valida la cadena del certificado.
  return { rejectUnauthorized: false };
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
  keepAliveInitialDelay: 10000,
  // ── SSL para Aiven ────────────────────────────────────
  ssl: buildSslConfig() || undefined,
});
 
module.exports = pool;