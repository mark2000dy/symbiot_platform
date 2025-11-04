<?php
/**
 * ====================================================
 * MANEJO DE SESIONES - SYMBIOT FINANCE MANAGER
 * Archivo: finance_manager/includes/session.php
 *
 * Gestiona sesiones de usuario de forma segura
 * Incluye protección contra session hijacking y fixation
 * ====================================================
 */

// Prevenir acceso directo
if (! defined('SYMBIOT_ACCESS')) {
    define('SYMBIOT_ACCESS', true);
}

/**
 * Clase Session - Manejo seguro de sesiones PHP
 */
class Session
{

    // Duración de la sesión (24 horas)
    const SESSION_LIFETIME = 86400;

    // Tiempo de inactividad máximo (30 minutos)
    const INACTIVITY_TIMEOUT = 1800;

    // Nombre de la sesión
    const SESSION_NAME = 'SYMBIOT_SESSION';

    // Flag de inicialización
    private static $initialized = false;

    /**
     * Inicializar sesión de forma segura
     */
    public static function init()
    {
        if (self::$initialized) {
            return;
        }

        // Configurar parámetros de sesión antes de iniciarla
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_samesite', 'Lax');

        // En producción, usar HTTPS
        if (self::isProduction()) {
            ini_set('session.cookie_secure', 1);
        }

        // Configurar duración de sesión
        ini_set('session.gc_maxlifetime', self::SESSION_LIFETIME);
        session_set_cookie_params([
            'lifetime' => self::SESSION_LIFETIME,
            'path'     => '/',
            'domain'   => '',
            'secure'   => self::isProduction(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        // Establecer nombre de sesión personalizado
        session_name(self::SESSION_NAME);

        // Iniciar sesión
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Validar sesión
        self::validate();

        self::$initialized = true;
    }

    /**
     * Validar integridad de la sesión
     */
    private static function validate()
    {
        // Si es una sesión nueva, inicializar metadatos
        if (! isset($_SESSION['_metadata'])) {
            self::initializeMetadata();
            return;
        }

        // Verificar IP del usuario (protección contra session hijacking)
        if (self::get('_metadata.ip') !== self::getClientIP()) {
            self::destroy();
            return;
        }

        // Verificar User-Agent (protección adicional)
        if (self::get('_metadata.user_agent') !== self::getUserAgent()) {
            self::destroy();
            return;
        }

        // Verificar tiempo de inactividad
        $lastActivity = self::get('_metadata.last_activity');
        if ($lastActivity && (time() - $lastActivity) > self::INACTIVITY_TIMEOUT) {
            self::destroy();
            return;
        }

        // Actualizar timestamp de última actividad
        self::set('_metadata.last_activity', time());

        // Regenerar ID de sesión periódicamente (cada 30 minutos)
        $createdAt = self::get('_metadata.created_at');
        if ($createdAt && (time() - $createdAt) > 1800) {
            self::regenerate();
        }
    }

    /**
     * Inicializar metadatos de sesión
     */
    private static function initializeMetadata()
    {
        $_SESSION['_metadata'] = [
            'created_at'     => time(),
            'last_activity'  => time(),
            'ip'             => self::getClientIP(),
            'user_agent'     => self::getUserAgent(),
            'regenerated_at' => time(),
        ];
    }

    /**
     * Regenerar ID de sesión (protección contra session fixation)
     */
    public static function regenerate()
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
            $_SESSION['_metadata']['regenerated_at'] = time();
            $_SESSION['_metadata']['created_at']     = time();
        }
    }

    /**
     * Establecer valor en sesión
     *
     * @param string $key Clave (soporta notación punto: 'user.name')
     * @param mixed $value Valor
     */
    public static function set($key, $value)
    {
        self::init();

        $keys    = explode('.', $key);
        $current = &$_SESSION;

        foreach ($keys as $k) {
            if (! isset($current[$k]) || ! is_array($current[$k])) {
                $current[$k] = [];
            }
            $current = &$current[$k];
        }

        $current = $value;
    }

    /**
     * Obtener valor de sesión
     *
     * @param string $key Clave (soporta notación punto: 'user.name')
     * @param mixed $default Valor por defecto
     * @return mixed
     */
    public static function get($key, $default = null)
    {
        self::init();

        $keys    = explode('.', $key);
        $current = $_SESSION;

        foreach ($keys as $k) {
            if (! isset($current[$k])) {
                return $default;
            }
            $current = $current[$k];
        }

        return $current;
    }

    /**
     * Verificar si existe una clave en sesión
     *
     * @param string $key
     * @return bool
     */
    public static function has($key)
    {
        self::init();

        $keys    = explode('.', $key);
        $current = $_SESSION;

        foreach ($keys as $k) {
            if (! isset($current[$k])) {
                return false;
            }
            $current = $current[$k];
        }

        return true;
    }

    /**
     * Eliminar valor de sesión
     *
     * @param string $key
     */
    public static function delete($key)
    {
        self::init();

        $keys    = explode('.', $key);
        $last    = array_pop($keys);
        $current = &$_SESSION;

        foreach ($keys as $k) {
            if (! isset($current[$k])) {
                return;
            }
            $current = &$current[$k];
        }

        unset($current[$last]);
    }

    /**
     * Destruir sesión completamente
     */
    public static function destroy()
    {
        self::init();

        $_SESSION = [];

        // Eliminar cookie de sesión
        if (isset($_COOKIE[self::SESSION_NAME])) {
            setcookie(
                self::SESSION_NAME,
                '',
                time() - 3600,
                '/',
                '',
                self::isProduction(),
                true
            );
        }

        session_destroy();
        self::$initialized = false;
    }

    /**
     * Obtener toda la sesión (excepto metadatos)
     *
     * @return array
     */
    public static function all()
    {
        self::init();

        $session = $_SESSION;
        unset($session['_metadata']);

        return $session;
    }

    /**
     * Limpiar toda la sesión (excepto metadatos)
     */
    public static function clear()
    {
        self::init();

        $metadata = $_SESSION['_metadata'] ?? [];
        $_SESSION = ['_metadata' => $metadata];
    }

    /**
     * Establecer mensaje flash
     *
     * @param string $key
     * @param mixed $value
     */
    public static function flash($key, $value)
    {
        self::set("_flash.{$key}", $value);
    }

    /**
     * Obtener y eliminar mensaje flash
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getFlash($key, $default = null)
    {
        $value = self::get("_flash.{$key}", $default);
        self::delete("_flash.{$key}");
        return $value;
    }

    /**
     * Verificar si hay mensaje flash
     *
     * @param string $key
     * @return bool
     */
    public static function hasFlash($key)
    {
        return self::has("_flash.{$key}");
    }

    // ====================================================
    // MÉTODOS DE AUTENTICACIÓN
    // ====================================================

    /**
     * Establecer usuario autenticado
     *
     * @param array $user Datos del usuario
     */
    public static function login($user)
    {
        self::init();

        // Regenerar sesión al hacer login (seguridad)
        self::regenerate();

        // Guardar datos del usuario
        self::set('user', [
            'id'         => $user['id'],
            'nombre'     => $user['nombre'],
            'email'      => $user['email'],
            'rol'        => $user['rol'],
            'empresa'    => $user['empresa'],
            'empresa_id' => $user['empresa_id'] ?? null,
            'logged_in'  => true,
            'login_time' => time(),
        ]);

        // Log de login
        error_log("✅ Login exitoso: {$user['email']} ({$user['rol']})");
    }

    /**
     * Cerrar sesión de usuario
     */
    public static function logout()
    {
        self::init();

        $email = self::get('user.email', 'unknown');

        // Log de logout
        error_log("🚪 Logout: {$email}");

        // Destruir sesión
        self::destroy();
    }

    /**
     * Verificar si el usuario está autenticado
     *
     * @return bool
     */
    public static function isAuthenticated()
    {
        self::init();
        return self::get('user.logged_in', false) === true;
    }

    /**
     * Obtener usuario actual
     *
     * @return array|null
     */
    public static function getUser()
    {
        self::init();

        if (! self::isAuthenticated()) {
            return null;
        }

        return self::get('user');
    }

    /**
     * Obtener ID del usuario actual
     *
     * @return int|null
     */
    public static function getUserId()
    {
        $user = self::getUser();
        return $user ? $user['id'] : null;
    }

    /**
     * Obtener rol del usuario actual
     *
     * @return string|null
     */
    public static function getUserRole()
    {
        $user = self::getUser();
        return $user ? $user['rol'] : null;
    }

    /**
     * Obtener empresa del usuario actual
     *
     * @return string|null
     */
    public static function getUserCompany()
    {
        $user = self::getUser();
        return $user ? $user['empresa'] : null;
    }

    /**
     * Verificar si el usuario tiene un rol específico
     *
     * @param string|array $roles Rol o array de roles
     * @return bool
     */
    public static function hasRole($roles)
    {
        $userRole = self::getUserRole();

        if (! $userRole) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($userRole, $roles);
        }

        return $userRole === $roles;
    }

