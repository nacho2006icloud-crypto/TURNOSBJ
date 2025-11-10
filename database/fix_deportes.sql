-- Script para corregir el formato de deportes en la base de datos
-- Ejecutar este script para migrar los datos al nuevo formato

-- Desactivar modo seguro temporalmente
SET SQL_SAFE_UPDATES = 0;

-- Ver estado actual
SELECT id, nombre, deportes, fotos FROM locales;

-- PASO 1: Limpiar datos NULL y vacíos
UPDATE locales SET deportes = '[]' WHERE deportes IS NULL OR deportes = '' OR deportes = '[""]';
UPDATE locales SET fotos = '[]' WHERE fotos IS NULL OR fotos = '';

-- PASO 2: Corregir formato de deportes mal formateados
-- Los datos actuales tienen formato: ["futbol,tenis"] o ["basquet,voley,handball"]
-- Necesitamos convertirlos a: ["Futbol 5", "Tenis"] etc.

-- Para el local id=1 (futbol, tenis)
UPDATE locales SET deportes = '["Futbol 5", "Tenis"]' WHERE id = 1;

-- Para el local id=2 (futbol, basquet, padel)
UPDATE locales SET deportes = '["Futbol 5", "Basquet", "Padel"]' WHERE id = 2;

-- Para el local id=3 (futbol)
UPDATE locales SET deportes = '["Futbol 5"]' WHERE id = 3;

-- Para el local id=4 (basquet, voley, handball)
UPDATE locales SET deportes = '["Basquet", "Voley"]' WHERE id = 4;

-- Para los locales 5-12 (duplicados) - aplicar las mismas correcciones
UPDATE locales SET deportes = '["Futbol 5", "Tenis"]' WHERE id IN (5, 9);
UPDATE locales SET deportes = '["Futbol 5", "Basquet", "Padel"]' WHERE id IN (6, 10);
UPDATE locales SET deportes = '["Futbol 5"]' WHERE id IN (7, 11);
UPDATE locales SET deportes = '["Basquet", "Voley"]' WHERE id IN (8, 12);

-- Para el local 15 (tu cancha de prueba) - dejar vacío para que lo configures
UPDATE locales SET deportes = '[]' WHERE id = 15;

-- PASO 3: Asegurar que todos tengan array vacío si no están configurados
UPDATE locales SET deportes = '[]' WHERE deportes = '' OR deportes = '[""]' OR deportes IS NULL;
UPDATE locales SET fotos = '[]' WHERE fotos = '' OR fotos IS NULL;

-- Reactivar modo seguro
SET SQL_SAFE_UPDATES = 1;

-- Verificar resultados
SELECT id, nombre, deportes, fotos, visible FROM locales ORDER BY id;
