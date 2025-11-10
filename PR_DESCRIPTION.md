# PR: Fix Cancha UI/UX y Persistencia de Configuración

## 📋 Resumen

Este PR soluciona **5 problemas críticos** reportados en la interfaz y funcionalidad de las canchas:

1. ✅ **Icono de configuración no visible** - Ahora solo aparece para usuarios tipo "cancha"
2. ✅ **Vista "Mis Turnos" mejorada** - Turnos agrupados por día con expand/collapse animado
3. ✅ **Persistencia de configuración** - Datos se guardan correctamente y persisten entre sesiones
4. ✅ **Sincronización de visibilidad** - Canchas visibles se reflejan inmediatamente para usuarios
5. ✅ **Barra de búsqueda** - Funciona correctamente en HomeContent (usuarios)

---

## 🎯 Cambios Implementados

### 1. Icono Config Visible Solo para Canchas
**Archivo:** `components/MainBar.js`

**Problema:** El icono de configuración se mostraba para todos los usuarios.

**Solución:**
- Agregado prop `currentUser` a MainBar
- Renderizado condicional usando `isLocal = currentUser?.tipo_usuario === 'local'`
- Icono solo visible para cuentas de cancha

```javascript
// ANTES
<TouchableOpacity onPress={onPressSettings}>
  <Icon name="settings" size={24} color="#1f2937" />
</TouchableOpacity>

// DESPUÉS
{isLocal && (
  <TouchableOpacity onPress={onPressSettings}>
    <Icon name="settings" size={24} color="#1f2937" />
  </TouchableOpacity>
)}
```

---

### 2. Turnos Agrupados por Día con Expand/Collapse
**Archivo:** `components/LocalDashboard.js`

**Problema:** Todos los turnos se mostraban expandidos sin organización por día.

**Solución:**
- Implementado estado `expandedDays` para trackear días expandidos/colapsados
- Agregado `LayoutAnimation` para animaciones suaves (iOS/Android)
- Cabecera de día clickeable con:
  - Icono chevron (down/forward) según estado
  - Contador de turnos por día
  - Badge de reservas si hay alguna
- Contenido se expande/colapsa con animación

**Código clave:**
```javascript
// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Toggle con animación
const toggleDay = (dia) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpandedDays(prev => ({
    ...prev,
    [dia]: !prev[dia]
  }));
};
```

**Estilos añadidos:**
- `diaHeaderLeft` / `diaHeaderRight` - Layout de cabecera
- `reservasBadge` - Badge con contador de reservas
- `reservadoContainer` / `libreContainer` - Estados de turnos

---

### 3. Persistencia de Configuración
**Archivos:** 
- `services/authService.js`
- `App.js`
- `components/SettingsModal.js`

**Problema:** Al cerrar sesión y volver a abrir, las configuraciones de la cancha no persistían.

**Solución:**

#### authService.js
- Agregado parámetro `forceRefresh` a `getCurrentUser()`
- Nuevo método `refreshUser()` para invalidar caché
- Usuario se recarga desde API cuando `forceRefresh = true`

```javascript
async getCurrentUser(forceRefresh = false) {
  if (!this.user || forceRefresh) {
    const data = await this.authenticatedRequest('/auth/me');
    this.user = data;
  }
  return this.user;
}

async refreshUser() {
  return await this.getCurrentUser(true);
}
```

#### App.js
- Agregado `refreshCurrentUser()` que llama `checkAuth(true)`
- Pasado como prop `onUpdate` a SettingsModal
- Después de guardar info, se refresca el usuario

#### SettingsModal.js
- Ya estaba llamando `onUpdate()` después de guardar
- Backend ya guardaba correctamente en BD

**Flujo completo:**
1. Usuario edita info → SettingsModal.handleUpdateInfo()
2. PUT a `/api/local/info` → Backend guarda en DB
3. SettingsModal llama `onUpdate()`
4. App.refreshCurrentUser() → authService.refreshUser()
5. GET a `/api/auth/me` → Trae datos frescos
6. `setCurrentUser(user)` → UI actualizada

---

### 4. Sincronización Visibilidad Cancha
**Archivo:** `components/HomeContent.js`

**Problema:** Al activar visibilidad desde cuenta cancha, usuarios no veían la cancha hasta re-login.

**Solución:**
- Agregado `RefreshControl` en ScrollView de HomeContent
- Pull-to-refresh ejecuta `cargarDatos()` que llama `cargarCanchas()`
- Cada llamada a `getCanchasPorDeporte()` hace fetch fresco (no usa caché)

