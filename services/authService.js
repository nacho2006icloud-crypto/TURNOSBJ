// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  // Guardar token en AsyncStorage
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  // Obtener token de AsyncStorage
  async getToken() {
    try {
      if (!this.token) {
        this.token = await AsyncStorage.getItem('auth_token');
      }
      return this.token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  // Eliminar token
  async removeToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  // Realizar petición con autenticación
  async authenticatedRequest(url, options = {}) {
    const token = await this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expirado o inválido
        await this.removeToken();
        throw new Error('Sesión expirada');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en petición autenticada:', error);
      throw error;
    }
  }

  // Registro de usuario
  async registerUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      // Guardar token y usuario
      await this.saveToken(data.token);
      this.user = data.user;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en registro de usuario:', error);
      return { success: false, error: error.message };
    }
  }

  // Registro de local/cancha
  async registerLocal(localData) {
    try {
      // Enviar como JSON simple (fotos se suben después en Settings)
      const response = await fetch(`${API_BASE_URL}/auth/register/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: localData.email,
          password: localData.password,
          nombre: localData.nombre,
          direccion: localData.direccion,
          latitud: localData.latitud,
          longitud: localData.longitud,
          descripcion: localData.descripcion || '',
          deportes: localData.deportes || '[]',
          precio_hora: localData.precio_hora || 0
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      // Guardar token y usuario
      await this.saveToken(data.token);
      this.user = data.user;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en registro de local:', error);
      return { success: false, error: error.message };
    }
  }

  // Login
  async login(credentials) {
    try {
      console.log('🔐 Intentando login con:', credentials.email);
      console.log('🌐 URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 Respuesta del servidor:', response.status);
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // Guardar token y usuario
      await this.saveToken(data.token);
      this.user = data.user;

      console.log('✅ Login exitoso para:', data.user.email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      await this.authenticatedRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.user = null; // Limpiar usuario en memoria
      await this.removeToken();
    }
  }

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      if (!this.user) {
        const data = await this.authenticatedRequest('/auth/me');
        this.user = data;
      }
      return this.user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      await this.removeToken();
      return null;
    }
  }

  // Verificar si está autenticado
  async isAuthenticated() {
    const token = await this.getToken();
    if (!token) return false;

    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Obtener canchas
  async getCanchas(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/canchas${queryParams ? `?${queryParams}` : ''}`;
      
      const data = await this.authenticatedRequest(url);
      return { success: true, canchas: data };
    } catch (error) {
      console.error('Error obteniendo canchas:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();