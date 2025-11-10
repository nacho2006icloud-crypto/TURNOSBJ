// Simulación de backend con datos mock

// ========== TURNOS ==========
const turnosData = [
  {
    id: 1,
    cancha: "Club Atlético River",
    deporte: "Futbol",
    fecha: "2025-11-03",
    hora: "18:00",
    duracion: "90 min",
    ubicacion: "Núñez, Buenos Aires",
    precio: 15000,
  },
  // Agregar más turnos aquí si es necesario
];

// ========== CANCHAS POR DEPORTE ==========
const canchasData = {
  'Futbol 5': [
    {
      id: 1,
      nombre: "Predio Futbolístico Norte",
      ubicacion: "Palermo, CABA",
      rating: 4.8,
      precio_hora: 12000,
      imagen: "https://via.placeholder.com/400x250/4CAF50/ffffff?text=Futbol+5",
      caracteristicas: ["Césped sintético", "Iluminación LED", "Vestuarios"],
    },
    {
      id: 2,
      nombre: "Club River Plate",
      ubicacion: "Núñez, CABA",
      rating: 4.9,
      precio_hora: 18000,
      imagen: "https://via.placeholder.com/400x250/4CAF50/ffffff?text=Futbol+5",
      caracteristicas: ["Césped natural", "Graderías", "Estacionamiento"],
    },
  ],
  'Futbol 7': [
    {
      id: 3,
      nombre: "Canchas Don Bosco",
      ubicacion: "Almagro, CABA",
      rating: 4.5,
      precio_hora: 15000,
      imagen: "https://via.placeholder.com/400x250/2196F3/ffffff?text=Futbol+7",
      caracteristicas: ["Futbol 7", "Parrilla", "Bar"],
    },
  ],
  'Futbol 11': [
    {
      id: 4,
      nombre: "Sport Center",
      ubicacion: "Belgrano, CABA",
      rating: 4.7,
      precio_hora: 25000,
      imagen: "https://via.placeholder.com/400x250/FF9800/ffffff?text=Futbol+11",
      caracteristicas: ["Campo reglamentario", "Cafetería", "Wi-Fi"],
    },
  ],
  'Padel': [
    {
      id: 5,
      nombre: "Padel Pro Center",
      ubicacion: "Recoleta, CABA",
      rating: 4.9,
      precio_hora: 8000,
      imagen: "https://via.placeholder.com/400x250/9C27B0/ffffff?text=Padel",
      caracteristicas: ["6 canchas", "Iluminación profesional", "Shop"],
    },
    {
      id: 6,
      nombre: "Club de Amigos",
      ubicacion: "Palermo, CABA",
      rating: 4.6,
      precio_hora: 6500,
      imagen: "https://via.placeholder.com/400x250/9C27B0/ffffff?text=Padel",
      caracteristicas: ["4 canchas", "Vestuarios", "Estacionamiento"],
    },
  ],
  'Tenis': [
    {
      id: 9,
      nombre: "Buenos Aires Lawn Tennis",
      ubicacion: "Palermo, CABA",
      rating: 4.9,
      precio_hora: 10000,
      imagen: "https://via.placeholder.com/400x250/F44336/ffffff?text=Tenis",
      caracteristicas: ["Polvo de ladrillo", "8 canchas", "Profesores"],
    },
    {
      id: 10,
      nombre: "Club Náutico",
      ubicacion: "Puerto Madero, CABA",
      rating: 4.7,
      precio_hora: 12000,
      imagen: "https://via.placeholder.com/400x250/F44336/ffffff?text=Tenis",
      caracteristicas: ["Hard court", "Vista al río", "Restaurant"],
    },
  ],
  'Basquet': [
    {
      id: 13,
      nombre: "Basketball Arena",
      ubicacion: "Belgrano, CABA",
      rating: 4.8,
      precio_hora: 11000,
      imagen: "https://via.placeholder.com/400x250/FF5722/ffffff?text=Basquet",
      caracteristicas: ["Indoor", "Tablero NBA", "Graderías"],
    },
    {
      id: 14,
      nombre: "Club Obras",
      ubicacion: "Núñez, CABA",
      rating: 4.9,
      precio_hora: 13000,
      imagen: "https://via.placeholder.com/400x250/FF5722/ffffff?text=Basquet",
      caracteristicas: ["Profesional", "Aire acondicionado", "Vestuarios"],
    },
  ],
  'Voley': [
    {
      id: 17,
      nombre: "Voley Center",
      ubicacion: "Caballito, CABA",
      rating: 4.6,
      precio_hora: 9500,
      imagen: "https://via.placeholder.com/400x250/00BCD4/ffffff?text=Voley",
      caracteristicas: ["Indoor", "Piso reglamentario", "Vestuarios"],
    },
  ],
};

