# Sistema de Gestión de Canchas y Reservas - TurnosBJ

## 🎯 Sistema Implementado

### Sistema de Autenticación Dual
- **AuthModalNew.js**: Modal con tabs **Login** y **Registro**
  - Login: Email + Contraseña (funciona para ambos tipos)
  - Registro: Selector Usuario/Cancha con formularios específicos
    - **Usuario**: Nombre completo, Año nacimiento, Email, Contraseña
    - **Cancha**: Nombre cancha, Dirección, Email, Contraseña, Precio/hora, Descripción

### Vistas Diferenciadas por Tipo de Usuario

#### Para USUARIOS (tipo_usuario = 'usuario'):
- Ven **HomeContent** y **Home** (búsqueda de canchas)
- Solo ven canchas con `visible = TRUE`
- Pueden reservar turnos disponibles
- MainBar: icono usuario abre AuthModal, settings deshabilitado

#### Para CANCHAS (tipo_usuario = 'local'):
- **LocalDashboard**: Panel exclusivo que muestra:
  - Header con nombre de la cancha y estadísticas (Total turnos, Total reservas)
  - Banner de visibilidad (Verde si visible, Naranja si oculto)
  - Lista de turnos agrupados por día con colores distintos
  - Para cada turno:
    - Horario (inicio - fin)
    - Toggle Habilitado/Deshabilitado
    - Máx. integrantes (si está configurado)
    - Estado: **Turno libre** o **Reservado por: [nombre usuario]**
    - Botón eliminar
- **SettingsModal** (botón settings en MainBar):
  - Tab **Info**: Nombre, Dirección, Descripción, Deportes, Precio
    - **Toggle de Visibilidad**: Botón "Mostrar/Ocultar" para que aparezcan en búsqueda de usuarios
  - Tab **Fotos**: Subir/Eliminar fotos (máx 5)
  - Tab **Turnos**: Crear y gestionar horarios
    - Selector de día (7 botones de días)
    - Hora inicio / Hora fin (formato HH:MM)
    - **Máx. Integrantes**: Ej. 10 para Futbol 5, 14 para Futbol 7
    - Botón Agregar
    - Lista de turnos creados con switch habilitado/deshabilitado y botón eliminar
- **Oculta** HomeContent y Home (no ven búsqueda de canchas)

### Backend Implementado

#### Endpoints de Autenticación
- `POST /api/auth/login` - Login universal por email
- `POST /api/auth/register/usuario` - Registro usuarios
- `POST /api/auth/register/local` - Registro canchas
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Datos del usuario actual

#### Endpoints para Canchas (requiere auth local)
- `PUT /api/local/info` - Actualizar datos (nombre, dirección, etc.)
- `POST /api/local/fotos` - Subir fotos (FormData, máx 5)
- `DELETE /api/local/fotos` - Eliminar foto
- `GET /api/local/horarios` - Obtener todos los turnos
- `POST /api/local/horarios` - Crear turno (dia, hora_inicio, hora_fin, **max_integrantes**)
- `PUT /api/local/horarios/:id/toggle` - Habilitar/Deshabilitar turno
- `DELETE /api/local/horarios/:id` - Eliminar turno
- `PUT /api/local/visibilidad` - Toggle visible (true/false)
- `GET /api/local/reservas` - Ver todas las reservas de la cancha

#### Endpoints para Usuarios
- `GET /api/canchas` - Listar canchas **WHERE visible = TRUE**

### Base de Datos

#### Tablas Actualizadas
- **locales**: 
  - Campo `visible` TINYINT(1) DEFAULT 0 (ya existe)
  
- **horarios_disponibles**: 
  - Campo `max_integrantes` INT NULL (agregado)
  - Estructura: id, local_id, dia (ENUM Lunes-Domingo), hora_inicio, hora_fin, max_integrantes, disponible

