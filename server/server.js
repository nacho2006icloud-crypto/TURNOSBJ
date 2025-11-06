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
    const uploadDir = 'uploads/canchas';
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
app.post('/api/auth/register/local', upload.array('fotos', 5), async (req, res) => {
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

    // Procesar fotos subidas
    const fotos = req.files ? req.files.map(file => `/uploads/canchas/${file.filename}`) : [];

    // Insertar usuario
    const [userResult] = await db.execute(
      'INSERT INTO usuarios (nombre_completo, email, password, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, 'local']
    );

    // Insertar local/cancha
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
        JSON.stringify(fotos),
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

// Obtener canchas
app.get('/api/canchas', async (req, res) => {
  try {
    const { deporte, favoritas } = req.query;
    
    let query = `
      SELECT l.*, u.nombre_completo as propietario_nombre 
      FROM locales l 
      JOIN usuarios u ON l.usuario_id = u.id 
      WHERE 1=1
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