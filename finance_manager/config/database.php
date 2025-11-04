<?php
/**
 * ====================================================
 * CONFIGURACIÓN DE BASE DE DATOS - SYMBIOT FINANCE MANAGER
 * Archivo: finance_manager/config/database.php
 *
 * Maneja la conexión a MySQL usando PDO
 * Compatible con AppServ (local) y Plesk (producción)
 * ====================================================
 */

// Prevenir acceso directo
if (! defined('SYMBIOT_ACCESS')) {
    define('SYMBIOT_ACCESS', true);
}

/**
 * Clase Database - Singleton para conexión PDO
 */
class Database
{

    // Instancia única de la clase (Singleton)
    private static $instance = null;

    // Objeto PDO
    private $pdo = null;

    // Configuración de conexión
    private $config = [
        // Configuración para PRODUCCIÓN (Plesk)
        'production'  => [
            'host'     => 'localhost',
            'port'     => '3306',
            'database' => 'gastos_app_db',
            'username' => 'gastos_user',
            'password' => 'Gastos2025!',
            'charset'  => 'utf8mb4',
        ],

        // Configuración para DESARROLLO (AppServ local)
        'development' => [
            'host'     => 'localhost',
            'port'     => '3306',
            'database' => 'gastos_app_db',
            'username' => 'root',
            'password' => 'admin1234', // Cambiar según tu instalación de AppServ
            'charset'  => 'utf8mb4',
        ],
    ];