// ========== JUGADORES GOATS ==========
const goatsData = [
  {
    id: 1,
    nombre: "Martín González",
    deporte: "Futbol",
    puntos: 4850,
    partidosJugados: 142,
    avatar: "https://via.placeholder.com/100/3b82f6/ffffff?text=MG",
    posicion: 1,
    nivel: "Legendario",
  },
  {
    id: 2,
    nombre: "Lucas Fernández",
    deporte: "Padel",
    puntos: 4620,
    partidosJugados: 128,
    avatar: "https://via.placeholder.com/100/10b981/ffffff?text=LF",
    posicion: 2,
    nivel: "Maestro",
  },
  {
    id: 3,
    nombre: "Santiago Ruiz",
    deporte: "Tenis",
    puntos: 4580,
    partidosJugados: 135,
    avatar: "https://via.placeholder.com/100/eab308/ffffff?text=SR",
    posicion: 3,
    nivel: "Maestro",
  },
  {
    id: 4,
    nombre: "Diego Martínez",
    deporte: "Basket",
    puntos: 4420,
    partidosJugados: 118,
    avatar: "https://via.placeholder.com/100/f97316/ffffff?text=DM",
    posicion: 4,
    nivel: "Experto",
  },
  {
    id: 5,
    nombre: "Javier López",
    deporte: "Futbol",
    puntos: 4380,
    partidosJugados: 125,
    avatar: "https://via.placeholder.com/100/8b5cf6/ffffff?text=JL",
    posicion: 5,
    nivel: "Experto",
  },
  {
    id: 6,
    nombre: "Pablo Sánchez",
    deporte: "Handball",
    puntos: 4250,
    partidosJugados: 112,
    avatar: "https://via.placeholder.com/100/ef4444/ffffff?text=PS",
    posicion: 6,
    nivel: "Experto",
  },
  {
    id: 7,
    nombre: "Fernando Castro",
    deporte: "Padel",
    puntos: 4180,
    partidosJugados: 109,
    avatar: "https://via.placeholder.com/100/06b6d4/ffffff?text=FC",
    posicion: 7,
    nivel: "Avanzado",
  },
  {
    id: 8,
    nombre: "Matías Silva",
    deporte: "Futbol",
    puntos: 4120,
    partidosJugados: 104,
    avatar: "https://via.placeholder.com/100/a855f7/ffffff?text=MS",
    posicion: 8,
    nivel: "Avanzado",
  },
  {
    id: 9,
    nombre: "Andrés Rodríguez",
    deporte: "Tenis",
    puntos: 4050,
    partidosJugados: 98,
    avatar: "https://via.placeholder.com/100/14b8a6/ffffff?text=AR",
    posicion: 9,
    nivel: "Avanzado",
  },
  {
    id: 10,
    nombre: "Nicolás Pérez",
    deporte: "Basket",
    puntos: 3980,
    partidosJugados: 95,
    avatar: "https://via.placeholder.com/100/f59e0b/ffffff?text=NP",
    posicion: 10,
    nivel: "Avanzado",
  },
];

// ========== SERVICIOS (API SIMULADA) ==========

