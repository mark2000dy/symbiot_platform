<?php
/**
 * ====================================================
 * API DE AUTENTICACIÓN - SYMBIOT FINANCE MANAGER
 * Archivo: finance_manager/api/auth.php
 *
 * Endpoints:
 * - POST /login  - Iniciar sesión
 * - POST /logout - Cerrar sesión
 * - GET  /user   - Obtener usuario actual
 * ====================================================
 */

// Definir constante de acceso
define('SYMBIOT_ACCESS', true);

// Headers para CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir dependencias
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

// Configurar errores (en desarrollo mostrar, en producción ocultar)
if (Database::getInstance()->getEnvironment() === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Obtener método HTTP y acción
$method     = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Determinar acción basada en la URL
$action = 'unknown';
if (strpos($requestUri, 'login') !== false) {
    $action = 'login';
} elseif (strpos($requestUri, 'logout') !== false) {
    $action = 'logout';
} elseif (strpos($requestUri, 'user') !== false) {
    $action = 'user';
}

// Enrutador simple
try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;

        case 'logout':
            handleLogout();
            break;

        case 'user':
            handleGetUser();
            break;

        default:
            sendError('Endpoint no encontrado', 404);
            break;
    }
} catch (Exception $e) {
    error_log("❌ Error en API auth: " . $e->getMessage());
    sendError('Error interno del servidor', 500);
}

// ====================================================
// FUNCIONES DE MANEJO
// ====================================================

/**
 * Manejar login de usuario
 */
function handleLogin()
{
    // Solo permitir POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Método no permitido. Use POST.', 405);
    }

    // Rate limiting - máximo 5 intentos cada 15 minutos
    if (! AuthMiddleware::rateLimit('login_attempts', 5, 15)) {
        sendError('Demasiados intentos de login. Intenta de nuevo en 15 minutos.', 429);
    }

    // Obtener datos del request
    $input = getJsonInput();

    // Validar campos requeridos
    if (empty($input['email']) || empty($input['password'])) {
        sendError('Email y contraseña son requeridos', 400);
    }

    $email    = trim($input['email']);
    $password = $input['password'];

    // Validar formato de email
    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Email inválido', 400);
    }

    try {
        $db = Database::getInstance();

        // Buscar usuario por email
        $user = $db->selectOne(
            "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
            [$email]
        );

        if (! $user) {
            error_log("⚠️ Intento de login fallido: Email no encontrado - {$email}");
            sendError('Credenciales inválidas', 401);
        }

        // Verificar contraseña
        $passwordValid = false;

        // Si la contraseña está hasheada con bcrypt
        if (strpos($user['password_hash'], '$2y$') === 0) {
            $passwordValid = password_verify($password, $user['password_hash']);
        }
        // Si es contraseña plana (para migración)
        else {
            if ($user['password_hash'] === $password) {
                $passwordValid = true;

                // Actualizar a bcrypt
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $db->update(
                    "UPDATE usuarios SET password_hash = ? WHERE id = ?",
                    [$hashedPassword, $user['id']]
                );

                error_log("🔐 Contraseña actualizada a bcrypt para usuario: {$email}");
            }
        }

        if (! $passwordValid) {
            error_log("⚠️ Intento de login fallido: Contraseña incorrecta - {$email}");
            sendError('Credenciales inválidas', 401);
        }

        // Obtener nombre de la empresa si tiene empresa_id
        $empresaNombre = null;
        if (! empty($user['empresa_id'])) {
            $empresa = $db->selectOne(
                "SELECT nombre FROM empresas WHERE id = ?",
                [$user['empresa_id']]
            );
            $empresaNombre = $empresa ? $empresa['nombre'] : null;
        }

        // Login exitoso - Crear sesión
        Session::login([
            'id'         => $user['id'],
            'nombre'     => $user['nombre'],
            'email'      => $user['email'],
            'rol'        => $user['rol'],
            'empresa'    => $user['empresa'] ?? $empresaNombre,
            'empresa_id' => $user['empresa_id'] ?? null,
        ]);

        // Limpiar rate limit después de login exitoso
        AuthMiddleware::clearRateLimit('login_attempts');

        error_log("✅ Login exitoso: {$email} ({$user['rol']})");

        // Respuesta exitosa
        sendSuccess([
            'message'     => 'Login exitoso',
            'user'        => [
                'id'         => (int) $user['id'],
                'nombre'     => $user['nombre'],
                'email'      => $user['email'],
                'rol'        => $user['rol'],
                'empresa'    => $user['empresa'] ?? $empresaNombre,
                'empresa_id' => $user['empresa_id'] ? (int) $user['empresa_id'] : null,
            ],
            'redirectUrl' => '/symbiot/finance_manager/public/dashboard.html',
        ]);

    } catch (Exception $e) {
        error_log("❌ Error en login: " . $e->getMessage());
        sendError('Error al procesar login', 500);
    }
}

/**
 * Manejar logout de usuario
 */
function handleLogout()
{
    // Solo permitir POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Método no permitido. Use POST.', 405);
    }

    try {
        $email = Session::get('user.email', 'unknown');

        // Cerrar sesión
        Session::logout();

        error_log("🚪 Logout exitoso: {$email}");

        sendSuccess([
            'message'     => 'Sesión cerrada exitosamente',
            'redirectUrl' => '/symbiot/finance_manager/public/login.html',
        ]);

    } catch (Exception $e) {
        error_log("❌ Error en logout: " . $e->getMessage());
        sendError('Error al cerrar sesión', 500);
    }
}

/**
 * Obtener usuario actual de la sesión
 */
function handleGetUser()
{
    // Solo permitir GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Método no permitido. Use GET.', 405);
    }

    try {
        // Verificar si hay sesión activa
        if (! Session::isAuthenticated()) {
            sendError('No hay sesión activa', 401);
        }

        $user = Session::getUser();

        if (! $user) {
            sendError('Usuario no encontrado en sesión', 401);
        }

        sendSuccess([
            'user' => $user,
        ]);

    } catch (Exception $e) {
        error_log("❌ Error obteniendo usuario: " . $e->getMessage());
        sendError('Error al obtener usuario', 500);
    }
}

// ====================================================
// FUNCIONES AUXILIARES
// ====================================================

/**
 * Obtener input JSON del request
 */
function getJsonInput()
{
    $input = file_get_contents('php://input');
    $data  = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('JSON inválido', 400);
    }

    return $data ?: [];
}

/**
 * Enviar respuesta de éxito
 */
function sendSuccess($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => true,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Enviar respuesta de error
 */
function sendError($message, $statusCode = 400)
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error'   => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