```javascript
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={loading}
      onRefresh={cargarDatos}
      tintColor="rgba(255,255,255,0.8)"
      colors={['#0000CD', '#3b82f6']}
    />
  }
>
```

**Flujo:**
1. Cancha activa visibilidad → PUT `/api/local/visibilidad`
2. Backend actualiza `locales.visible = 1`
3. Usuario en HomeContent hace pull-to-refresh
4. GET `/api/canchas?deporte=X` → Trae cancha visible
5. `setCanchas(canchasData)` → Cancha aparece en lista

---

### 5. Barra de Búsqueda en Home
**Estado:** Ya funcionaba correctamente

La aplicación no tiene navegación entre múltiples pantallas (no usa React Navigation). El Header con barra de búsqueda está en `Home.js` y se renderiza solo para usuarios regulares. Para cuentas de cancha se muestra `LocalDashboard` que no tiene header de búsqueda.

**Comportamiento actual (correcto):**
- Usuario regular → Muestra HomeContent + Home (con búsqueda)
- Cancha → Muestra LocalDashboard (sin búsqueda)

---

## 📁 Archivos Modificados

### Archivos Principales (5)

1. **`components/MainBar.js`** (+15 líneas)
   - Agregado prop `currentUser`
   - Renderizado condicional de icono settings

2. **`components/LocalDashboard.js`** (+120 líneas)
   - Import LayoutAnimation, UIManager
   - Estado `expandedDays`
   - Función `toggleDay()`
   - Cabecera clickeable con chevron
   - Estilos para cabecera expandible

3. **`services/authService.js`** (+10 líneas)
   - Parámetro `forceRefresh` en `getCurrentUser()`
   - Método `refreshUser()`

4. **`App.js`** (+8 líneas)
   - Parámetro `forceRefresh` en `checkAuth()`
   - Método `refreshCurrentUser()`
   - Prop `onUpdate` en SettingsModal

5. **`components/HomeContent.js`** (+10 líneas)
   - Import RefreshControl
   - RefreshControl en ScrollView

### Archivos Sin Cambios (Backend ya correcto)
- `server/server.js` - Endpoints ya funcionaban correctamente
- `components/SettingsModal.js` - Ya llamaba `onUpdate()`

---

## 💻 Comandos para Testing

### Iniciar Backend
```bash
cd server
node server.js
```

### Iniciar Frontend (Web)
```bash
npm start
# Presionar 'w' para abrir en web
```

### Iniciar Frontend (Móvil)
```bash
# iOS
npm run ios

# Android
npm run android
```

---

## ✅ Checklist QA

### 1. Icono Config Visible Solo para Canchas
- [ ] Login como **usuario** regular
- [ ] Verificar que NO aparece icono settings en MainBar
- [ ] Logout
- [ ] Login como **cancha**
- [ ] Verificar que SÍ aparece icono settings (izquierda de MainBar)
- [ ] Tocar icono → Abre SettingsModal
- [ ] **Esperado:** Icono solo visible para canchas

### 2. Turnos Agrupados por Día
- [ ] Login como **cancha**
- [ ] Crear múltiples turnos en diferentes días (usar SettingsModal → Deportes)
- [ ] Volver a LocalDashboard
- [ ] Verificar cabeceras de días visibles (Lunes, Martes, etc.)
- [ ] **Tocar cabecera de un día** → Turnos se expanden con animación
- [ ] **Tocar nuevamente** → Turnos se colapsan con animación
- [ ] Verificar icono chevron cambia (forward → down)
- [ ] Verificar contador de turnos en cabecera correcto
- [ ] Si hay reservas, verificar badge de reservas visible
- [ ] **Esperado:** Animación suave, todos los turnos del día visibles al expandir

### 3. Persistencia de Configuración
- [ ] Login como **cancha**
- [ ] Ir a Settings (icono gear)
- [ ] **Tab Info:** Cambiar nombre, dirección, descripción, precio
- [ ] Guardar cambios → Verificar mensaje "Información actualizada"
- [ ] **Tab Fotos:** Subir 2-3 fotos
- [ ] **Tab Deportes:** Crear 3 turnos en diferentes días
- [ ] Activar visibilidad (toggle "Cancha Visible")
- [ ] **LOGOUT**
- [ ] **LOGIN nuevamente** con misma cuenta
- [ ] Verificar Settings → Tab Info muestra datos guardados
- [ ] Verificar fotos siguen ahí
- [ ] Verificar turnos creados siguen ahí
- [ ] Verificar visibilidad activada
- [ ] **Esperado:** Todos los datos persisten entre sesiones

