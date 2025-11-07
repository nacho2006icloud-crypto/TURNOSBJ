-- Actualizar estructura de base de datos para el sistema de reservas con max_integrantes
USE turnosbj;

-- Agregar campo max_integrantes a horarios_disponibles si no existe
ALTER TABLE horarios_disponibles 
ADD COLUMN IF NOT EXISTS max_integrantes INT NULL AFTER hora_fin,
ADD COLUMN IF NOT EXISTS max_integrantes_comment VARCHAR(100) NULL AFTER max_integrantes;

-- Actualizar tabla reservas para usar horario_id
-- Primero verificar si la columna horario_id existe, si no, agregarla
SET @dbname = 'turnosbj';
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
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER local_id, ADD FOREIGN KEY (horario_id) REFERENCES horarios_disponibles(id) ON DELETE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar campo fecha_reserva si no existe
SET @columnname = 'fecha_reserva';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NOT NULL AFTER horario_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_horario_id ON reservas(horario_id);
CREATE INDEX IF NOT EXISTS idx_fecha_reserva ON reservas(fecha_reserva);

-- Mostrar estructura actualizada
DESCRIBE horarios_disponibles;
DESCRIBE reservas;

SELECT 'Migración completada exitosamente!' as Mensaje;
