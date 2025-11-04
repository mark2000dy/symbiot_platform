<?php
/**
 * ====================================================
 * MIDDLEWARE DE AUTENTICACIÓN - SYMBIOT FINANCE MANAGER
 * Archivo: finance_manager/includes/auth_middleware.php
 *
 * Protege rutas y APIs verificando autenticación y permisos
 * ====================================================
 */

// Prevenir acceso directo
if (! defined('SYMBIOT_ACCESS')) {
    define('SYMBIOT_ACCESS', true);
}

// Incluir manejo de sesiones si no está incluido
if (! class_exists('Session')) {
    require_once __DIR__ . '/session.php';
}

/**
 * Clase AuthMiddleware - Protección de rutas y permisos
 */
class AuthMiddleware
{

    /**
     * Verificar que el usuario está autenticado
     * Si no está autenticado, redirecciona o envía error JSON
     *
     * @param bool $returnJson Si es true, devuelve JSON en lugar de redireccionar
     * @return bool
     */
    public static function requireAuth($returnJson = false)
    {
        if (! Session::isAuthenticated()) {
            if ($returnJson || self::isAjaxRequest()) {
                self::sendJsonError('No autorizado. Inicia sesión primero.', 401);
                exit;
            } else {
                self::redirectToLogin();
                exit;
            }
        }

        return true;
    }

    /**
     * Verificar que el usuario tiene un rol específico
     *
     * @param string|array $roles Rol requerido o array de roles permitidos
     * @param bool $returnJson Si es true, devuelve JSON en lugar de redireccionar
     * @return bool
     */
    public static function requireRole($roles, $returnJson = false)
    {
        // Primero verificar autenticación
        self::requireAuth($returnJson);

        // Verificar rol
        if (! Session::hasRole($roles)) {
            $message = 'No tienes permisos para acceder a este recurso.';

            if ($returnJson || self::isAjaxRequest()) {
                self::sendJsonError($message, 403);
                exit;
            } else {
                Session::flash('error', $message);
                self::redirectToDashboard();
                exit;
            }
        }

        return true;
    }

    /**
     * Verificar que el usuario es administrador
     *
     * @param bool $returnJson
     * @return bool
     */
    public static function requireAdmin($returnJson = false)
    {
        return self::requireRole('admin', $returnJson);
    }

    /**
     * Verificar que el usuario es manager o admin
     *
     * @param bool $returnJson
     * @return bool
     */
    public static function requireManager($returnJson = false)
    {
        return self::requireRole(['admin', 'manager'], $returnJson);
    }

    /**
     * Verificar que el usuario NO está autenticado (para páginas de login)
     * Si está autenticado, redirecciona al dashboard
     */
    public static function requireGuest()
    {
        if (Session::isAuthenticated()) {
            self::redirectToDashboard();
            exit;
        }

        return true;
    }

    /**
     * Verificar que la petición viene del mismo sitio (CSRF básico)
     *
     * @return bool
     */
    public static function verifySameOrigin()
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $host    = $_SERVER['HTTP_HOST'] ?? '';

        if (empty($referer)) {
            return false;
        }

        $refererHost = parse_url($referer, PHP_URL_HOST);