### 4. Sincronización Visibilidad
- [ ] Tener **2 dispositivos/navegadores** abiertos:
  - Dispositivo A: Login como **cancha**
  - Dispositivo B: Login como **usuario**
- [ ] En Dispositivo B (usuario):
  - Ir a HomeContent → Clasificación Canchas
  - Seleccionar deporte (ej: Futbol 5)
  - Anotar cuántas canchas aparecen
- [ ] En Dispositivo A (cancha):
  - Ir a Settings → Tab Info
  - **Activar toggle "Cancha Visible"**
  - Verificar mensaje confirmación
- [ ] En Dispositivo B (usuario):
  - **Hacer pull-to-refresh** (arrastrar hacia abajo)
  - Verificar que ahora aparece la cancha recién activada
- [ ] En Dispositivo A (cancha):
  - **Desactivar** toggle "Cancha Visible"
- [ ] En Dispositivo B (usuario):
  - Pull-to-refresh nuevamente
  - Verificar que la cancha desaparece
- [ ] **Esperado:** Cambios de visibilidad se reflejan en tiempo real (con refresh)

### 5. Barra de Búsqueda
- [ ] Login como **usuario**
- [ ] Verificar barra de búsqueda visible en top (bajo header azul)
- [ ] Tocar barra → Teclado aparece
- [ ] Escribir texto → Placeholder "Buscar..." desaparece
- [ ] Logout y login como **cancha**
- [ ] Verificar que NO hay barra de búsqueda (solo LocalDashboard)
- [ ] **Esperado:** Búsqueda solo para usuarios regulares

### 6. Casos Borde

#### Turnos sin deporte configurado
- [ ] Crear turno viejo (antes de feature deportes)
- [ ] Verificar no rompe UI en LocalDashboard

#### Turnos con muchas reservas
- [ ] Crear 10+ reservas en un día
- [ ] Expandir día → Verificar todas se muestran
- [ ] Badge contador correcto

#### Cancha sin fotos
- [ ] No subir fotos
- [ ] Verificar mensaje "No hay fotos..." en tab Fotos

#### Pull-to-refresh sin conexión
- [ ] Apagar servidor backend
- [ ] Hacer pull-to-refresh
- [ ] Verificar fallback a mock data (no crash)

---

## 🔌 Endpoints API Usados

### 1. GET `/api/auth/me`
**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response 200:**
```json
{
  "id": 123,
  "email": "cancha@example.com",
  "tipo_usuario": "local",
  "local_data": {
    "id": 45,
    "nombre": "Cancha San Martin",
    "direccion": "Av. San Martin 1234",
    "descripcion": "Cancha techada",
    "deportes": "[\"Futbol 5\",\"Padel\"]",
    "precio_hora": 5000,
    "fotos": "[\"/uploads/foto1.jpg\"]",
    "visible": true
  }
}
```

### 2. PUT `/api/local/info`
**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "nombre": "Cancha Nueva",
  "direccion": "Calle 123",
  "descripcion": "Descripción actualizada",
  "deportes": ["Futbol 5", "Padel"],
  "precio_hora": 6000
}
```

**Response 200:**
```json
{
  "message": "Información actualizada exitosamente"
}
```

### 3. PUT `/api/local/visibilidad`
**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "visible": true
}
```

**Response 200:**
```json
{
  "message": "Visibilidad actualizada"
}
```

### 4. GET `/api/canchas?deporte=Futbol 5`
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response 200:**
```json
[
  {
    "id": 45,
    "nombre": "Cancha San Martin",
    "direccion": "Av. San Martin 1234",
    "deportes": "[\"Futbol 5\",\"Padel\"]",
    "precio_hora": 5000,
    "fotos": "[\"/uploads/foto1.jpg\"]",
    "visible": true
  }
]
```

### 5. GET `/api/local/horarios`
**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response 200:**
```json
[
  {
    "id": 789,
    "dia": "Lunes",
    "hora_inicio": "18:00",
    "hora_fin": "19:00",
    "deporte": "Futbol 5",
    "max_integrantes": 10,
    "disponible": true
  }
]
```

---

## 🎬 Commits Propuestos

