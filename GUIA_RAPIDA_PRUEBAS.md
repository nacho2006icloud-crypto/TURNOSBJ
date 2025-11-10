# 🎯 GUÍA RÁPIDA - PRUEBA DEL SISTEMA DE CANCHAS

## ⚡ Pasos Rápidos para Probar

### 1️⃣ PREPARACIÓN (Solo primera vez)

**Migrar base de datos:**
```bash
# Opción A: MySQL Workbench
# 1. Abrir MySQL Workbench
# 2. Conectar a la base de datos turnosbj
# 3. File > Run SQL Script
# 4. Seleccionar: C:\Users\Usuario\TURNOSNUEVO\database\fix_deportes.sql
# 5. Ejecutar

# Opción B: Línea de comandos
mysql -u root -p turnosbj < C:\Users\Usuario\TURNOSNUEVO\database\fix_deportes.sql
```

### 2️⃣ INICIAR SERVIDORES

**Terminal 1 - Backend:**
```bash
cd C:\Users\Usuario\TURNOSNUEVO\server
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\Usuario\TURNOSNUEVO
npm start
```

### 3️⃣ CONFIGURAR CANCHA (Como Local)

**Login:**
- Email: `FACUNDO`
- Password: (tu password)
- Tipo: Local/Cancha

**Configuración (Ícono ⚙️):**

**Tab "Info":**
1. Nombre: `Cancha El Crack`
2. Dirección: `Girado 1234, CABA`
3. Precio: `5000`
4. Deportes: Seleccionar **Futbol 5** y **Tenis** (click en las tarjetas)
5. Click **"Guardar Cambios"** ✅

**Tab "Turnos":**
1. Verificar que solo aparecen Futbol 5 y Tenis
2. Seleccionar **Futbol 5**
3. Días: Click en **Lunes**, **Miércoles**, **Viernes**
4. Hora: **9:00 AM**
5. Jugadores: **10** (ya viene por defecto)
6. Click **"Crear 3 Turno(s)"** ✅

**Tab "Info" (de nuevo):**
1. Activar el switch **"Cancha Visible"** 🟢
2. Confirmar mensaje de éxito

### 4️⃣ VERIFICAR COMO USUARIO

**Logout** de la cancha (menú superior → Logout)

**Login como usuario:**
- Email: `ALAVEZ` o `BRUNOPELOTA`
- Password: (tu password)
- Tipo: Usuario

**Ir a sección "Canchas":**
1. Scroll hacia abajo hasta la sección "Canchas"
2. Click en **"Futbol 5"**
   - ✅ Debe aparecer: "Cancha El Crack"
3. Click en **"Padel"**
   - ❌ NO debe aparecer: "Cancha El Crack"
4. Click en **"Tenis"**
   - ✅ Debe aparecer: "Cancha El Crack"

---

## 🔍 Verificaciones Rápidas

### ✅ Checklist de Funcionalidad

**Como Cancha:**
- [ ] No puedo guardar sin deportes seleccionados
- [ ] Solo veo deportes seleccionados en tab "Turnos"
- [ ] Puedo crear turnos múltiples (varios días a la vez)
- [ ] La hora de fin se calcula automáticamente
- [ ] El máximo de jugadores se ajusta según el deporte
- [ ] Puedo activar/desactivar la visibilidad

**Como Usuario:**
- [ ] Solo veo la sección "Canchas" (no "Clasificación de Canchas")
- [ ] Las canchas se filtran correctamente por deporte
- [ ] Solo veo canchas con visibilidad activa
- [ ] Puedo hacer pull-to-refresh para actualizar

---

## 🐛 Solución de Problemas Comunes

### ❌ Error 403 al guardar
**Solución:**
```javascript
// 1. Abrir consola (F12)
// 2. Ejecutar:
localStorage.getItem('auth_token')

// Si es null:
// - Hacer logout
// - Volver a hacer login
```

### ❌ Cancha no aparece en búsqueda
**Verificar:**
1. ¿La cancha está visible? (switch verde en configuración)
2. ¿Tiene el deporte seleccionado?
3. ¿Hiciste pull-to-refresh?
4. Consola del navegador (F12) → Network → ver llamadas a `/api/canchas`