- **reservas**:
  - Campo `horario_id` INT FK to horarios_disponibles
  - Campo `fecha_reserva` DATE
  - Estructura: id, usuario_id, local_id, horario_id, fecha_reserva, estado, created_at

#### Migración Pendiente
Ejecutar: `database/migration_max_integrantes_reservas.sql`

```sql
-- Agrega max_integrantes a horarios_disponibles
-- Agrega horario_id y fecha_reserva a reservas
-- Crea índices necesarios
```

## 🚀 Cómo Usar

### Como Cancha:
1. Registrarse como "Cancha" en la app
2. Login con email/contraseña
3. Se abre automáticamente **LocalDashboard**
4. Ir a **Settings** (icono engranaje):
   - Completar información (Tab Info)
   - Subir fotos (Tab Fotos)
   - **Crear turnos** (Tab Turnos):
     - Seleccionar día
     - Ingresar hora inicio/fin (ej: 09:00 - 11:00)
     - **Definir máx. integrantes** (ej: 10 para F5, 14 para F7)
     - Agregar
   - **Activar visibilidad**: Toggle "Mostrar cancha" en Tab Info
5. Volver a Dashboard para ver turnos y reservas en tiempo real

### Como Usuario:
1. Registrarse como "Usuario" en la app
2. Login con email/contraseña
3. Ver canchas disponibles (solo las con `visible = TRUE`)
4. Reservar turnos libres
5. Ver mis reservas

## 📁 Archivos Creados/Modificados

### Nuevos Componentes
- `components/AuthModalNew.js` - Modal de autenticación con tabs
- `components/LocalDashboard.js` - Dashboard exclusivo para canchas
- `database/migration_max_integrantes_reservas.sql` - Migración DB

### Modificados
- `App.js` - Renderizado condicional según tipo de usuario
- `components/SettingsModal.js` - Agregado campo max_integrantes
- `server/server.js` - Endpoints de gestión y filtro de visibilidad

## ✅ Características Completas

- ✅ Login unificado por email (detecta automáticamente si es usuario o cancha)
- ✅ Registro con selector Usuario/Cancha
- ✅ Canchas ven solo su dashboard (no búsqueda)
- ✅ Usuarios ven solo canchas visibles
- ✅ Toggle de visibilidad para canchas
- ✅ Creación de turnos con horarios personalizados (HH:MM)
- ✅ Campo **max_integrantes** configurable por turno
- ✅ Toggle habilitar/deshabilitar turnos
- ✅ Ver reservas en tiempo real por turno
- ✅ Gestión completa de fotos
- ✅ Backend con validaciones de formato de hora
- ✅ Filtrado automático de canchas visibles

## 🔄 Próximos Pasos

1. **Ejecutar migración SQL**:
   ```bash
   mysql -u root -p turnosbj < database/migration_max_integrantes_reservas.sql
   ```

2. **Implementar sistema de reservas desde usuarios**:
   - Endpoint `POST /api/reservas` (usuario reserva turno)
   - Botón "Reservar" en HomeContent
   - Vista "Mis Reservas" para usuarios

3. **Reiniciar servidor backend**:
   ```bash
   cd server
   npm start
   ```

4. **Probar flujo completo**:
   - Crear cuenta como cancha
   - Configurar turnos con max_integrantes
   - Activar visibilidad
   - Login como usuario
   - Ver cancha en búsqueda
   - Reservar turno

## 🎨 Colores por Día (LocalDashboard)
- Lunes: Azul (#3b82f6)
- Martes: Púrpura (#8b5cf6)
- Miércoles: Verde (#10b981)
- Jueves: Naranja (#f59e0b)
- Viernes: Rojo (#ef4444)
- Sábado: Cyan (#06b6d4)
- Domingo: Rosa (#ec4899)

## 🔐 Autenticación
- JWT con expiración 30 días
- Token almacenado en localStorage (web) / AsyncStorage (móvil)
- Middleware `authenticateToken` valida todas las rutas protegidas
