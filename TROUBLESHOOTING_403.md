# 🐛 SOLUCIÓN AL ERROR 403 FORBIDDEN

## Problema
Al tocar "Guardar cambios" o "Mostrar cancha" sale error 403 (Forbidden).

## Causa
El token de autenticación no está disponible o es inválido.

## Soluciones

### Solución 1: Re-login (MÁS PROBABLE)
1. Hacer **logout**
2. Hacer **login nuevamente** como cancha
3. Intentar guardar/cambiar visibilidad

### Solución 2: Verificar Token en Consola del Navegador
Abre la consola del navegador (F12) y ejecuta:
```javascript
localStorage.getItem('auth_token')
```

Si devuelve `null`, necesitas hacer login nuevamente.

### Solución 3: Limpiar Storage y Re-login
En consola del navegador:
```javascript
localStorage.clear()
// Luego hacer login nuevamente
```

## Verificación
Después de login, en consola deberías ver:
```
🔑 Token desde localStorage: SI (eyJhbGciOiJIUzI1NI...)
📋 Token payload: {id: 123, tipo_usuario: "local", ...}
```

## Explicación Técnica
El servidor verifica que:
1. Token esté presente (401 si no)
2. Token sea válido (403 si inválido)
3. Usuario sea tipo "local" (403 si es usuario regular)

El error 403 indica que el token falta o no tiene `tipo_usuario: 'local'`.

---

## Sobre Visibilidad de Canchas

✅ **YA IMPLEMENTADO:** Cuando una cancha activa "Mostrar cancha":
1. Backend actualiza `locales.visible = 1`
2. Endpoint GET `/api/canchas` solo devuelve canchas con `visible = TRUE`
3. Usuario puede hacer pull-to-refresh para ver la cancha
4. La cancha aparece filtrada por deporte seleccionado

**No se requiere código adicional**, solo:
- Login exitoso como cancha
- Activar visibilidad
- Usuario refresca la lista
