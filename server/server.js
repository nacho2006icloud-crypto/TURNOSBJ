const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'turnosbj_secret_key_2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Determinar carpeta según el tipo de upload
    let uploadDir = 'uploads/canchas';
    if (file.fieldname === 'foto') {
      uploadDir = 'uploads/profiles';
    }
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'turnosbj'
};

let db;

// Conectar a la base de datos
async function connectDB() {
  try {
    // Intentar conectar a MySQL primero
    try {
      db = await mysql.createConnection(dbConfig);
      console.log('✅ Conectado a MySQL');
      await createTables();
    } catch (mysqlError) {
      console.log('⚠️  MySQL no disponible, usando base de datos mock para desarrollo');
      console.log('💡 Para usar MySQL: configurar credenciales en server/.env');
      
      // Usar mock database
      db = require('./mockDB');
      console.log('✅ Usando base de datos mock');
    }
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Crear tablas necesarias (solo para MySQL real)
async function createTables() {
  try {
    // Solo crear tablas si estamos usando MySQL real
    if (db.constructor.name === 'Connection') {
      // Tabla de usuarios
      await db.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre_completo VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          ano_nacimiento INT,
          tipo_usuario ENUM('usuario', 'local') DEFAULT 'usuario',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Tabla de locales/canchas
      await db.execute(`
        CREATE TABLE IF NOT EXISTS locales (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          direccion TEXT NOT NULL,
          latitud DECIMAL(10, 8),
          longitud DECIMAL(11, 8),
          fotos JSON,
          descripcion TEXT,
          deportes JSON,
          precio_hora DECIMAL(10, 2),
          rating DECIMAL(3, 2) DEFAULT 0,
          total_reviews INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);

      // Tabla de sesiones/tokens
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sesiones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          token VARCHAR(500) NOT NULL,
          tipo_usuario ENUM('usuario', 'local') NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);

      console.log('✅ Tablas creadas/verificadas');
    }
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  }
}

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si el token existe en la base de datos y no ha expirado
    const [rows] = await db.execute(
      'SELECT * FROM sesiones WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = decoded;
    req.session = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// RUTAS DE AUTENTICACIÓN

// Registro de usuario
app.post('/api/auth/register/usuario', async (req, res) => {
  try {
    const { nombre_completo, email, password, ano_nacimiento } = req.body;

    if (!nombre_completo || !email || !password || !ano_nacimiento) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el email ya existe
    const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre_completo, email, password, ano_nacimiento, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [nombre_completo, email, hashedPassword, ano_nacimiento, 'usuario']
    );

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        tipo_usuario: 'usuario',
        nombre_completo 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Guardar sesión en la base de datos
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    await db.execute(
      'INSERT INTO sesiones (usuario_id, token, tipo_usuario, expires_at) VALUES (?, ?, ?, ?)',
      [result.insertId, token, 'usuario', expiresAt]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        nombre_completo,
        email,
        tipo_usuario: 'usuario'
      }
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro de local/cancha
// Registro de local/cancha (sin fotos en el registro inicial)
app.post('/api/auth/register/local', async (req, res) => {
  try {
    const { email, password, nombre, direccion, latitud, longitud, descripcion, deportes, precio_hora } = req.body;

    if (!email || !password || !nombre || !direccion) {
      return res.status(400).json({ error: 'Email, contraseña, nombre y dirección son requeridos' });
    }

    // Verificar si el email ya existe
    const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const [userResult] = await db.execute(
      'INSERT INTO usuarios (nombre_completo, email, password, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, 'local']
    );

    // Insertar local/cancha (fotos se agregan después en Settings)
    const [localResult] = await db.execute(
      'INSERT INTO locales (usuario_id, email, password, nombre, direccion, latitud, longitud, fotos, descripcion, deportes, precio_hora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userResult.insertId,
        email,
        hashedPassword,
        nombre,
        direccion,
        latitud || null,
        longitud || null,
        JSON.stringify([]),
        descripcion || '',
        deportes || '[]',
        precio_hora || 0
      ]
    );

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: userResult.insertId, 
        email, 
        tipo_usuario: 'local',
        nombre_completo: nombre,
        local_id: localResult.insertId
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Guardar sesión en la base de datos
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    await db.execute(
      'INSERT INTO sesiones (usuario_id, token, tipo_usuario, expires_at) VALUES (?, ?, ?, ?)',
      [userResult.insertId, token, 'local', expiresAt]
    );

    res.status(201).json({
      message: 'Local registrado exitosamente',
      token,
      user: {
        id: userResult.insertId,
        nombre_completo: nombre,
        email,
        tipo_usuario: 'local',
        local_id: localResult.insertId
      }
    });
  } catch (error) {
    console.error('Error en registro de local:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Buscar datos adicionales si es local
    let localData = null;
    if (user.tipo_usuario === 'local') {
      const [locales] = await db.execute('SELECT * FROM locales WHERE usuario_id = ?', [user.id]);
      localData = locales[0] || null;
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo_usuario: user.tipo_usuario,
        nombre_completo: user.nombre_completo,
        local_id: localData?.id || null
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Guardar sesión en la base de datos
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    await db.execute(
      'INSERT INTO sesiones (usuario_id, token, tipo_usuario, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, token, user.tipo_usuario, expiresAt]
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        local_id: localData?.id || null
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Eliminar sesión de la base de datos
    await db.execute('DELETE FROM sesiones WHERE token = ?', [req.headers.authorization.split(' ')[1]]);
    
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario actual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];
    
    // Buscar datos adicionales si es local
    let localData = null;
    if (user.tipo_usuario === 'local') {
      const [locales] = await db.execute('SELECT * FROM locales WHERE usuario_id = ?', [user.id]);
      localData = locales[0] || null;
    }

    res.json({
      id: user.id,
      nombre_completo: user.nombre_completo,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      ano_nacimiento: user.ano_nacimiento,
      local_id: localData?.id || null,
      local_data: localData
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE CANCHAS

// Obtener canchas (solo visibles)
app.get('/api/canchas', async (req, res) => {
  try {
    const { deporte, favoritas } = req.query;
    
    let query = `
      SELECT l.*, u.nombre_completo as propietario_nombre 
      FROM locales l 
      JOIN usuarios u ON l.usuario_id = u.id 
      WHERE l.visible = TRUE
    `;
    let params = [];

    if (deporte && deporte !== 'todas') {
      query += ' AND JSON_CONTAINS(l.deportes, ?)';
      params.push(`"${deporte}"`);
    }

    query += ' ORDER BY l.rating DESC, l.created_at DESC';

    const [canchas] = await db.execute(query, params);
    
    // Procesar fotos JSON
    const canchasProcessed = canchas.map(cancha => ({
      ...cancha,
      fotos: JSON.parse(cancha.fotos || '[]'),
      deportes: JSON.parse(cancha.deportes || '[]')
    }));

    res.json(canchasProcessed);
  } catch (error) {
    console.error('Error obteniendo canchas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE GESTIÓN DE USUARIOS

// Subir/actualizar foto de perfil
app.post('/api/usuario/foto-perfil', authenticateToken, upload.single('foto'), async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'usuario') {
      return res.status(403).json({ error: 'Solo usuarios pueden actualizar foto de perfil' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna foto' });
    }

    const fotoUrl = `/uploads/profiles/${req.file.filename}`;
    
    await db.execute('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [fotoUrl, req.user.id]);

    res.json({ message: 'Foto actualizada exitosamente', foto_perfil: fotoUrl });
  } catch (error) {
    console.error('Error actualizando foto de perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas del usuario
app.get('/api/usuario/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'usuario') {
      return res.status(403).json({ error: 'Solo usuarios pueden ver estadísticas' });
    }

    const userId = req.user.id;
    const hoy = new Date().toISOString().split('T')[0];

    // Próximos turnos
    const [proximos] = await db.execute(
      'SELECT COUNT(*) as count FROM reservas WHERE usuario_id = ? AND fecha >= ? AND estado != "cancelada"',
      [userId, hoy]
    );

    // Turnos disputados (completados)
    const [disputados] = await db.execute(
      'SELECT COUNT(*) as count FROM reservas WHERE usuario_id = ? AND estado = "completada"',
      [userId]
    );

    // Turnos cancelados
    const [cancelados] = await db.execute(
      'SELECT COUNT(*) as count FROM reservas WHERE usuario_id = ? AND estado = "cancelada"',
      [userId]
    );

    res.json({
      proximos: proximos[0]?.count || 0,
      disputados: disputados[0]?.count || 0,
      cancelados: cancelados[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE GESTIÓN DE LOCALES (para settings)

// Actualizar información del local
app.put('/api/local/info', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden actualizar información' });
    }

    const { nombre, direccion, descripcion, deportes, precio_hora } = req.body;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    await db.execute(
      'UPDATE locales SET nombre = ?, direccion = ?, descripcion = ?, deportes = ?, precio_hora = ? WHERE id = ?',
      [nombre, direccion, descripcion || '', deportes || '[]', precio_hora || 0, localId]
    );

    res.json({ message: 'Información actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando información:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Subir fotos al local
app.post('/api/local/fotos', authenticateToken, upload.array('fotos', 5), async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden subir fotos' });
    }

    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    // Obtener fotos actuales
    const [locales] = await db.execute('SELECT fotos FROM locales WHERE id = ?', [localId]);
    const fotosActuales = JSON.parse(locales[0]?.fotos || '[]');

    // Agregar nuevas fotos
    const nuevasFotos = req.files ? req.files.map(file => `/uploads/canchas/${file.filename}`) : [];
    const todasFotos = [...fotosActuales, ...nuevasFotos];

    await db.execute('UPDATE locales SET fotos = ? WHERE id = ?', [JSON.stringify(todasFotos), localId]);

    res.json({ message: 'Fotos subidas exitosamente', fotos: todasFotos });
  } catch (error) {
    console.error('Error subiendo fotos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar foto del local
app.delete('/api/local/fotos', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden eliminar fotos' });
    }

    const { foto } = req.body;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    // Obtener fotos actuales
    const [locales] = await db.execute('SELECT fotos FROM locales WHERE id = ?', [localId]);
    const fotosActuales = JSON.parse(locales[0]?.fotos || '[]');

    // Filtrar la foto a eliminar
    const fotosFiltradas = fotosActuales.filter(f => f !== foto);

    await db.execute('UPDATE locales SET fotos = ? WHERE id = ?', [JSON.stringify(fotosFiltradas), localId]);

    // Intentar eliminar el archivo físico
    try {
      const filePath = path.join(__dirname, '..', foto);
      await fs.unlink(filePath);
    } catch (err) {
      console.log('Archivo no encontrado o ya eliminado:', foto);
    }

    res.json({ message: 'Foto eliminada exitosamente', fotos: fotosFiltradas });
  } catch (error) {
    console.error('Error eliminando foto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener horarios del local
app.get('/api/local/horarios', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden ver horarios' });
    }

    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    const [horarios] = await db.execute(
      'SELECT * FROM horarios_disponibles WHERE local_id = ? ORDER BY FIELD(dia, "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"), hora_inicio',
      [localId]
    );

    res.json(horarios);
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo horario
app.post('/api/local/horarios', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden crear horarios' });
    }

    const { dia, hora_inicio, hora_fin, max_integrantes, deporte } = req.body;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    if (!dia || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: 'Día, hora de inicio y hora de fin son requeridos' });
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(hora_inicio) || !timeRegex.test(hora_fin)) {
      return res.status(400).json({ error: 'Formato de hora inválido. Use HH:MM' });
    }

    // Validar que hora_fin sea mayor que hora_inicio
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({ error: 'La hora de fin debe ser mayor a la hora de inicio' });
    }

    const [result] = await db.execute(
      'INSERT INTO horarios_disponibles (local_id, dia, hora_inicio, hora_fin, max_integrantes, deporte, disponible) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [localId, dia, hora_inicio, hora_fin, max_integrantes ? parseInt(max_integrantes) : null, deporte || 'Futbol 5']
    );

    res.status(201).json({ 
      message: 'Horario creado exitosamente',
      horario: {
        id: result.insertId,
        local_id: localId,
        dia,
        hora_inicio,
        hora_fin,
        max_integrantes: max_integrantes ? parseInt(max_integrantes) : null,
        deporte: deporte || 'Futbol 5',
        disponible: true
      }
    });
  } catch (error) {
    console.error('Error creando horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Toggle disponibilidad de horario
app.put('/api/local/horarios/:id/toggle', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden modificar horarios' });
    }

    const horarioId = req.params.id;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    // Verificar que el horario pertenece al local
    const [horarios] = await db.execute(
      'SELECT * FROM horarios_disponibles WHERE id = ? AND local_id = ?',
      [horarioId, localId]
    );

    if (horarios.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    const nuevoEstado = !horarios[0].disponible;

    await db.execute(
      'UPDATE horarios_disponibles SET disponible = ? WHERE id = ?',
      [nuevoEstado, horarioId]
    );

    res.json({ message: 'Estado actualizado exitosamente', disponible: nuevoEstado });
  } catch (error) {
    console.error('Error actualizando horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar horario
app.delete('/api/local/horarios/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden eliminar horarios' });
    }

    const horarioId = req.params.id;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    // Verificar que el horario pertenece al local
    const [horarios] = await db.execute(
      'SELECT * FROM horarios_disponibles WHERE id = ? AND local_id = ?',
      [horarioId, localId]
    );

    if (horarios.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    await db.execute('DELETE FROM horarios_disponibles WHERE id = ?', [horarioId]);

    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener reservas del local
app.get('/api/local/reservas', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden ver reservas' });
    }

    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    const [reservas] = await db.execute(`
      SELECT r.*, h.dia, h.hora_inicio, h.hora_fin, u.nombre_completo as usuario_nombre
      FROM reservas r
      JOIN horarios_disponibles h ON r.horario_id = h.id
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE h.local_id = ?
      ORDER BY r.fecha_reserva DESC, h.dia, h.hora_inicio
    `, [localId]);

    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Toggle visibilidad del local
app.put('/api/local/visibilidad', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'local') {
      return res.status(403).json({ error: 'Solo locales pueden modificar visibilidad' });
    }

    const { visible } = req.body;
    const localId = req.user.local_id;

    if (!localId) {
      return res.status(404).json({ error: 'Local no encontrado' });
    }

    await db.execute('UPDATE locales SET visible = ? WHERE id = ?', [visible ? 1 : 0, localId]);

    res.json({ 
      message: visible ? 'Cancha visible para usuarios' : 'Cancha oculta de usuarios',
      visible 
    });
  } catch (error) {
    console.error('Error actualizando visibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos' });
    }
  }
  
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Error interno del servidor' });
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
});