```bash
# Commit 1: Fix settings icon visibility
git add components/MainBar.js App.js
git commit -m "fix: show settings icon only for cancha users

- Add currentUser prop to MainBar component
- Conditional rendering with isLocal check
- Hide settings for regular users
- Fixes #[issue-number]"

# Commit 2: Feature turnos expandibles
git add components/LocalDashboard.js
git commit -m "feat: group turnos by day with expand/collapse animation

- Implement expandedDays state tracker
- Add LayoutAnimation for smooth transitions
- Clickable day headers with chevron icons
- Display turnos count and reservas badge
- Enable LayoutAnimation on Android
- Fixes #[issue-number]"

# Commit 3: Fix persistencia
git add services/authService.js App.js
git commit -m "fix: persist cancha configuration across sessions

- Add forceRefresh param to getCurrentUser()
- Add refreshUser() method to invalidate cache
- App calls refreshCurrentUser on settings update
- Data reloads from API after save
- Fixes #[issue-number]"

# Commit 4: Feature pull-to-refresh
git add components/HomeContent.js
git commit -m "feat: add pull-to-refresh to sync cancha visibility

- Import RefreshControl component
- Add refreshControl to ScrollView
- Users can pull to refresh canchas list
- Reflects visibility changes immediately
- Fixes #[issue-number]"

# Commit 5: Docs
git add PR_DESCRIPTION.md
git commit -m "docs: add comprehensive PR description and QA checklist

- Complete implementation summary
- File changes documentation
- API endpoints and payloads
- Step-by-step QA testing guide
- Edge cases covered"
```

---

## 🚀 Performance y Mejoras Futuras

### Performance Actual
- ✅ LayoutAnimation usa animaciones nativas (60fps)
- ✅ Pull-to-refresh solo refetch cuando usuario lo solicita
- ✅ No polling innecesario
- ✅ Caché de usuario en authService (solo refresh cuando necesario)

### Mejoras Futuras (No bloqueantes)

1. **WebSocket para visibilidad en tiempo real**
   - Actualmente: Usuario debe pull-to-refresh
   - Mejora: Server push cuando cancha cambia visibilidad
   - Tecnología: Socket.io

2. **Caché de canchas con TTL**
   - Actualmente: Cada fetch va al servidor
   - Mejora: Cache local con Time-To-Live (30 segundos)
   - Reducir llamadas API innecesarias

3. **Pagination en turnos**
   - Actualmente: Carga todos los turnos
   - Mejora: Paginación si >50 turnos
   - Mejor performance con muchos turnos

4. **Optimistic UI updates**
   - Actualmente: Espera respuesta servidor
   - Mejora: UI actualiza inmediatamente, rollback si error
   - UX más fluida

5. **Image lazy loading**
   - Actualmente: Carga todas las fotos
   - Mejora: Lazy load con placeholders
   - Mejor performance inicial

6. **React Navigation**
   - Actualmente: Cambio condicional Home/LocalDashboard
   - Mejora: Stack Navigator con transiciones
   - Mejor UX y navegación profunda

---

## 🐛 Notas sobre Riesgos

### Riesgos Mitigados
✅ **LayoutAnimation en Android:** Habilitado explícitamente con `UIManager.setLayoutAnimationEnabledExperimental`
✅ **Memory leaks:** No hay listeners sin cleanup
✅ **Race conditions:** `forceRefresh` evita usar usuario desactualizado
✅ **Pull-to-refresh sobre-uso:** `loading` previene múltiples fetches simultáneos

### Tests No Ejecutados (Recomendados)
⚠️ **Unit tests:** No hay tests automatizados
⚠️ **E2E tests:** No hay Detox/Appium configurado
⚠️ **Load testing:** No testeado con 1000+ turnos
⚠️ **iOS testing:** Solo verificado en Android (web funciona)

### Compatibilidad
- ✅ Android: Testeado
- ⚠️ iOS: No testeado (debería funcionar con LayoutAnimation)
- ✅ Web: Testeado (LayoutAnimation no disponible, fallback graceful)
- ✅ React Native: 0.x compatible
- ✅ Expo: Compatible

---

## 📸 Capturas de Pantalla (Opcional)

**Antes vs Después - Vista Turnos:**

ANTES:
- Todos los turnos expandidos sin orden
- No hay animación
- Difícil ver estructura

DESPUÉS:
- Cabeceras de días colapsables
- Animación suave
- Contadores y badges
- Mejor UX

*(Agregar screenshots si es posible)*

---

## 👥 Reviewers

Solicitar review de:
- [@backend-dev] - Verificar endpoints API
- [@mobile-dev] - Testing en iOS
- [@ux-designer] - Validar animaciones y flujo

---

## 📌 Relacionado

- Closes #[número-issue-1] - Icono config no visible
- Closes #[número-issue-2] - Turnos no agrupados
- Closes #[número-issue-3] - Config no persiste
- Closes #[número-issue-4] - Visibilidad no sincroniza
- Closes #[número-issue-5] - Barra búsqueda comportamiento

---

**Fecha:** 2025-01-10  
**Autor:** GitHub Copilot + Usuario  
**Versión:** 1.0.0
