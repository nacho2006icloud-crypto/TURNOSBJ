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
  futbol: [
    {
      id: 1,
      nombre: "Predio Futbolístico Norte",
      ubicacion: "Palermo, CABA",
      rating: 4.8,
      precio: 12000,
      imagen: "https://via.placeholder.com/400x250/10b981/ffffff?text=Futbol",
      caracteristicas: ["Césped sintético", "Iluminación LED", "Vestuarios"],
    },
    {
      id: 2,
      nombre: "Club River Plate",
      ubicacion: "Núñez, CABA",
      rating: 4.9,
      precio: 18000,
      imagen: "https://via.placeholder.com/400x250/10b981/ffffff?text=Futbol",
      caracteristicas: ["Césped natural", "Graderías", "Estacionamiento"],
    },
    {
      id: 3,
      nombre: "Canchas Don Bosco",
      ubicacion: "Almagro, CABA",
      rating: 4.5,
      precio: 10000,
      imagen: "https://via.placeholder.com/400x250/10b981/ffffff?text=Futbol",
      caracteristicas: ["Futbol 5", "Parrilla", "Bar"],
    },
    {
      id: 4,
      nombre: "Sport Center",
      ubicacion: "Belgrano, CABA",
      rating: 4.7,
      precio: 14000,
      imagen: "https://via.placeholder.com/400x250/10b981/ffffff?text=Futbol",
      caracteristicas: ["Multi-canchas", "Cafetería", "Wi-Fi"],
    },
  ],
  padel: [
    {
      id: 5,
      nombre: "Padel Pro Center",
      ubicacion: "Recoleta, CABA",
      rating: 4.9,
      precio: 8000,
      imagen: "https://via.placeholder.com/400x250/3b82f6/ffffff?text=Padel",
      caracteristicas: ["6 canchas", "Iluminación profesional", "Shop"],
    },
    {
      id: 6,
      nombre: "Club de Amigos",
      ubicacion: "Palermo, CABA",
      rating: 4.6,
      precio: 6500,
      imagen: "https://via.placeholder.com/400x250/3b82f6/ffffff?text=Padel",
      caracteristicas: ["4 canchas", "Vestuarios", "Estacionamiento"],
    },
    {
      id: 7,
      nombre: "Padel House",
      ubicacion: "Núñez, CABA",
      rating: 4.8,
      precio: 7500,
      imagen: "https://via.placeholder.com/400x250/3b82f6/ffffff?text=Padel",
      caracteristicas: ["Indoor", "Climatizado", "Bar"],
    },
    {
      id: 8,
      nombre: "Sport Padel Club",
      ubicacion: "Caballito, CABA",
      rating: 4.5,
      precio: 6000,
      imagen: "https://via.placeholder.com/400x250/3b82f6/ffffff?text=Padel",
      caracteristicas: ["3 canchas", "Quincho", "Parrilla"],
    },
  ],
  tenis: [
    {
      id: 9,
      nombre: "Buenos Aires Lawn Tennis",
      ubicacion: "Palermo, CABA",
      rating: 4.9,
      precio: 10000,
      imagen: "https://via.placeholder.com/400x250/eab308/ffffff?text=Tenis",
      caracteristicas: ["Polvo de ladrillo", "8 canchas", "Profesores"],
    },
    {
      id: 10,
      nombre: "Club Náutico",
      ubicacion: "Puerto Madero, CABA",
      rating: 4.7,
      precio: 12000,
      imagen: "https://via.placeholder.com/400x250/eab308/ffffff?text=Tenis",
      caracteristicas: ["Hard court", "Vista al río", "Restaurant"],
    },
    {
      id: 11,
      nombre: "Tenis Center",
      ubicacion: "Villa Urquiza, CABA",
      rating: 4.6,
      precio: 8500,
      imagen: "https://via.placeholder.com/400x250/eab308/ffffff?text=Tenis",
      caracteristicas: ["Césped sintético", "Iluminación", "Buffet"],
    },
    {
      id: 12,
      nombre: "Club Italiano",
      ubicacion: "Almagro, CABA",
      rating: 4.8,
      precio: 9500,
      imagen: "https://via.placeholder.com/400x250/eab308/ffffff?text=Tenis",
      caracteristicas: ["Canchas rápidas", "Vestuarios", "Sauna"],
    },
  ],
  basket: [
    {
      id: 13,
      nombre: "Basketball Arena",
      ubicacion: "Belgrano, CABA",
      rating: 4.8,
      precio: 11000,
      imagen: "https://via.placeholder.com/400x250/f97316/ffffff?text=Basket",
      caracteristicas: ["Indoor", "Tablero NBA", "Graderías"],
    },
    {
      id: 14,
      nombre: "Club Obras",
      ubicacion: "Núñez, CABA",
      rating: 4.9,
      precio: 13000,
      imagen: "https://via.placeholder.com/400x250/f97316/ffffff?text=Basket",
      caracteristicas: ["Profesional", "Aire acondicionado", "Vestuarios"],
    },
    {
      id: 15,
      nombre: "Sport Complex",
      ubicacion: "Villa Crespo, CABA",
      rating: 4.5,
      precio: 9000,
      imagen: "https://via.placeholder.com/400x250/f97316/ffffff?text=Basket",
      caracteristicas: ["2 canchas", "Estacionamiento", "Buffet"],
    },
    {
      id: 16,
      nombre: "Basket Pro",
      ubicacion: "Palermo, CABA",
      rating: 4.7,
      precio: 10500,
      imagen: "https://via.placeholder.com/400x250/f97316/ffffff?text=Basket",
      caracteristicas: ["Piso de parquet", "Iluminación LED", "Wi-Fi"],
    },
  ],
  handball: [
    {
      id: 17,
      nombre: "Handball Center",
      ubicacion: "Caballito, CABA",
      rating: 4.6,
      precio: 9500,
      imagen: "https://via.placeholder.com/400x250/ef4444/ffffff?text=Handball",
      caracteristicas: ["Indoor", "Piso reglamentario", "Vestuarios"],
    },
    {
      id: 18,
      nombre: "Club Ferro",
      ubicacion: "Caballito, CABA",
      rating: 4.8,
      precio: 11500,
      imagen: "https://via.placeholder.com/400x250/ef4444/ffffff?text=Handball",
      caracteristicas: ["Profesional", "Graderías", "Buffet"],
    },
    {
      id: 19,
      nombre: "Sport Handball",
      ubicacion: "Flores, CABA",
      rating: 4.4,
      precio: 8000,
      imagen: "https://via.placeholder.com/400x250/ef4444/ffffff?text=Handball",
      caracteristicas: ["2 canchas", "Estacionamiento", "Parrilla"],
    },
    {
      id: 20,
      nombre: "Handball Pro Club",
      ubicacion: "Villa Devoto, CABA",
      rating: 4.7,
      precio: 10000,
      imagen: "https://via.placeholder.com/400x250/ef4444/ffffff?text=Handball",
      caracteristicas: ["Climatizado", "Bar", "Wi-Fi"],
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
  // Obtener canchas por deporte
  getCanchasPorDeporte: async (deporte) => {
    await delay(300);
    return canchasData[deporte.toLowerCase()] || [];
  },

  // Obtener todas las canchas
  getTodasCanchas: async () => {
    await delay(400);
    return Object.values(canchasData).flat();
  },

  // Obtener cancha por ID
  getCanchaById: async (id) => {
    await delay(200);
    const todasCanchas = Object.values(canchasData).flat();
    return todasCanchas.find(c => c.id === id);
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
  futbol: { 
    icon: 'football', 
    color: '#10b981',
    gradientColors: ['#059669', '#10b981']
  },
  padel: { 
    icon: 'tennisball', 
    color: '#3b82f6',
    gradientColors: ['#2563eb', '#3b82f6']
  },
  tenis: { 
    icon: 'tennisball', 
    color: '#eab308',
    gradientColors: ['#ca8a04', '#eab308']
  },
  basket: { 
    icon: 'basketball', 
    color: '#f97316',
    gradientColors: ['#ea580c', '#f97316']
  },
  handball: { 
    icon: 'baseball', 
    color: '#ef4444',
    gradientColors: ['#dc2626', '#ef4444']
  },
};