    /**
     * Verificar si el usuario es admin
     *
     * @return bool
     */
    public static function isAdmin()
    {
        return self::hasRole('admin');
    }

    /**
     * Verificar si el usuario es manager
     *
     * @return bool
     */
    public static function isManager()
    {
        return self::hasRole(['admin', 'manager']);
    }

    // ====================================================
    // MÉTODOS AUXILIARES
    // ====================================================

    /**
     * Obtener IP del cliente
     *
     * @return string
     */
    private static function getClientIP()
    {
        $ip = '';

        if (! empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (! empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }

        return $ip;
    }

    /**
     * Obtener User-Agent del cliente
     *
     * @return string
     */
    private static function getUserAgent()
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    }

    /**
     * Verificar si estamos en producción
     *
     * @return bool
     */
    private static function isProduction()
    {
        $host = $_SERVER['SERVER_NAME'] ?? '';
        return strpos($host, 'symbiot.com.mx') !== false;
    }

    /**
     * Obtener información de depuración de sesión
     *
     * @return array
     */
    public static function getDebugInfo()
    {
        self::init();

        return [
            'session_id'    => session_id(),
            'session_name'  => session_name(),
            'authenticated' => self::isAuthenticated(),
            'user'          => self::getUser(),
            'metadata'      => self::get('_metadata'),
            'all_keys'      => array_keys($_SESSION),
        ];
    }
}

