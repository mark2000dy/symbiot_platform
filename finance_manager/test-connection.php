<?php
    /**
     * ====================================================
     * TEST DE CONEXIÓN - SYMBIOT FINANCE MANAGER
     * Archivo: finance_manager/test-connection.php
     *
     * Verificar que la conexión a MySQL funciona correctamente
     * Acceder en: http://localhost/symbiot/finance_manager/test-connection.php
     * ====================================================
     */

    // Incluir configuración de base de datos
    require_once __DIR__ . '/config/database.php';

    // Configurar errores para mostrarlos
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Conexión - Symbiot Finance Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .test-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .test-section h2 {
            color: #495057;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }

        .test-section h2::before {
            content: '🔍';
            margin-right: 10px;
            font-size: 24px;
        }

        .result {
            background: white;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }

        .result.error {
            border-left-color: #dc3545;
            background: #fff5f5;
        }

        .result.warning {
            border-left-color: #ffc107;
            background: #fffdf0;
        }

        .label {
            font-weight: bold;
            color: #495057;
            display: inline-block;
            min-width: 150px;
        }

        .value {
            color: #28a745;
            font-family: 'Courier New', monospace;
        }

        .value.error {
            color: #dc3545;
        }

        .icon-success {
            color: #28a745;
            margin-right: 8px;
        }

        .icon-error {
            color: #dc3545;
            margin-right: 8px;
        }

        .icon-warning {
            color: #ffc107;
            margin-right: 8px;
        }

        .tables-list {
            background: white;
            border-radius: 4px;
            padding: 15px;
            margin-top: 10px;
        }

        .tables-list ul {
            list-style: none;
            padding-left: 0;
        }

        .tables-list li {
            padding: 8px;
            border-bottom: 1px solid #e9ecef;
        }

        .tables-list li:last-child {
            border-bottom: none;
        }

        .tables-list li::before {
            content: '📋';
            margin-right: 10px;
        }

        .btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
        }

        .btn:hover {
            background: #5568d3;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-badge.success {
            background: #d4edda;
            color: #155724;
        }

        .status-badge.error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔌 Test de Conexión</h1>
        <p class="subtitle">Symbiot Finance Manager - Database Connection</p>

        <?php
            try {
                // Obtener instancia de base de datos
                $db = Database::getInstance();

                // Test 1: Verificar conexión básica
                echo '<div class="test-section">';
                echo '<h2>Conexión a MySQL</h2>';

                if ($db->testConnection()) {
                    echo '<div class="result">';
                    echo '<span class="icon-success">✅</span>';
                    echo '<span class="label">Estado:</span>';
                    echo '<span class="value">Conectado exitosamente</span>';
                    echo '</div>';
                } else {
                    echo '<div class="result error">';
                    echo '<span class="icon-error">❌</span>';
                    echo '<span class="label">Estado:</span>';
                    echo '<span class="value error">Error de conexión</span>';
                    echo '</div>';
                }

                // Test 2: Información de la base de datos
                $info = $db->getDatabaseInfo();

                echo '<div class="result">';
                echo '<span class="label">Entorno:</span>';
                $envBadge = $info['environment'] === 'production'
                    ? '<span class="status-badge error">PRODUCCIÓN</span>'
                    : '<span class="status-badge success">DESARROLLO</span>';
                echo '<span class="value">' . htmlspecialchars($info['environment']) . ' ' . $envBadge . '</span>';
                echo '</div>';

                echo '<div class="result">';
                echo '<span class="label">Host:</span>';
                echo '<span class="value">' . htmlspecialchars($info['host']) . '</span>';
                echo '</div>';

                echo '<div class="result">';
                echo '<span class="label">Base de datos:</span>';
                echo '<span class="value">' . htmlspecialchars($info['database']) . '</span>';
                echo '</div>';

                echo '<div class="result">';
                echo '<span class="label">Versión MySQL:</span>';
                echo '<span class="value">' . htmlspecialchars($info['version']) . '</span>';
                echo '</div>';

                echo '<div class="result">';
                echo '<span class="label">Charset:</span>';
                echo '<span class="value">' . htmlspecialchars($info['charset']) . '</span>';
                echo '</div>';

                echo '</div>';

                // Test 3: Listar tablas existentes
                echo '<div class="test-section">';
                echo '<h2>Tablas en la Base de Datos</h2>';

                $tables = $db->select("SHOW TABLES");

                if (count($tables) > 0) {
                    echo '<div class="result">';
                    echo '<span class="icon-success">✅</span>';
                    echo '<span class="label">Total de tablas:</span>';
                    echo '<span class="value">' . count($tables) . '</span>';
                    echo '</div>';

                    echo '<div class="tables-list">';
                    echo '<ul>';
                    foreach ($tables as $table) {
                        $tableName = array_values($table)[0];

                        // Contar registros en la tabla
                        try {
                            $count       = $db->selectOne("SELECT COUNT(*) as total FROM `{$tableName}`");
                            $recordCount = $count['total'];
                            echo '<li><strong>' . htmlspecialchars($tableName) . '</strong> ';
                            echo '<span style="color: #6c757d;">(' . $recordCount . ' registros)</span></li>';
                        } catch (Exception $e) {
                            echo '<li><strong>' . htmlspecialchars($tableName) . '</strong> ';
                            echo '<span style="color: #dc3545;">(error al contar)</span></li>';
                        }
                    }
                    echo '</ul>';
                    echo '</div>';

                    // Verificar tablas requeridas
                    $requiredTables = ['empresas', 'usuarios', 'transacciones', 'maestros', 'alumnos'];
                    $existingTables = array_map(function ($t) {return array_values($t)[0];}, $tables);

                    $missingTables = array_diff($requiredTables, $existingTables);

                    if (count($missingTables) > 0) {
                        echo '<div class="result warning" style="margin-top: 15px;">';
                        echo '<span class="icon-warning">⚠️</span>';
                        echo '<span class="label">Tablas faltantes:</span>';
                        echo '<span class="value" style="color: #856404;">' . implode(', ', $missingTables) . '</span>';
                        echo '</div>';

                        echo '<div class="result warning">';
                        echo '<p><strong>💡 Solución:</strong> Ejecuta el archivo <code>database/schema.sql</code> en phpMyAdmin para crear las tablas necesarias.</p>';
                        echo '</div>';
                    } else {
                        echo '<div class="result" style="margin-top: 15px;">';
                        echo '<span class="icon-success">✅</span>';
                        echo '<span class="label">Tablas requeridas:</span>';
                        echo '<span class="value">Todas presentes</span>';
                        echo '</div>';
                    }
                } else {
                    echo '<div class="result warning">';
                    echo '<span class="icon-warning">⚠️</span>';
                    echo '<span class="label">Estado:</span>';
                    echo '<span class="value" style="color: #856404;">No hay tablas en la base de datos</span>';
                    echo '</div>';

                    echo '<div class="result warning">';
                    echo '<p><strong>💡 Acción requerida:</strong> Necesitas ejecutar el archivo <code>database/schema.sql</code> para crear las tablas.</p>';
                    echo '<p>Puedes hacerlo desde <a href="http://localhost/phpMyAdmin/" target="_blank">phpMyAdmin</a></p>';
                    echo '</div>';
                }

                echo '</div>';

                // Test 4: Test de operaciones CRUD básicas
                echo '<div class="test-section">';
                echo '<h2>Test de Operaciones</h2>';

                // Test de funciones helper
                $helperTest = db_test();
                if ($helperTest) {
                    echo '<div class="result">';
                    echo '<span class="icon-success">✅</span>';
                    echo '<span class="label">Funciones helper:</span>';
                    echo '<span class="value">Funcionando correctamente</span>';
                    echo '</div>';
                }

                // Test de transacciones
                $transactionTest = true;
                try {
                    $db->beginTransaction();
                    $db->rollback();
                    echo '<div class="result">';
                    echo '<span class="icon-success">✅</span>';
                    echo '<span class="label">Soporte de transacciones:</span>';
                    echo '<span class="value">Disponible</span>';
                    echo '</div>';
                } catch (Exception $e) {
                    echo '<div class="result error">';
                    echo '<span class="icon-error">❌</span>';
                    echo '<span class="label">Soporte de transacciones:</span>';
                    echo '<span class="value error">Error: ' . htmlspecialchars($e->getMessage()) . '</span>';
                    echo '</div>';
                }

                echo '</div>';

                // Resumen final
                echo '<div class="test-section" style="background: #d4edda; border: 2px solid #28a745;">';
                echo '<h2 style="color: #155724;">✅ Conexión Exitosa</h2>';
                echo '<p style="color: #155724; margin-top: 10px;">';
                echo 'La base de datos está configurada correctamente y lista para usar.';
                echo '</p>';

                if (count($missingTables ?? []) > 0) {
                    echo '<p style="color: #856404; margin-top: 10px; font-weight: bold;">';
                    echo '⚠️ Recuerda ejecutar el script de schema para crear las tablas faltantes.';
                    echo '</p>';
                }

                echo '</div>';

            } catch (Exception $e) {
                // Error general
                echo '<div class="test-section" style="background: #f8d7da; border: 2px solid #dc3545;">';
                echo '<h2 style="color: #721c24;">❌ Error de Conexión</h2>';
                echo '<div class="result error">';
                echo '<span class="icon-error">❌</span>';
                echo '<span class="label">Error:</span><br>';
                echo '<span class="value error">' . htmlspecialchars($e->getMessage()) . '</span>';
                echo '</div>';

                echo '<div class="result warning">';
                echo '<h3>🔧 Posibles soluciones:</h3>';
                echo '<ul style="margin-top: 10px; padding-left: 20px;">';
                echo '<li>Verifica que MySQL esté iniciado en AppServ</li>';
                echo '<li>Revisa las credenciales en <code>config/database.php</code></li>';
                echo '<li>Asegúrate de que la base de datos <code>gastos_app_db</code> existe</li>';
                echo '<li>Verifica el usuario <code>root</code> y su contraseña</li>';
                echo '</ul>';
                echo '</div>';
                echo '</div>';
            }
        ?>

        <div style="text-align: center;">
            <a href="http://localhost/phpMyAdmin/" target="_blank" class="btn">
                📊 Abrir phpMyAdmin
            </a>
            <a href="public/login.html" class="btn" style="margin-left: 10px;">
                🔐 Ir al Login
            </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
            <p>Symbiot Finance Manager v1.0</p>
            <p>© 2025 Symbiot Technologies</p>
        </div>
    </div>
</body>
</html>