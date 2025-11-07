-- ====================================================================
-- ACTUALIZACIÓN COMPLETA DE BASE DE DATOS - TurnosBJ
-- Basado en Dump20251107.sql
-- ====================================================================

USE turnosbj;

-- ====================================================================
-- 1. AGREGAR CAMPO max_integrantes A horarios_disponibles
-- ====================================================================

-- Verificar si max_integrantes existe, si no, agregarlo
SET @dbname = 'turnosbj';
SET @tablename = 'horarios_disponibles';
SET @columnname = 'max_integrantes';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "La columna max_integrantes ya existe" AS resultado',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT "Máximo de personas por turno (ej: 10 para F5, 14 para F7)" AFTER hora_fin')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ====================================================================
-- 2. AGREGAR CAMPO horario_id A reservas
-- ====================================================================

SET @tablename = 'reservas';
SET @columnname = 'horario_id';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "La columna horario_id ya existe" AS resultado',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT "Referencia al turno reservado" AFTER local_id')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar foreign key si no existe
SET @fk_exists = (SELECT COUNT(*) 
                  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA = 'turnosbj' 
                  AND TABLE_NAME = 'reservas' 
                  AND CONSTRAINT_NAME = 'reservas_horario_fk');

SET @preparedStatement = (SELECT IF(
  @fk_exists > 0,
  'SELECT "La FK reservas_horario_fk ya existe" AS resultado',
  'ALTER TABLE reservas ADD CONSTRAINT reservas_horario_fk FOREIGN KEY (horario_id) REFERENCES horarios_disponibles(id) ON DELETE CASCADE'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ====================================================================
-- 3. AGREGAR CAMPO fecha_reserva A reservas
-- ====================================================================

SET @tablename = 'reservas';
SET @columnname = 'fecha_reserva';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "La columna fecha_reserva ya existe" AS resultado',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL COMMENT "Fecha específica de la reserva" AFTER horario_id')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ====================================================================
-- 4. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ====================================================================

-- Índice para horario_id en reservas
SET @index_exists = (SELECT COUNT(*) 
                     FROM INFORMATION_SCHEMA.STATISTICS 
                     WHERE TABLE_SCHEMA = 'turnosbj' 
                     AND TABLE_NAME = 'reservas' 
                     AND INDEX_NAME = 'idx_horario_id');

SET @preparedStatement = (SELECT IF(
  @index_exists > 0,
  'SELECT "El índice idx_horario_id ya existe" AS resultado',
  'CREATE INDEX idx_horario_id ON reservas(horario_id)'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Índice para fecha_reserva en reservas
SET @index_exists = (SELECT COUNT(*) 
                     FROM INFORMATION_SCHEMA.STATISTICS 
                     WHERE TABLE_SCHEMA = 'turnosbj' 
                     AND TABLE_NAME = 'reservas' 
                     AND INDEX_NAME = 'idx_fecha_reserva');

SET @preparedStatement = (SELECT IF(
  @index_exists > 0,
  'SELECT "El índice idx_fecha_reserva ya existe" AS resultado',
  'CREATE INDEX idx_fecha_reserva ON reservas(fecha_reserva)'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ====================================================================
-- 5. VERIFICACIÓN FINAL - MOSTRAR ESTRUCTURA ACTUALIZADA
-- ====================================================================

SELECT '========================' AS '';
SELECT 'VERIFICACIÓN DE CAMBIOS' AS '';
SELECT '========================' AS '';

-- Mostrar estructura de horarios_disponibles
SELECT 'Estructura de horarios_disponibles:' AS '';
DESCRIBE horarios_disponibles;

SELECT '' AS '';
SELECT '========================' AS '';

-- Mostrar estructura de reservas
SELECT 'Estructura de reservas:' AS '';
DESCRIBE reservas;

SELECT '' AS '';
SELECT '========================' AS '';
SELECT 'RESUMEN DE CAMBIOS:' AS '';
SELECT '========================' AS '';

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_schema = 'turnosbj' 
            AND table_name = 'horarios_disponibles' 
            AND column_name = 'max_integrantes'
        ) THEN '✓ AGREGADO'
        ELSE '✗ FALTA'
    END AS 'horarios_disponibles.max_integrantes';

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_schema = 'turnosbj' 
            AND table_name = 'reservas' 
            AND column_name = 'horario_id'
        ) THEN '✓ AGREGADO'
        ELSE '✗ FALTA'
    END AS 'reservas.horario_id';

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_schema = 'turnosbj' 
            AND table_name = 'reservas' 
            AND column_name = 'fecha_reserva'
        ) THEN '✓ AGREGADO'
        ELSE '✗ FALTA'
    END AS 'reservas.fecha_reserva';

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'turnosbj' 
            AND TABLE_NAME = 'reservas' 
            AND CONSTRAINT_NAME = 'reservas_horario_fk'
        ) THEN '✓ CREADA'
        ELSE '✗ FALTA'
    END AS 'FK reservas -> horarios_disponibles';

SELECT '' AS '';
SELECT '========================' AS '';
SELECT '✅ MIGRACIÓN COMPLETADA' AS '';
SELECT '========================' AS '';
