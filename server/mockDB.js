// Mock service para testing sin MySQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class MockDatabase {
  constructor() {
    this.usuarios = [
      {
        id: 1,
        nombre_completo: 'Juan Pérez',
        email: 'test@test.com',
        password: bcrypt.hashSync('123456', 12),
        tipo_usuario: 'usuario',
        ano_nacimiento: 1990
      },
      {
        id: 2,
        nombre_completo: 'Club Norte',
        email: 'local@test.com',
        password: bcrypt.hashSync('123456', 12),
        tipo_usuario: 'local'
      }
    ];

    this.locales = [
      {
        id: 1,
        usuario_id: 2,
        nombre: 'Club Norte',
        direccion: 'Av. Libertador 1234',
        fotos: [],
        precio_hora: 5000,
        rating: 4.5
      }
    ];

    this.sesiones = [];
    this.nextUserId = 3;
    this.nextLocalId = 2;
  }

  // Simular consulta
  async execute(query, params = []) {
    console.log('Mock Query:', query, params);
    
    // Login
    if (query.includes('SELECT * FROM usuarios WHERE email = ?')) {
      const email = params[0];
      const user = this.usuarios.find(u => u.email === email);
      return [[user].filter(Boolean)];
    }

    // Registro usuario
    if (query.includes('INSERT INTO usuarios') && query.includes('usuario')) {
      const [nombre_completo, email, password, ano_nacimiento, tipo_usuario] = params;
      const newUser = {
        id: this.nextUserId++,
        nombre_completo,
        email,
        password,
        ano_nacimiento,
        tipo_usuario
      };
      this.usuarios.push(newUser);
      return [{ insertId: newUser.id }];
    }

    // Registro local
    if (query.includes('INSERT INTO usuarios') && query.includes('local')) {
      const [nombre, email, password, tipo_usuario] = params;
      const newUser = {
        id: this.nextUserId++,
        nombre_completo: nombre,
        email,
        password,
        tipo_usuario
      };
      this.usuarios.push(newUser);
      return [{ insertId: newUser.id }];
    }

    // Insertar local
    if (query.includes('INSERT INTO locales')) {
      const newLocal = {
        id: this.nextLocalId++,
        usuario_id: params[0],
        nombre: params[3],
        direccion: params[4],
        fotos: JSON.parse(params[7] || '[]'),
        precio_hora: params[10] || 0,
        rating: 0
      };
      this.locales.push(newLocal);
      return [{ insertId: newLocal.id }];
    }

    // Verificar email existente
    if (query.includes('SELECT id FROM usuarios WHERE email = ?')) {
      const email = params[0];
      const exists = this.usuarios.find(u => u.email === email);
      return [[exists].filter(Boolean)];
    }

    // Insertar sesión
    if (query.includes('INSERT INTO sesiones')) {
      const session = {
        id: Date.now(),
        usuario_id: params[0],
        token: params[1],
        tipo_usuario: params[2],
        expires_at: params[3]
      };
      this.sesiones.push(session);
      return [{ insertId: session.id }];
    }

    // Obtener canchas
    if (query.includes('SELECT l.*, u.nombre_completo') && query.includes('FROM locales l')) {
      return [this.locales.map(local => ({
        ...local,
        propietario_nombre: this.usuarios.find(u => u.id === local.usuario_id)?.nombre_completo
      }))];
    }

    return [[]];
  }
}

module.exports = new MockDatabase();