# 🏟️ SISTEMA DE CANCHAS - CAMBIOS IMPLEMENTADOS

## 📋 Resumen de Cambios

Se rediseñó completamente el sistema de configuración y visualización de canchas para mejorar la experiencia de usuario y asegurar que solo aparezcan canchas correctamente configuradas.

---

## 🔄 Cambios Principales

### 1. **Sección "Canchas" (HomeContent.js)**
   - ✅ **Renombrado**: "Clasificación de Canchas" → **"Canchas"**
   - ✅ **Icono**: Cambió de trofeo a balón de fútbol
   - ✅ **Funcionalidad**: Filtra canchas por deporte seleccionado
   - ✅ **Visibilidad**: Solo muestra canchas con `visible = TRUE`

### 2. **Configuración de Cancha - Tab "Info" (SettingsModal.js)**

#### Antes:
- Campo de texto libre para deportes (separados por coma)
- Campo "Descripción" (opcional)
- Sin validación

#### Ahora:
- ✅ **Nombre de la Cancha** (obligatorio)
- ✅ **Dirección/Ubicación** (obligatorio)
- ✅ **Precio por Hora** (obligatorio, debe ser > 0)
- ✅ **Deportes Disponibles** (selección múltiple, mínimo 1)
  - Grid con tarjetas de deportes
  - Muestra duración y máximo de jugadores
  - Checkbox visual con color por deporte
  - Validación: No se puede guardar sin deportes

#### Deportes Disponibles:
| Deporte | Duración | Máx. Jugadores | Color |
|---------|----------|----------------|-------|
| Futbol 5 | 60 min | 10 | Verde |
| Futbol 7 | 90 min | 14 | Azul |
| Futbol 11 | 90 min | 22 | Naranja |
| Padel | 90 min | 4 | Morado |
| Tenis | 60 min | 2 | Rojo |
| Basquet | 60 min | 10 | Rojo Oscuro |
| Voley | 60 min | 12 | Cian |

### 3. **Configuración de Turnos - Tab "Turnos" (SettingsModal.js)**

#### Antes:
- Mostraba todos los deportes disponibles

#### Ahora:
- ✅ **Solo muestra deportes configurados** en el tab Info
- ✅ **Estado vacío**: Si no hay deportes configurados, muestra mensaje y botón para ir a Info
- ✅ **Selector de deporte**: Solo los deportes que el usuario eligió
- ✅ **Cálculo automático**: Hora de fin según duración del deporte
- ✅ **Máximo de integrantes**: Pre-llenado según el deporte

### 4. **Validaciones Backend (server.js)**

#### Endpoint: `PUT /api/local/info`

**Validaciones agregadas:**
```javascript
✅ Nombre no vacío
✅ Dirección no vacía
✅ Precio > 0
✅ Deportes: array con al menos 1 elemento
✅ Formato JSON válido para deportes
```

**Respuestas de error:**
- `400`: Datos inválidos (campo vacío, sin deportes, etc.)
- `403`: Usuario no es tipo "local"
- `404`: Local no encontrado
- `500`: Error del servidor

### 5. **Base de Datos**

#### Migración de Datos
Se creó script SQL: `database/fix_deportes.sql`

**Formato anterior (incorrecto):**
```json
["futbol,tenis"]
["basquet,voley,handball"]
```

**Formato nuevo (correcto):**
```json
["Futbol 5", "Tenis"]
["Basquet", "Voley"]
```

#### Para ejecutar la migración:
**Opción 1 - Desde MySQL Workbench:**
```sql
SOURCE C:/Users/Usuario/TURNOSNUEVO/database/fix_deportes.sql;
```

**Opción 2 - Desde línea de comandos:**
```bash
mysql -u root -p turnosbj < database/fix_deportes.sql
```

**Opción 3 - Script batch (Windows):**
```cmd
cd database
run_fix_deportes.bat
```

---

## 🎯 Flujo de Usuario

### Para CANCHAS (usuarios tipo "local"):

1. **Login** como cancha
2. **Configurar Info** (obligatorio):
   - Nombre de la cancha
   - Dirección
   - Precio por hora
   - **Seleccionar deportes** (mínimo 1)
   - Guardar cambios
3. **Configurar Turnos**:
   - Seleccionar deporte (solo los configurados)
   - Elegir días de la semana
   - Definir hora de inicio
   - Ajustar máximo de jugadores
   - Crear turnos
4. **Activar Visibilidad**:
   - Switch "Cancha Visible"
   - La cancha ahora aparece en búsquedas

### Para USUARIOS (tipo "usuario"):

1. **Login** como usuario
2. **Ir a sección "Canchas"**
3. **Filtrar por deporte**:
   - Canchas Favoritas
   - Futbol 5
   - Futbol 7
   - Padel
   - Tenis
   - Basquet
   - Voley
