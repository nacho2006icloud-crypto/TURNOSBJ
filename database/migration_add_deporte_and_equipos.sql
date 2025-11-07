-- Migration: Add deporte field and team system
-- Date: 2024
-- Description: Adds sport configuration to turns and team selection to reservations

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Add 'deporte' column to horarios_disponibles
ALTER TABLE horarios_disponibles 
ADD COLUMN deporte VARCHAR(50) DEFAULT 'Futbol 5' AFTER max_integrantes;

-- Update existing records to have default sport
UPDATE horarios_disponibles 
SET deporte = 'Futbol 5' 
WHERE deporte IS NULL OR deporte = '';

-- Add 'equipo' column to reservas for team selection (A or B)
ALTER TABLE reservas 
ADD COLUMN equipo CHAR(1) AFTER deporte;

-- Add 'horario_id' foreign key to link reservations to specific turns
ALTER TABLE reservas 
ADD COLUMN horario_id INT AFTER local_id,
ADD CONSTRAINT fk_reservas_horario 
FOREIGN KEY (horario_id) REFERENCES horarios_disponibles(id) ON DELETE CASCADE;

-- Add 'fecha_reserva' to track when the reservation was made
ALTER TABLE reservas 
ADD COLUMN fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP AFTER fecha;

-- Create indexes for better performance on team queries
CREATE INDEX idx_reservas_horario_equipo ON reservas(horario_id, equipo);
CREATE INDEX idx_reservas_fecha ON reservas(fecha, hora_inicio);
CREATE INDEX idx_horarios_deporte ON horarios_disponibles(deporte);

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Display results
SELECT 'Migration completed successfully!' AS status;
