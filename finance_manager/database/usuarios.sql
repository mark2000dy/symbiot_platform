-- ====================================================
-- SCRIPT DE USUARIOS - SYMBIOT FINANCE MANAGER
-- Archivo: finance_manager/database/usuarios.sql
-- 
-- Crea la tabla de usuarios y un usuario de prueba
-- ====================================================

-- Crear tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    empresa VARCHAR(100) DEFAULT NULL,
    empresa_id INT DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario de prueba (admin)
-- Email: admin@symbiot.com
-- Contraseña: admin123
INSERT INTO usuarios (nombre, email, password_hash, rol, empresa) 
VALUES (
    'Administrador',
    'admin@symbiot.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    'Symbiot Technologies'
) ON DUPLICATE KEY UPDATE nombre = nombre;

-- Insertar usuario manager de prueba
-- Email: manager@symbiot.com  
-- Contraseña: manager123
INSERT INTO usuarios (nombre, email, password_hash, rol, empresa)
VALUES (
    'Manager de Prueba',
    'manager@symbiot.com',
    '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', -- manager123
    'manager',
    'Symbiot Technologies'
) ON DUPLICATE KEY UPDATE nombre = nombre;

-- Insertar usuario regular de prueba
-- Email: user@symbiot.com
-- Contraseña: user123
INSERT INTO usuarios (nombre, email, password_hash, rol, empresa)
VALUES (
    'Usuario de Prueba',
    'user@symbiot.com',
    '$2y$10$E4.d6x/G8w0rK9J5xN8lzeWjR3bJ6qH6.tN7F3kL8pM9r2S4kT6uC', -- user123
    'user',
    'Symbiot Technologies'
) ON DUPLICATE KEY UPDATE nombre = nombre;

-- Verificar usuarios creados
SELECT id, nombre, email, rol, empresa, activo, created_at 
FROM usuarios 
ORDER BY id;