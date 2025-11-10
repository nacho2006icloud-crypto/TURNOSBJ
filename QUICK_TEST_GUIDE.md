# 🧪 GUÍA DE TESTING RÁPIDO (10 minutos)

## Pre-requisitos

✅ Backend corriendo en puerto 3000  
✅ Frontend iniciado (web o móvil)  
✅ 2 cuentas creadas: 1 usuario + 1 cancha

---

## Test 1: Icono Config Visible Solo para Canchas (2 min)

### Usuario Regular
1. Login con cuenta **usuario**
2. Mirar MainBar (barra inferior)
3. ✅ **ESPERADO:** Solo 2 iconos (Plus central + User derecha)
4. ❌ **NO debe aparecer:** Icono settings (gear/configuración)

### Cancha
5. Logout
6. Login con cuenta **cancha**
7. Mirar MainBar  
8. ✅ **ESPERADO:** 3 iconos (Settings izquierda + Plus central + User derecha)
9. Tocar settings → ✅ Abre SettingsModal

**✅ PASS:** Icono solo para canchas  
**❌ FAIL:** Icono aparece para usuarios regulares

---

## Test 2: Turnos Expandibles por Día (2 min)

### Preparación
1. Login como **cancha**
2. Settings → Tab "Deportes"
3. Crear 3 turnos:
   - Lunes 18:00 (Futbol 5)
   - Lunes 20:00 (Futbol 5)
   - Martes 19:00 (Padel)
4. Guardar

### Testing
5. Volver a LocalDashboard (pantalla principal cancha)
6. Scroll down para ver turnos
7. ✅ **ESPERADO:** 2 cabeceras colapsadas
   - "Lunes" con "2 turnos"
   - "Martes" con "1 turno"

8. **TOCAR cabecera "Lunes"**
   - ✅ Animación suave (slide down)
   - ✅ Icono chevron cambia: → a ↓
   - ✅ Muestra 2 cards de turnos (18:00, 20:00)

9. **TOCAR nuevamente "Lunes"**
   - ✅ Animación suave (slide up)
   - ✅ Icono chevron cambia: ↓ a →
   - ✅ Oculta los turnos

10. **TOCAR "Martes"**
    - ✅ Expande Martes
    - ✅ Muestra 1 turno (19:00 Padel)

**✅ PASS:** Animación fluida, todos los turnos visibles al expandir  
**❌ FAIL:** No anima, no expande, o falta algún turno

---

## Test 3: Persistencia de Configuración (2 min)

### Guardar Datos
1. Login como **cancha**
2. Settings → Tab "Info"
3. Cambiar:
   - Nombre: "Mi Cancha Test"
   - Descripción: "Descripción de prueba"
   - Precio: 5000
4. Guardar → ✅ Mensaje "Información actualizada"
5. **LOGOUT**

### Verificar Persistencia
6. **LOGIN** nuevamente (misma cuenta cancha)
7. Settings → Tab "Info"
8. ✅ **ESPERADO:**
   - Nombre: "Mi Cancha Test"
   - Descripción: "Descripción de prueba"
   - Precio: "5000"

**✅ PASS:** Todos los datos persisten  
**❌ FAIL:** Datos vuelven a valores anteriores o vacíos

---

## Test 4: Sincronización Visibilidad (3 min)

### Setup
Necesitas **2 dispositivos/navegadores**:
- **Dispositivo A:** Login como **cancha**
- **Dispositivo B:** Login como **usuario**

### Testing
1. **Dispositivo B (usuario):**
   - HomeContent → Clasificación de Canchas
   - Seleccionar "Futbol 5"
   - Contar cuántas canchas aparecen: _____

2. **Dispositivo A (cancha):**
   - Settings → Tab "Info"
   - Scroll down
   - **Activar toggle "Cancha Visible"**
   - ✅ Mensaje confirmación

3. **Dispositivo B (usuario):**
   - En la lista de canchas, **arrastrar hacia abajo** (pull-to-refresh)
   - Esperar spinner
   - ✅ **ESPERADO:** Ahora aparece "Mi Cancha Test"

4. **Dispositivo A (cancha):**
   - **Desactivar toggle "Cancha Visible"**

5. **Dispositivo B (usuario):**
   - Pull-to-refresh nuevamente
   - ✅ **ESPERADO:** "Mi Cancha Test" desaparece

**✅ PASS:** Cambios se reflejan con pull-to-refresh  
**❌ FAIL:** Cancha no aparece/desaparece, o no hay spinner

---

## Test 5: Barra de Búsqueda (1 min)

### Usuario Regular
1. Login como **usuario**
2. Mirar parte superior (header azul)
3. ✅ **ESPERADO:** Barra de búsqueda visible (lupa + "Buscar...")
4. Tocar barra → Teclado aparece

### Cancha
5. Logout
6. Login como **cancha**
7. Mirar pantalla (LocalDashboard)
8. ✅ **ESPERADO:** NO hay barra de búsqueda
9. Solo header con "Mi Cancha" y estadísticas

**✅ PASS:** Búsqueda solo para usuarios  
**❌ FAIL:** Búsqueda aparece para canchas, o no aparece para usuarios

---

## 📊 Resultado Final

Completa todos los tests y marca:

- [ ] Test 1: Icono Config ✅/❌
- [ ] Test 2: Turnos Expandibles ✅/❌
- [ ] Test 3: Persistencia ✅/❌
- [ ] Test 4: Visibilidad ✅/❌
- [ ] Test 5: Barra Búsqueda ✅/❌

**TODOS ✅ → READY TO MERGE 🚀**  
**ALGÚN ❌ → REVISAR PR_DESCRIPTION.md para debugging**

---

## 🐛 Troubleshooting Rápido

### Problema: Backend no responde
```bash
# Verificar puerto 3000
curl http://localhost:3000/api/canchas
# O abrir en navegador
```

### Problema: Frontend no inicia
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install
npm start
```

### Problema: Animación no funciona (Android)
- Verificar: `UIManager.setLayoutAnimationEnabledExperimental(true)` en LocalDashboard.js
- React Native versión debe ser >0.60

### Problema: Pull-to-refresh no aparece
- Scroll debe estar en top (position 0)
- Arrastrar desde arriba hacia abajo
- En web puede no funcionar (mobile-only feature)

---

**Tiempo estimado:** 10 minutos  
**Complejidad:** Baja (testing manual)  
**Requerimientos:** 2 dispositivos/navegadores para Test 4