    // Opciones de PDO
    private $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ];

    /**
     * Constructor privado (Singleton)
     */
    private function __construct()
    {
        $this->connect();
    }

    /**
     * Prevenir clonación del objeto
     */
    private function __clone()
    {}

    /**
     * Prevenir deserialización
     */
    public function __wakeup()
    {
        throw new Exception("No se puede deserializar un singleton");
    }

    /**
     * Obtener instancia única de Database (Singleton)
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Detectar entorno (desarrollo o producción)
     */
    public function getEnvironment()
    {
        // Detectar si estamos en servidor de producción (Plesk)
        if (isset($_SERVER['SERVER_NAME']) &&
            (strpos($_SERVER['SERVER_NAME'], 'symbiot.com.mx') !== false)) {
            return 'production';
        }

        // Detectar si estamos en localhost (AppServ)
        if (isset($_SERVER['SERVER_NAME']) &&
            (strpos($_SERVER['SERVER_NAME'], 'localhost') !== false ||
                strpos($_SERVER['SERVER_NAME'], '127.0.0.1') !== false ||
                strpos($_SERVER['SERVER_NAME'], 'symbiot.local') !== false)) {
            return 'development';
        }

        // Por defecto, usar desarrollo
        return 'development';
    }

    /**
     * Establecer conexión a la base de datos
     */
    private function connect()
    {
        try {
            // Obtener configuración según el entorno
            $env    = $this->getEnvironment();
            $config = $this->config[$env];

            // Construir DSN
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );

            // Crear conexión PDO
            $this->pdo = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $this->options
            );

            // Log de conexión exitosa (solo en desarrollo)
            if ($env === 'development') {
                error_log("✅ Conexión exitosa a MySQL ({$env}): {$config['database']}");
            }

        } catch (PDOException $e) {
            // Log del error
            error_log("❌ Error de conexión a MySQL: " . $e->getMessage());

            // En producción, no mostrar detalles del error
            if ($this->getEnvironment() === 'production') {
                throw new Exception("Error de conexión a la base de datos");
            } else {
                throw new Exception("Error de conexión: " . $e->getMessage());
            }
        }
    }

    /**
     * Obtener objeto PDO
     */
    public function getConnection()
    {
        return $this->pdo;
    }

    /**
     * Ejecutar query con prepared statements
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros para bind
     * @return PDOStatement
     */
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("❌ Error en query: " . $e->getMessage());
            error_log("SQL: " . $sql);
            throw new Exception("Error ejecutando consulta: " . $e->getMessage());
        }
    }

    /**
     * Ejecutar SELECT y retornar todos los resultados
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros
     * @return array
     */
    public function select($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Ejecutar SELECT y retornar un solo resultado
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros
     * @return array|false
     */
    public function selectOne($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Ejecutar INSERT y retornar ID insertado
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros
     * @return int ID del registro insertado
     */
    public function insert($sql, $params = [])
    {
        $this->query($sql, $params);
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Ejecutar UPDATE y retornar filas afectadas
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros
     * @return int Número de filas afectadas
     */
    public function update($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Ejecutar DELETE y retornar filas afectadas
     *
     * @param string $sql Query SQL
     * @param array $params Parámetros
     * @return int Número de filas afectadas
     */
    public function delete($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Iniciar transacción
     */
    public function beginTransaction()
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Confirmar transacción
     */
    public function commit()
    {
        return $this->pdo->commit();
    }

    /**
     * Revertir transacción
     */
    public function rollback()
    {
        return $this->pdo->rollBack();
    }

    /**
     * Verificar si hay una transacción activa
     */
    public function inTransaction()
    {
        return $this->pdo->inTransaction();
    }

    /**
     * Obtener último ID insertado
     */
    public function lastInsertId()
    {
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Contar registros de una tabla con condiciones opcionales
     *
     * @param string $table Nombre de la tabla
     * @param string $where Condición WHERE (opcional)
     * @param array $params Parámetros para bind
     * @return int
     */
    public function count($table, $where = '', $params = [])
    {
        $sql = "SELECT COUNT(*) as total FROM {$table}";
        if (! empty($where)) {
            $sql .= " WHERE {$where}";
        }

        $result = $this->selectOne($sql, $params);
        return (int) $result['total'];
    }

    /**
     * Verificar si existe un registro
     *
     * @param string $table Nombre de la tabla
     * @param string $where Condición WHERE
     * @param array $params Parámetros
     * @return bool
     */
    public function exists($table, $where, $params = [])
    {
        return $this->count($table, $where, $params) > 0;
    }

    /**
     * Cerrar conexión
     */
    public function close()
    {
        $this->pdo = null;
    }

    /**
     * Test de conexión (útil para debugging)
     */
    public function testConnection()
    {
        try {
            $stmt   = $this->pdo->query('SELECT 1 as test');
            $result = $stmt->fetch();
            return $result['test'] === 1;
        } catch (PDOException $e) {
            error_log("❌ Test de conexión falló: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener información de la base de datos
     */
    public function getDatabaseInfo()
    {
        try {
            $version = $this->selectOne("SELECT VERSION() as version");
            $env     = $this->getEnvironment();
            $config  = $this->config[$env];

            return [
                'connected'   => true,
                'environment' => $env,
                'host'        => $config['host'],
                'database'    => $config['database'],
                'version'     => $version['version'],
                'charset'     => $config['charset'],
            ];
        } catch (Exception $e) {
            return [
                'connected' => false,
                'error'     => $e->getMessage(),
            ];
        }
    }
}

// ====================================================
// FUNCIONES HELPER GLOBALES
// ====================================================

/**
 * Obtener instancia de Database
 *
 * @return Database
 */
function db()
{
    return Database::getInstance();
}

/**
 * Ejecutar query rápido
 *
 * @param string $sql
 * @param array $params
 * @return PDOStatement
 */
function db_query($sql, $params = [])
{
    return db()->query($sql, $params);
}

/**
 * SELECT múltiples registros
 *
 * @param string $sql
 * @param array $params
 * @return array
 */
function db_select($sql, $params = [])
{
    return db()->select($sql, $params);
}

/**
 * SELECT un solo registro
 *
 * @param string $sql
 * @param array $params
 * @return array|false
 */
function db_select_one($sql, $params = [])
{
    return db()->selectOne($sql, $params);
}

/**
 * INSERT rápido
 *
 * @param string $sql
 * @param array $params
 * @return int ID insertado
 */
function db_insert($sql, $params = [])
{
    return db()->insert($sql, $params);
}

/**
 * UPDATE rápido
 *
 * @param string $sql
 * @param array $params
 * @return int Filas afectadas
 */
function db_update($sql, $params = [])
{
    return db()->update($sql, $params);
}

/**
 * DELETE rápido
 *
 * @param string $sql
 * @param array $params
 * @return int Filas afectadas
 */
function db_delete($sql, $params = [])
{
    return db()->delete($sql, $params);
}

/**
 * Verificar conexión
 *
 * @return bool
 */
function db_test()
{
    return db()->testConnection();
}

// ====================================================
// AUTO-INICIALIZACIÓN
// ====================================================

// Inicializar conexión automáticamente cuando se incluya el archivo
try {
    Database::getInstance();
} catch (Exception $e) {
    // Manejar error de inicialización
    if (php_sapi_name() !== 'cli') {
        // Si no estamos en CLI, mostrar error
        http_response_code(500);
        if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
            // Si es una petición API, devolver JSON
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error'   => 'Error de conexión a la base de datos',
                'details' => Database::getInstance()->getEnvironment() === 'development' ? $e->getMessage() : null,
            ]);
        } else {
            // Si es HTML, mostrar página de error
            echo "<!DOCTYPE html>
            <html>
            <head>
                <title>Error de Conexión</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 50px; }
                    .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; }
                    h1 { color: #721c24; }
                </style>
            </head>
            <body>
                <div class='error'>
                    <h1>⚠️ Error de Conexión</h1>
                    <p>No se pudo establecer conexión con la base de datos.</p>
                    <p><strong>Verifica que:</strong></p>
                    <ul>
                        <li>MySQL está iniciado</li>
                        <li>Las credenciales son correctas</li>
                        <li>La base de datos existe</li>
                    </ul>
                </div>
            </body>
            </html>";
        }
        exit;
    }
}