// ====================================================
// FUNCIONES HELPER GLOBALES
// ====================================================

/**
 * Inicializar sesión
 */
function session_init()
{
    Session::init();
}

/**
 * Establecer valor en sesión
 */
function session_set($key, $value)
{
    Session::set($key, $value);
}

/**
 * Obtener valor de sesión
 */
function session_get($key, $default = null)
{
    return Session::get($key, $default);
}

/**
 * Verificar si existe clave en sesión
 */
function session_has($key)
{
    return Session::has($key);
}

/**
 * Eliminar valor de sesión
 */
function session_delete($key)
{
    Session::delete($key);
}

/**
 * Mensaje flash
 */
function session_flash($key, $value)
{
    Session::flash($key, $value);
}

/**
 * Obtener mensaje flash
 */
function session_get_flash($key, $default = null)
{
    return Session::getFlash($key, $default);
}

/**
 * Verificar autenticación
 */
function is_authenticated()
{
    return Session::isAuthenticated();
}

/**
 * Obtener usuario actual
 */
function current_user()
{
    return Session::getUser();
}

/**
 * Obtener ID de usuario actual
 */
function user_id()
{
    return Session::getUserId();
}

/**
 * Verificar si es admin
 */
function is_admin()
{
    return Session::isAdmin();
}

/**
 * Verificar si es manager
 */
function is_manager()
{
    return Session::isManager();
}

/**
 * Cerrar sesión
 */
function logout()
{
    Session::logout();
}

// ====================================================
// AUTO-INICIALIZACIÓN
// ====================================================

// Inicializar sesión automáticamente cuando se incluya el archivo
Session::init();