// Simula delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const turnosService = {
  // Obtener turnos del usuario
  getTurnosUsuario: async () => {
    await delay(300);
    return turnosData;
  },

  // Obtener próximo turno
  getProximoTurno: async () => {
    await delay(200);
    return turnosData.length > 0 ? turnosData[0] : null;
  },

  // Cancelar turno
  cancelarTurno: async (turnoId) => {
    await delay(400);
    const index = turnosData.findIndex(t => t.id === turnoId);
    if (index !== -1) {
      turnosData.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: "Turno no encontrado" };
  },
};

export const canchasService = {
  // Obtener canchas por deporte (desde API real)
  getCanchasPorDeporte: async (deporte) => {
    try {
      // Si es 'favoritas', retornar array vacío por ahora (implementar después)
      if (deporte === 'favoritas') {
        return [];
      }

      const API_BASE_URL = 'http://localhost:3000/api';
      const url = `${API_BASE_URL}/canchas?deporte=${encodeURIComponent(deporte)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo canchas:', response.status);
        // Fallback a mock data si hay error
        return canchasData[deporte] || [];
      }

      const canchas = await response.json();
      return canchas;
    } catch (error) {
      console.error('Error en getCanchasPorDeporte:', error);
      // Fallback a mock data si hay error
      return canchasData[deporte] || [];
    }
  },

  // Obtener todas las canchas
  getTodasCanchas: async () => {
    try {
      const API_BASE_URL = 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/canchas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo canchas:', response.status);
        return Object.values(canchasData).flat();
      }

      const canchas = await response.json();
      return canchas;
    } catch (error) {
      console.error('Error en getTodasCanchas:', error);
      return Object.values(canchasData).flat();
    }
  },

  // Obtener cancha por ID
  getCanchaById: async (id) => {
    try {
      const API_BASE_URL = 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/canchas/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error obteniendo cancha:', response.status);
        const todasCanchas = Object.values(canchasData).flat();
        return todasCanchas.find(c => c.id === id);
      }

      const cancha = await response.json();
      return cancha;
    } catch (error) {
      console.error('Error en getCanchaById:', error);
      const todasCanchas = Object.values(canchasData).flat();
      return todasCanchas.find(c => c.id === id);
    }
  },
};

export const goatsService = {
  // Obtener top jugadores
  getTopJugadores: async (limit = 10) => {
    await delay(300);
    return goatsData.slice(0, limit);
  },

  // Votar jugador (incrementar puntos)
  votarJugador: async (jugadorId, puntos = 10) => {
    await delay(400);
    const jugador = goatsData.find(j => j.id === jugadorId);
    if (jugador) {
      jugador.puntos += puntos;
      // Reordenar por puntos
      goatsData.sort((a, b) => b.puntos - a.puntos);
      // Actualizar posiciones
      goatsData.forEach((j, index) => {
        j.posicion = index + 1;
      });
      return { success: true, jugador };
    }
    return { success: false, error: "Jugador no encontrado" };
  },

  // Obtener jugador por ID
  getJugadorById: async (id) => {
    await delay(200);
    return goatsData.find(j => j.id === id);
  },
};

// Iconos/Colores por deporte
export const deportesConfig = {
  'Futbol 5': { 
    icon: 'football', 
    color: '#4CAF50',
    gradientColors: ['#388E3C', '#4CAF50']
  },
  'Futbol 7': { 
    icon: 'football', 
    color: '#2196F3',
    gradientColors: ['#1976D2', '#2196F3']
  },
  'Futbol 11': { 
    icon: 'football', 
    color: '#FF9800',
    gradientColors: ['#F57C00', '#FF9800']
  },
  'Padel': { 
    icon: 'tennisball', 
    color: '#9C27B0',
    gradientColors: ['#7B1FA2', '#9C27B0']
  },
  'Tenis': { 
    icon: 'tennisball', 
    color: '#F44336',
    gradientColors: ['#D32F2F', '#F44336']
  },
  'Basquet': { 
    icon: 'basketball', 
    color: '#FF5722',
    gradientColors: ['#E64A19', '#FF5722']
  },
  'Voley': { 
    icon: 'baseball', 
    color: '#00BCD4',
    gradientColors: ['#0097A7', '#00BCD4']
  },
};