4. **Solo verán**:
   - Canchas con `visible = TRUE`
   - Canchas que tengan el deporte seleccionado
   - Ordenadas por rating

---

## 🔍 Cómo Funciona el Filtrado

### Backend (server.js - GET /api/canchas):

```javascript
// Query base
WHERE l.visible = TRUE

// Si se selecciona un deporte
AND JSON_CONTAINS(l.deportes, '"Futbol 5"')

// Ordenamiento
ORDER BY l.rating DESC, l.created_at DESC
```

### Frontend (HomeContent.js):

```javascript
// Al cambiar deporte
useEffect(() => {
  cargarCanchas();
}, [deporteSeleccionado]);

// Llamada a API
const canchasData = await canchasService.getCanchasPorDeporte('Futbol 5');
```

---

## ✅ Checklist de Pruebas

### Fase 1: Configuración de Cancha
- [ ] Login como cancha (email: FACUNDO, password: tu_password)
- [ ] Abrir modal de configuración (ícono de engranaje)
- [ ] Tab "Info":
  - [ ] Ingresar nombre: "Mi Cancha Test"
  - [ ] Ingresar dirección: "Av. Test 123"
  - [ ] Ingresar precio: 5000
  - [ ] Seleccionar deportes: Futbol 5, Tenis
  - [ ] Intentar guardar sin deportes → debe mostrar error
  - [ ] Guardar con deportes → debe funcionar

### Fase 2: Configuración de Turnos
- [ ] Tab "Turnos":
  - [ ] Verificar que solo aparecen Futbol 5 y Tenis
  - [ ] Seleccionar Futbol 5
  - [ ] Elegir días: Lunes, Miércoles, Viernes
  - [ ] Hora inicio: 9:00 AM
  - [ ] Verificar hora fin: 10:00 (60 min automático)
  - [ ] Crear turnos
  - [ ] Verificar que aparecen en la lista

### Fase 3: Visibilidad
- [ ] Tab "Info":
  - [ ] Activar switch "Cancha Visible"
  - [ ] Verificar mensaje de éxito

### Fase 4: Verificación como Usuario
- [ ] Logout de la cancha
- [ ] Login como usuario (email: ALAVEZ o BRUNOPELOTA)
- [ ] Ir a sección "Canchas"
- [ ] Filtrar por "Futbol 5"
  - [ ] Debe aparecer "Mi Cancha Test"
- [ ] Filtrar por "Padel"
  - [ ] NO debe aparecer "Mi Cancha Test"
- [ ] Filtrar por "Tenis"
  - [ ] Debe aparecer "Mi Cancha Test"

---

## 🐛 Problemas Conocidos y Soluciones

### Problema: Cancha no aparece después de activar visibilidad
**Solución:**
1. Verificar que la cancha tenga al menos un deporte configurado
2. Hacer pull-to-refresh en la lista de canchas
3. Verificar que el deporte seleccionado coincida con los configurados

### Problema: No se puede guardar configuración (403 Forbidden)
**Solución:**
1. Cerrar sesión completamente
2. Volver a iniciar sesión con cuenta de tipo "local"
3. Verificar en consola que el token tiene `tipo_usuario: "local"`

### Problema: Al crear turnos, no calcula bien la hora de fin
**Solución:**
Verificar que el deporte esté en la lista de `DEPORTES_CONFIG` con duración correcta.

---

## 📊 Estructura de Datos

### Tabla `locales` (campo deportes):
```sql
-- Tipo: JSON
-- Ejemplo válido:
["Futbol 5", "Tenis", "Basquet"]

-- Ejemplo inválido (NO usar):
["futbol,tenis"]
"Futbol 5, Tenis"
```

### Ejemplo de Local Completo:
```json
{
  "id": 15,
  "nombre": "Cancha El Crack",
  "direccion": "Girado 1234",
  "precio_hora": 1500,
  "deportes": ["Futbol 5", "Futbol 7", "Tenis"],
  "visible": true,
  "fotos": []
}
```

---

## 🚀 Próximos Pasos

1. Ejecutar migración de base de datos
2. Probar flujo completo con cuenta de cancha
3. Verificar filtrado desde cuenta de usuario
4. Opcional: Agregar más deportes si es necesario

---

## 📞 Soporte

Si encuentras algún problema:
1. Verificar logs en consola del navegador (F12)
2. Verificar logs del servidor
3. Verificar que la base de datos tenga formato JSON correcto

**Logs importantes a revisar:**
```javascript
// Frontend
🔑 Token desde localStorage
📤 Enviando actualización de info
📦 Datos: { deportes: [...] }
📡 Respuesta: 200

// Backend
Información actualizada exitosamente
{ deportes: ["Futbol 5", "Tenis"] }
```
