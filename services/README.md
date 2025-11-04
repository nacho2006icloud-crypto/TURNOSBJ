# Backend Mock - Sistema de Turnos y Canchas

Este archivo documenta el backend simulado implementado en `services/dataService.js`.

## 📋 Estructura de Datos

### 1. Turnos
Representa las reservas de turnos del usuario.

```javascript
{
  id: number,
  cancha: string,        // Nombre de la cancha
  deporte: string,       // Futbol, Padel, Tenis, Basket, Handball
  fecha: string,         // Formato: "YYYY-MM-DD"
  hora: string,          // Formato: "HH:MM"
  duracion: string,      // Ej: "90 min"
  ubicacion: string,     // Dirección de la cancha
  precio: number         // Precio en pesos
}
```

### 2. Canchas
Listado de canchas disponibles por deporte.

```javascript
{
  id: number,
  nombre: string,
  ubicacion: string,
  rating: number,               // De 0 a 5
  precio: number,               // Precio por hora
  imagen: string,               // URL de la imagen
  caracteristicas: string[]     // Ej: ["Césped sintético", "Iluminación LED"]
}
```

### 3. Jugadores GOATS
Top de mejores jugadores con sistema de votación.

```javascript
{
  id: number,
  nombre: string,
  deporte: string,
  puntos: number,               // Puntuación acumulada
  partidosJugados: number,
  avatar: string,               // URL del avatar
  posicion: number,             // Ranking actual
  nivel: string                 // Legendario, Maestro, Experto, Avanzado
}
```

## 🔧 Servicios Disponibles

### turnosService

#### `getTurnosUsuario()`
Obtiene todos los turnos del usuario.
- **Returns:** `Promise<Array<Turno>>`

#### `getProximoTurno()`
Obtiene el próximo turno agendado.
- **Returns:** `Promise<Turno | null>`

#### `cancelarTurno(turnoId)`
Cancela un turno específico.
- **Params:** `turnoId: number`
- **Returns:** `Promise<{ success: boolean, error?: string }>`

### canchasService

#### `getCanchasPorDeporte(deporte)`
Obtiene las canchas disponibles para un deporte específico.
- **Params:** `deporte: string` (futbol, padel, tenis, basket, handball)
- **Returns:** `Promise<Array<Cancha>>`

#### `getTodasCanchas()`
Obtiene todas las canchas sin filtrar por deporte.
- **Returns:** `Promise<Array<Cancha>>`

#### `getCanchaById(id)`
Obtiene una cancha por su ID.
- **Params:** `id: number`
- **Returns:** `Promise<Cancha | undefined>`

### goatsService

#### `getTopJugadores(limit)`
Obtiene el top de jugadores ordenados por puntos.
- **Params:** `limit: number` (default: 10)
- **Returns:** `Promise<Array<Jugador>>`

#### `votarJugador(jugadorId, puntos)`
Incrementa los puntos de un jugador (sistema de votación).
- **Params:** 
  - `jugadorId: number`
  - `puntos: number` (default: 10)
- **Returns:** `Promise<{ success: boolean, jugador?: Jugador, error?: string }>`

#### `getJugadorById(id)`
Obtiene un jugador por su ID.
- **Params:** `id: number`
- **Returns:** `Promise<Jugador | undefined>`

## 🎨 Configuración de Deportes

El objeto `deportesConfig` contiene la configuración visual para cada deporte:

```javascript
{
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
  // ... más deportes
}
```

## 🚀 Uso en Componentes

### Ejemplo: Cargar próximo turno

```javascript
import { turnosService } from '../services/dataService';

const [proximoTurno, setProximoTurno] = useState(null);

useEffect(() => {
  const cargarTurno = async () => {
    const turno = await turnosService.getProximoTurno();
    setProximoTurno(turno);
  };
  cargarTurno();
}, []);
```

### Ejemplo: Filtrar canchas por deporte

```javascript
import { canchasService } from '../services/dataService';

const [canchas, setCanchas] = useState([]);

const cargarCanchas = async (deporte) => {
  const data = await canchasService.getCanchasPorDeporte(deporte);
  setCanchas(data);
};
```

### Ejemplo: Votar jugador

```javascript
import { goatsService } from '../services/dataService';

const votarJugador = async (jugadorId) => {
  const result = await goatsService.votarJugador(jugadorId, 10);
  if (result.success) {
    console.log('Voto registrado:', result.jugador);
    // Actualizar lista de jugadores
  }
};
```

## 📦 Datos Incluidos

- **1 turno** agendado de ejemplo
- **20 canchas** distribuidas en 5 deportes (4 por deporte)
- **10 jugadores** en el ranking GOATS
- **5 deportes** configurados: Futbol, Padel, Tenis, Basket, Handball

## 🔄 Simulación de Red

Todos los servicios incluyen un delay simulado (200-400ms) para emular latencia de red real usando:

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
```

## 🎯 Próximos Pasos

Para conectar con un backend real:

1. Reemplazar las funciones mock con llamadas a API REST
2. Implementar manejo de errores robusto
3. Agregar autenticación de usuario
4. Implementar caché de datos
5. Agregar paginación para listas grandes

## 📝 Notas

- Los datos son volátiles y se reinician al recargar la app
- Para producción, implementar persistencia con AsyncStorage o backend real
- El sistema de votación actualiza automáticamente el ranking
