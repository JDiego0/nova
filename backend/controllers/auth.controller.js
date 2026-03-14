// controllers/auth.controller.js
const bcrypt            = require('bcryptjs');
const pool              = require('../config/mysql');
const { generateToken } = require('../middleware/auth');
const crypto            = require('crypto');

const SELECT_USER = `
  SELECT u.*, r.nombre AS role_nombre, e.nombre AS estado_nombre,
         td.nombre AS tipo_documento_nombre, h.nombre AS horario_nombre
  FROM   usuarios u
  JOIN   roles              r  ON u.role_id           = r.id
  JOIN   estados            e  ON u.estado_id         = e.id
  LEFT JOIN tipos_documento td ON u.tipo_documento_id = td.id
  LEFT JOIN horarios        h  ON u.horario_id        = h.id
`;

// ── LOGIN ─────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password)
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  try {
    const [[user]] = await pool.query(SELECT_USER + ' WHERE u.correo = ?', [correo]);
    if (!user) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    let match = false;
    if (user.password && user.password.startsWith('$2')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = (password === user.password);
      if (match) {
        const hash = await bcrypt.hash(password, 12);
        await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hash, user.id]);
      }
    }
    if (!match) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    if (!user.estado_nombre || user.estado_nombre.toLowerCase() !== 'activo')
      return res.status(403).json({ error: 'Cuenta inactiva. Contacta al administrador.' });

    const payload = {
      id:       String(user.id),
      nombre:   user.nombre,
      apellido: user.apellido,
      correo:   user.correo,
      role:     user.role_nombre,
      avatar:   user.avatar || null,
      estado:   user.estado_nombre,
    };
    res.json({ token: generateToken(payload), user: payload });
  } catch (err) {
    console.error('❌ login error:', err.message);
    res.status(500).json({ error: 'Error de servidor: ' + err.message });
  }
};

// ── REGISTER ──────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { nombre, apellido, documento, correo, password, telefono } = req.body;
  for (const [k, v] of Object.entries({ nombre, apellido, documento, correo, password }))
    if (!v) return res.status(400).json({ error: `Campo '${k}' requerido` });
  try {
    const [[exists]] = await pool.query('SELECT id FROM usuarios WHERE correo=? OR documento=?', [correo, documento]);
    if (exists) return res.status(409).json({ error: 'El correo o documento ya está registrado' });

    const [[roleRow]]   = await pool.query("SELECT id FROM roles WHERE LOWER(nombre)='coder' LIMIT 1");
    const [[estadoRow]] = await pool.query("SELECT id FROM estados WHERE LOWER(nombre)='inactivo' LIMIT 1");
    const [[tipoRow]]   = await pool.query('SELECT id FROM tipos_documento ORDER BY id LIMIT 1');

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO usuarios (nombre,apellido,tipo_documento_id,documento,correo,password,telefono,role_id,estado_id)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [nombre, apellido, tipoRow?.id||1, documento, correo, hash, telefono||null, roleRow?.id||2, estadoRow?.id||1]
    );
    res.status(201).json({ message: 'Cuenta creada. Un administrador debe activarla antes de que puedas ingresar.' });
  } catch (err) {
    console.error('❌ register error:', err.message);
    res.status(500).json({ error: 'Error de servidor: ' + err.message });
  }
};

// ── ME ────────────────────────────────────────────────────────────
exports.me = async (req, res) => {
  try {
    const [[user]] = await pool.query(SELECT_USER + ' WHERE u.id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error de servidor' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: 'Correo requerido' });
  try {
    const [[user]] = await pool.query('SELECT id, nombre FROM usuarios WHERE correo=?', [correo]);
    if (!user) return res.status(404).json({ error: 'Este correo no está registrado en el sistema.' });

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query('UPDATE usuarios SET reset_token=?, reset_token_expires=? WHERE id=?',
      [token, expires, user.id]);

    const { sendMail } = require('../config/mailer');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/reset-password.html?token=${token}`;
    await sendMail(correo, '🔐 Recuperación de contraseña — NOVA', `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f8;padding:32px">
      <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#6d28d9,#8b5cf6);padding:28px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:1.4rem">🔐 NOVA — Recuperar contraseña</h1>
        </div>
        <div style="padding:32px;color:#374151">
          <h2 style="color:#6d28d9;margin-top:0">Hola, ${user.nombre}</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${resetUrl}" style="background:#6d28d9;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem">Restablecer contraseña</a>
          </div>
          <p style="font-size:.85rem;color:#6b7280">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.</p>
          <p style="font-size:.8rem;color:#9ca3af;word-break:break-all">O copia este enlace: ${resetUrl}</p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center;font-size:.8rem;color:#9ca3af;border-top:1px solid #e5e7eb">Mensaje automático — No responder</div>
      </div></body></html>
    `);

    res.json({ message: `Enlace enviado a ${correo}. Revisa tu bandeja de entrada.` });
  } catch (err) {
    console.error('❌ forgotPassword:', err.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  try {
    // Buscar el token sin validar expiración primero, para dar mejor feedback
    const [[row]] = await pool.query(
      'SELECT id, reset_token_expires FROM usuarios WHERE reset_token = ?',
      [token]
    );

    if (!row) {
      console.warn('⚠️  reset-password: token no encontrado:', token?.substring(0,10) + '...');
      return res.status(400).json({ error: 'Enlace inválido o expirado. Solicita uno nuevo.' });
    }

    // Verificar expiración manualmente (evita problemas de timezone con NOW())
    const expires = row.reset_token_expires ? new Date(row.reset_token_expires) : null;
    const ahora   = new Date();
    console.log('🔑 Token encontrado. Expira:', expires, '| Ahora:', ahora);

    if (!expires || ahora > expires) {
      console.warn('⚠️  reset-password: token expirado para usuario id:', row.id);
      return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo desde el login.' });
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE usuarios SET password=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?',
      [hash, row.id]
    );
    console.log('✅ reset-password: contraseña actualizada para usuario id:', row.id);
    res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('❌ resetPassword:', err.message);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};