### ❌ No puedo crear turnos
**Verificar:**
1. ¿Configuraste deportes primero en tab "Info"?
2. Si no aparece el tab "Turnos", ir primero a "Info" y seleccionar deportes

### ❌ Base de datos con datos viejos
**Ejecutar migración:**
```sql
-- En MySQL Workbench:
SOURCE C:/Users/Usuario/TURNOSNUEVO/database/fix_deportes.sql;

-- Verificar:
SELECT id, nombre, deportes FROM locales WHERE id = 15;
```

---

## 📊 Datos de Prueba

### Usuarios de Prueba

| Email | Password | Tipo | Descripción |
|-------|----------|------|-------------|
| FACUNDO | (tu_pass) | Local | Cancha configurada |
| ALAVEZ | (tu_pass) | Usuario | Para ver canchas |
| BRUNOPELOTA | (tu_pass) | Usuario | Para ver canchas |

### Cancha de Prueba (ID 15)

```json
{
  "nombre": "NA",
  "direccion": "Girado",
  "precio_hora": 1500,
  "deportes": [],
  "visible": true
}
```

**Después de configurar debe quedar:**
```json
{
  "nombre": "Cancha El Crack",
  "direccion": "Girado 1234, CABA",
  "precio_hora": 5000,
  "deportes": ["Futbol 5", "Tenis"],
  "visible": true
}
```

---

## 🎨 Características Visuales

### Tab Info - Grid de Deportes

Cada deporte muestra:
- ✅ Checkbox (marcado si está seleccionado)
- 🎨 Color distintivo por deporte
- ⏱️ Duración en minutos
- 👥 Máximo de jugadores

**Ejemplo:**
```
┌─────────────────┐  ┌─────────────────┐
│ ✓ Futbol 5      │  │ □ Futbol 7      │
│ 60 min · 10     │  │ 90 min · 14     │
└─────────────────┘  └─────────────────┘
```

### Tab Turnos - Estado Vacío

Si no hay deportes configurados:
```
🔔 Configura tus deportes primero

Debes seleccionar los deportes disponibles en tu
cancha desde la pestaña "Info" antes de crear turnos.

[ ⚙️ Ir a Configuración ]
```

---

## 📱 Capturas de Pantalla Esperadas

### Como Cancha - Tab Info
- Grid de deportes con checkbox
- Botón "Guardar Cambios" deshabilitado si no hay deportes
- Warning box naranja si no hay deportes seleccionados
- Switch de visibilidad al final

### Como Cancha - Tab Turnos (con deportes configurados)
- Scroll horizontal de deportes (solo los seleccionados)
- Selector de días con botón "Todos"
- Selector de hora AM/PM
- Info de duración automática
- Lista de turnos agrupados por día

### Como Usuario - Sección Canchas
- Título: "Canchas" (con ícono de balón)
- Botón "Canchas Favoritas" arriba
- Scroll horizontal de deportes
- Lista de canchas filtradas

---

## 🚀 Siguiente Paso

Una vez que todo funcione:
1. Crear más canchas de prueba
2. Configurar diferentes deportes
3. Probar reservas (próxima funcionalidad)

---

## 📞 Logs Importantes

### Frontend (Consola del navegador - F12)

**Al guardar configuración:**
```
🔑 Token desde localStorage: SI (eyJhbGciOiJIUzI1NiIsI...)
📤 Enviando actualización de info...
📦 Datos: {
  nombre: "Cancha El Crack",
  direccion: "Girado 1234, CABA",
  precio_hora: "5000",
  deportes: ["Futbol 5", "Tenis"]
}
📡 Respuesta: 200
✅ Información actualizada correctamente
```

**Al cargar canchas:**
```
Canchas cargadas para Futbol 5 : 1
```

### Backend (Terminal del servidor)

**Al actualizar info:**
```
PUT /api/local/info 200 - 15ms
```

**Al obtener canchas:**
```
GET /api/canchas?deporte=Futbol%205 200 - 8ms
```

---

**¡Listo! 🎉** Si todos los pasos funcionan, el sistema está completamente operativo.