        return $refererHost === $host;
    }

    /**
     * Verificar token CSRF (para formularios)
     *
     * @param string|null $token Token a verificar (si es null, lo toma de POST)
     * @return bool
     */
    public static function verifyCsrfToken($token = null)
    {
        if ($token === null) {
            $token = $_POST['_csrf_token'] ?? '';
        }

        $sessionToken = Session::get('_csrf_token');

        if (empty($token) || empty($sessionToken)) {
            return false;
        }

        return hash_equals($sessionToken, $token);
    }

    /**
     * Generar y guardar token CSRF
     *
     * @return string
     */
    public static function generateCsrfToken()
    {
        $token = bin2hex(random_bytes(32));
        Session::set('_csrf_token', $token);
        return $token;
    }

    /**
     * Obtener token CSRF actual o generar uno nuevo
     *
     * @return string
     */
    public static function getCsrfToken()
    {
        $token = Session::get('_csrf_token');

        if (empty($token)) {
            $token = self::generateCsrfToken();
        }

        return $token;
    }

    /**
     * Verificar que la petición es POST
     *
     * @param bool $returnJson
     * @return bool
     */
    public static function requirePost($returnJson = false)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $message = 'Método no permitido. Se esperaba POST.';

            if ($returnJson || self::isAjaxRequest()) {
                self::sendJsonError($message, 405);
                exit;
            } else {
                http_response_code(405);
                die($message);
            }
        }

        return true;
    }

    /**
     * Verificar que la petición es GET
     *
     * @param bool $returnJson
     * @return bool
     */
    public static function requireGet($returnJson = false)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $message = 'Método no permitido. Se esperaba GET.';

            if ($returnJson || self::isAjaxRequest()) {
                self::sendJsonError($message, 405);
                exit;
            } else {
                http_response_code(405);
                die($message);
            }
        }

        return true;
    }

    /**
     * Limitar tasa de peticiones (rate limiting básico)
     *
     * @param string $action Identificador de la acción
     * @param int $maxAttempts Número máximo de intentos
     * @param int $decayMinutes Minutos de bloqueo
     * @return bool True si está dentro del límite
     */
    public static function rateLimit($action, $maxAttempts = 5, $decayMinutes = 15)
    {
        $key      = "rate_limit.{$action}";
        $attempts = Session::get($key, [
            'count'    => 0,
            'reset_at' => time() + ($decayMinutes * 60),
        ]);

        // Si ya pasó el tiempo de reset, reiniciar contador
        if (time() >= $attempts['reset_at']) {
            $attempts = [
                'count'    => 1,
                'reset_at' => time() + ($decayMinutes * 60),
            ];
            Session::set($key, $attempts);
            return true;
        }

        // Incrementar contador
        $attempts['count']++;
        Session::set($key, $attempts);

        // Verificar si excedió el límite
        if ($attempts['count'] > $maxAttempts) {
            $remainingMinutes = ceil(($attempts['reset_at'] - time()) / 60);

            if (self::isAjaxRequest()) {
                self::sendJsonError(
                    "Demasiados intentos. Intenta de nuevo en {$remainingMinutes} minutos.",
                    429
                );
                exit;
            }

            return false;
        }

        return true;
    }

    /**
     * Limpiar rate limit para una acción
     *
     * @param string $action
     */
    public static function clearRateLimit($action)
    {
        Session::delete("rate_limit.{$action}");
    }

    // ====================================================
    // MÉTODOS AUXILIARES
    // ====================================================

    /**
     * Verificar si la petición es AJAX
     *
     * @return bool
     */
    private static function isAjaxRequest()
    {
        return ! empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    /**
     * Enviar respuesta JSON de error
     *
     * @param string $message Mensaje de error
     * @param int $statusCode Código HTTP
     */
    private static function sendJsonError($message, $statusCode = 400)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error'   => $message,
            'status'  => $statusCode,
        ]);
    }

    /**
     * Enviar respuesta JSON de éxito
     *
     * @param mixed $data Datos a enviar
     * @param int $statusCode Código HTTP
     */
    public static function sendJsonSuccess($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data'    => $data,
            'status'  => $statusCode,
        ]);
    }

    /**
     * Redireccionar al login
     */
    private static function redirectToLogin()
    {
        $loginUrl = self::getBaseUrl() . '/finance_manager/public/login.html';
        header("Location: {$loginUrl}");
    }

    /**
     * Redireccionar al dashboard
     */
    private static function redirectToDashboard()
    {
        $dashboardUrl = self::getBaseUrl() . '/finance_manager/public/dashboard.html';
        header("Location: {$dashboardUrl}");
    }

    /**
     * Obtener URL base del sitio
     *
     * @return string
     */
    private static function getBaseUrl()
    {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host     = $_SERVER['HTTP_HOST'];

        // Eliminar el path del script actual
        $scriptName = $_SERVER['SCRIPT_NAME'];
        $basePath   = dirname(dirname(dirname($scriptName)));

        return "{$protocol}://{$host}{$basePath}";
    }

    /**
     * Registrar intento de acceso no autorizado
     *
     * @param string $resource Recurso al que intentó acceder
     */
    private static function logUnauthorizedAccess($resource)
    {
        $user   = Session::getUser();
        $userId = $user ? $user['id'] : 'guest';
        $email  = $user ? $user['email'] : 'unknown';
        $ip     = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        error_log("🚫 Acceso no autorizado: Usuario {$email} (ID: {$userId}) desde IP {$ip} intentó acceder a: {$resource}");
    }
}

// ====================================================
// FUNCIONES HELPER GLOBALES
// ====================================================

/**
 * Requerir autenticación (atajo)
 */
function require_auth($returnJson = false)
{
    return AuthMiddleware::requireAuth($returnJson);
}

/**
 * Requerir rol específico (atajo)
 */
function require_role($roles, $returnJson = false)
{
    return AuthMiddleware::requireRole($roles, $returnJson);
}

/**
 * Requerir admin (atajo)
 */
function require_admin($returnJson = false)
{
    return AuthMiddleware::requireAdmin($returnJson);
}

/**
 * Requerir manager (atajo)
 */
function require_manager($returnJson = false)
{
    return AuthMiddleware::requireManager($returnJson);
}

/**
 * Requerir invitado no autenticado (atajo)
 */
function require_guest()
{
    return AuthMiddleware::requireGuest();
}

/**
 * Obtener token CSRF (atajo)
 */
function csrf_token()
{
    return AuthMiddleware::getCsrfToken();
}

/**
 * Verificar token CSRF (atajo)
 */
function verify_csrf($token = null)
{
    return AuthMiddleware::verifyCsrfToken($token);
}

/**
 * Limitar tasa (atajo)
 */
function rate_limit($action, $maxAttempts = 5, $decayMinutes = 15)
{
    return AuthMiddleware::rateLimit($action, $maxAttempts, $decayMinutes);
}

/**
 * Enviar JSON de éxito (atajo)
 */
function json_success($data, $statusCode = 200)
{
    AuthMiddleware::sendJsonSuccess($data, $statusCode);
    exit;
}

/**
 * Enviar JSON de error (atajo)
 */
function json_error($message, $statusCode = 400)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error'   => $message,
        'status'  => $statusCode,
    ]);
    exit;
}
