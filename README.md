# TurnosBJ - Sistema de Reservas de Canchas

Sistema completo de reservas de canchas deportivas con frontend React Native/Expo y backend Node.js + MySQL.

## 🚀 Características

### Frontend
- **Formulario dinámico de autenticación** usando el estilo del MainBar
- **Registro dual**: Usuario o Local/Cancha
- **Cards de canchas** con ratio 1:1 y diseño responsive
- **Selector de deportes** con opción de favoritas
- **Scroll vertical** para lista de canchas
- **Interfaz glassmorphism** moderna

### Backend
- **Autenticación completa** con bcrypt y JWT
- **Base de datos MySQL** con tablas relacionales
- **Upload de múltiples imágenes** para canchas
- **Geolocalización** para locales
- **API RESTful** completa

## 📋 Requisitos Previos

- Node.js 16+ y npm
- MySQL 8.0+
- Expo CLI
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/TURNOSBJ.git
cd TURNOSBJ
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd server
npm install
cd ..
```

### 4. Configurar la base de datos

#### Crear base de datos MySQL:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE turnosbj CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

#### Ejecutar script de inicialización:
```bash
mysql -u root -p turnosbj < database/init.sql
```

### 5. Configurar variables de entorno

Crear archivo `server/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=turnosbj
JWT_SECRET=turnosbj_secret_key_2024_super_secure
PORT=3000
```

## 🚀 Uso

### 1. Iniciar el servidor backend
```bash
cd server
npm start
```
El servidor estará disponible en `http://localhost:3000`

### 2. Iniciar la aplicación frontend
```bash
# En otra terminal, desde la raíz del proyecto
npm start
```

### 3. Acceder a la aplicación
- **Web**: Se abrirá automáticamente en el navegador
- **Mobile**: Escanear el código QR con Expo Go
- **Emulador**: Presionar 'a' para Android o 'i' para iOS

## 🔧 Funcionalidades

### Autenticación
1. **Tocar el icono de usuario** en el MainBar
2. **Elegir tipo de cuenta**:
   - Usuario: Nombre, año nacimiento, email, contraseña
   - Local/Cancha: Email, contraseña, fotos, ubicación
3. **Login funcional** con validación backend

### Canchas
- **Vista en grid** responsive con ratio 1:1
- **Scroll vertical** cuando hay muchas canchas
- **Filtros por deporte** con opción de favoritas
- **Información completa**: precio, rating, ubicación

### Backend API

#### Endpoints de Autenticación
- `POST /api/auth/register/usuario` - Registro de usuario
- `POST /api/auth/register/local` - Registro de local (con upload de fotos)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

#### Endpoints de Canchas
- `GET /api/canchas` - Obtener canchas
- `GET /api/canchas?deporte=futbol` - Filtrar por deporte

## 🗂️ Estructura del Proyecto

```
TURNOSBJ/
├── components/
│   ├── AuthModal.js      # Formulario dinámico de auth
│   ├── MainBar.js        # Barra principal con estilo glass
│   ├── HomeContent.js    # Cards de canchas responsive
│   └── ...
├── server/
│   ├── server.js         # Servidor Express + MySQL
│   ├── package.json      # Dependencias del backend
│   └── .env              # Variables de entorno
├── services/
│   └── authService.js    # Cliente API para auth
├── database/
│   └── init.sql          # Script de inicialización DB
└── package.json          # Dependencias del frontend
```

## 🔒 Seguridad

- **Contraseñas hasheadas** con bcrypt (12 rounds)
- **JWT tokens** con expiración de 30 días
- **Sesiones en base de datos** para control de acceso
- **Validación de inputs** en frontend y backend
- **CORS configurado** para desarrollo

## 🎨 Diseño

### Estilo MainBar
- **Glassmorphism effect** con BlurView
- **Gradientes lineales** para botones principales
- **Animaciones suaves** con activeOpacity
- **Safe area** compatible con notch

### Cards Responsive
- **Ratio 1:1** para todas las cards
- **Grid adaptativo** según ancho de pantalla
- **Scroll vertical** nativo optimizado
- **Estados de carga** y vacío

## 📱 Compatibilidad

- **iOS** 12+
- **Android** API 21+
- **Web** (navegadores modernos)
- **Responsive design** automático

## 🐛 Resolución de Problemas

### Error de conexión MySQL
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Revisar configuración en server/.env
```

### Error de permisos
```bash
# En Windows PowerShell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# O usar cmd en lugar de PowerShell
cmd /c "npm install"
```

### Problemas con Expo
```bash
# Limpiar cache
expo start -c

# Reinstalar Expo CLI
npm install -g @expo/cli@latest
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico, crear un issue en GitHub o contactar al equipo de desarrollo.