-- Script para crear la base de datos TurnosBJ
-- Ejecutar este script en MySQL Workbench o cliente MySQL

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS turnosbj CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE turnosbj;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ano_nacimiento INT,
    tipo_usuario ENUM('usuario', 'local') DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo_usuario (tipo_usuario)
);

-- Tabla de locales/canchas
CREATE TABLE IF NOT EXISTS locales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    fotos JSON,
    descripcion TEXT,
    deportes JSON,
    precio_hora DECIMAL(10, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_rating (rating),
    INDEX idx_precio_hora (precio_hora),
    INDEX idx_activo (activo)
);

-- Tabla de sesiones/tokens
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    tipo_usuario ENUM('usuario', 'local') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expires_at (expires_at)
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    local_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (usuario_id, local_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_local_id (local_id)
);

-- Tabla de reservas/turnos
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    local_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    deporte VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_local_id (local_id),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
);

-- Insertar datos de ejemplo
INSERT IGNORE INTO usuarios (nombre_completo, email, password, tipo_usuario) VALUES
('Club Deportivo Norte', 'norte@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'local'),
('Club Sur', 'sur@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'local'),
('Juan Pérez', 'juan@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'usuario');

-- Insertar locales de ejemplo
INSERT IGNORE INTO locales (usuario_id, email, password, nombre, direccion, latitud, longitud, fotos, deportes, precio_hora, rating) VALUES
(1, 'norte@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'Club Deportivo Norte', 'Av. Libertador 1234, CABA', -34.5875, -58.3974, '[]', '["futbol", "tenis"]', 5000, 4.5),
(2, 'sur@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'Club Sur', 'Av. Rivadavia 5678, CABA', -34.6118, -58.3960, '[]', '["futbol", "basquet", "padel"]', 7500, 4.8),
(1, 'norte@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'Cancha Norte 2', 'Av. Cabildo 2468, CABA', -34.5678, -58.4567, '[]', '["futbol"]', 6000, 4.2),
(2, 'sur@clubes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWJHO5/B8CYUvd7K8FdAuE5PW', 'Polideportivo Sur', 'Av. San Juan 1357, CABA', -34.6234, -58.3890, '[]', '["basquet", "voley", "handball"]', 8000, 4.7);

COMMIT;

-- Mostrar estructura creada
SHOW TABLES;