<?php
    /**
     * ====================================================
     * DIAGNÓSTICO COMPLETO - SYMBIOT FINANCE MANAGER
     * Archivo: finance_manager/diagnostico.php
     *
     * Verifica todos los componentes necesarios para la conexión
     * ====================================================
     */

    error_reporting(E_ALL);
    ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico del Sistema</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }

        .section h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .check-item {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border-radius: 4px;
        }

        .check-icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 30px;
        }

        .check-label {
            flex: 1;
            font-weight: 500;
        }

        .check-value {
            font-family: 'Courier New', monospace;
            color: #7f8c8d;
            font-size: 14px;
        }

        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }

        .alert {
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .alert-error {
            background: #fee;
            border-left: 4px solid #e74c3c;
            color: #c0392b;
        }

        .alert-warning {
            background: #fef5e7;
            border-left: 4px solid #f39c12;
            color: #d68910;
        }

        .alert-success {
            background: #eafaf1;
            border-left: 4px solid #27ae60;
            color: #1e8449;
        }

        .code-block {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 5px;
            font-weight: 500;
        }

        .btn:hover {
            background: #2980b9;
        }

        .btn-success {
            background: #27ae60;
        }

        .btn-success:hover {
            background: #229954;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnóstico del Sistema</h1>
        <p class="subtitle">Verificación completa de componentes - Symbiot Finance Manager</p>

        <?php
            $errors   = [];
            $warnings = [];
            $allOk    = true;

            // ================================================
            // 1. VERIFICAR PHP Y EXTENSIONES
            // ================================================
            echo '<div class="section">';
            echo '<h2>1️⃣ PHP y Extensiones</h2>';

            // Versión de PHP
            $phpVersion = phpversion();
            $phpOk      = version_compare($phpVersion, '7.3.0', '>=');
            echo '<div class="check-item">';
            echo '<span class="check-icon ' . ($phpOk ? 'success' : 'error') . '">' . ($phpOk ? '✅' : '❌') . '</span>';
            echo '<span class="check-label">Versión de PHP</span>';
            echo '<span class="check-value">' . $phpVersion . ($phpOk ? ' (OK)' : ' (Requiere 7.4+)') . '</span>';
            echo '</div>';

            if (! $phpOk) {
                $errors[] = "PHP versión incorrecta. Se requiere 7.4 o superior.";
                $allOk    = false;
            }

            // Extensión PDO
            $pdoInstalled = extension_loaded('pdo');
            echo '<div class="check-item">';
            echo '<span class="check-icon ' . ($pdoInstalled ? 'success' : 'error') . '">' . ($pdoInstalled ? '✅' : '❌') . '</span>';
            echo '<span class="check-label">Extensión PDO</span>';
            echo '<span class="check-value">' . ($pdoInstalled ? 'Instalada' : 'NO INSTALADA') . '</span>';
            echo '</div>';

            if (! $pdoInstalled) {
                $errors[] = "PDO no está instalado. Es necesario para conectar a MySQL.";
                $allOk    = false;
            }

            // Extensión PDO MySQL
            $pdoMysqlInstalled = extension_loaded('pdo_mysql');
            echo '<div class="check-item">';
            echo '<span class="check-icon ' . ($pdoMysqlInstalled ? 'success' : 'error') . '">' . ($pdoMysqlInstalled ? '✅' : '❌') . '</span>';
            echo '<span class="check-label">Extensión PDO_MySQL</span>';
            echo '<span class="check-value">' . ($pdoMysqlInstalled ? 'Instalada' : 'NO INSTALADA') . '</span>';
            echo '</div>';

            if (! $pdoMysqlInstalled) {
                $errors[] = "PDO_MySQL no está instalado. Es necesario para conectar a MySQL.";
                $allOk    = false;
            }

            // Extensión MySQLi (alternativa)
            $mysqliInstalled = extension_loaded('mysqli');
            echo '<div class="check-item">';
            echo '<span class="check-icon ' . ($mysqliInstalled ? 'success' : 'warning') . '">' . ($mysqliInstalled ? '✅' : '⚠️') . '</span>';
            echo '<span class="check-label">Extensión MySQLi</span>';
            echo '<span class="check-value">' . ($mysqliInstalled ? 'Instalada' : 'No instalada') . '</span>';
            echo '</div>';

            echo '</div>';

            // ================================================
            // 2. VERIFICAR CONFIGURACIÓN DE PHP
            // ================================================
            echo '<div class="section">';
            echo '<h2>2️⃣ Configuración de PHP</h2>';

            // Display errors
            $displayErrors = ini_get('display_errors');
            echo '<div class="check-item">';
            echo '<span class="check-icon">ℹ️</span>';
            echo '<span class="check-label">Display Errors</span>';
            echo '<span class="check-value">' . ($displayErrors ? 'ON' : 'OFF') . '</span>';
            echo '</div>';

            // Error reporting
            $errorReporting = error_reporting();
            echo '<div class="check-item">';
            echo '<span class="check-icon">ℹ️</span>';
            echo '<span class="check-label">Error Reporting</span>';
            echo '<span class="check-value">' . $errorReporting . '</span>';
            echo '</div>';

            // Max execution time
            $maxExecutionTime = ini_get('max_execution_time');
            echo '<div class="check-item">';
            echo '<span class="check-icon">ℹ️</span>';
            echo '<span class="check-label">Max Execution Time</span>';
            echo '<span class="check-value">' . $maxExecutionTime . ' segundos</span>';
            echo '</div>';

            echo '</div>';

            // ================================================
            // 3. INTENTAR CONEXIÓN CON DIFERENTES CREDENCIALES
            // ================================================
            echo '<div class="section">';
            echo '<h2>3️⃣ Prueba de Conexión a MySQL</h2>';

            $credentialsToTest = [
                ['root', 'admin1234'],
                ['root', ''],
                ['root', 'mysql'],
                ['gastos_user', 'Gastos2025!'],
            ];

            $connectionSuccess  = false;
            $workingCredentials = null;

            foreach ($credentialsToTest as $credentials) {
                list($user, $pass) = $credentials;

                try {
                    $dsn = "mysql:host=localhost;charset=utf8mb4";
                    $pdo = new PDO($dsn, $user, $pass);

                    echo '<div class="check-item">';
                    echo '<span class="check-icon success">✅</span>';
                    echo '<span class="check-label">Usuario: <strong>' . htmlspecialchars($user) . '</strong></span>';
                    echo '<span class="check-value">Contraseña: ' . (empty($pass) ? '(vacía)' : '"' . str_repeat('*', strlen($pass)) . '"') . ' - FUNCIONA</span>';
                    echo '</div>';

                    $connectionSuccess  = true;
                    $workingCredentials = $credentials;
                    break;

                } catch (PDOException $e) {
                    echo '<div class="check-item">';
                    echo '<span class="check-icon error">❌</span>';
                    echo '<span class="check-label">Usuario: <strong>' . htmlspecialchars($user) . '</strong></span>';
                    echo '<span class="check-value">Contraseña: ' . (empty($pass) ? '(vacía)' : '"' . str_repeat('*', strlen($pass)) . '"') . ' - No funciona</span>';
                    echo '</div>';
                }
            }

            if (! $connectionSuccess) {
                $errors[] = "No se pudo conectar a MySQL con ninguna credencial común.";
                $allOk    = false;

                echo '<div class="alert alert-error" style="margin-top: 15px;">';
                echo '<strong>❌ Error:</strong> No se pudo conectar a MySQL con ninguna credencial probada.<br><br>';
                echo '<strong>Posibles causas:</strong><br>';
                echo '• MySQL no está iniciado en AppServ<br>';
                echo '• La contraseña de root es diferente<br>';
                echo '• PDO_MySQL no está habilitado en php.ini<br>';
                echo '</div>';
            } else {
                list($workingUser, $workingPass) = $workingCredentials;

                echo '<div class="alert alert-success" style="margin-top: 15px;">';
                echo '<strong>✅ Conexión exitosa con:</strong><br>';
                echo 'Usuario: <code>' . htmlspecialchars($workingUser) . '</code><br>';
                echo 'Contraseña: <code>' . (empty($workingPass) ? '(vacía)' : $workingPass) . '</code>';
                echo '</div>';
            }

            echo '</div>';

            // ================================================
            // 4. VERIFICAR BASE DE DATOS
            // ================================================
            if ($connectionSuccess) {
                echo '<div class="section">';
                echo '<h2>4️⃣ Verificar Base de Datos</h2>';

                try {
                    list($user, $pass) = $workingCredentials;
                    $dsn               = "mysql:host=localhost;charset=utf8mb4";
                    $pdo               = new PDO($dsn, $user, $pass);

                    // Listar bases de datos
                    $stmt      = $pdo->query("SHOW DATABASES");
                    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

                    $dbExists = in_array('gastos_app_db', $databases);

                    echo '<div class="check-item">';
                    echo '<span class="check-icon ' . ($dbExists ? 'success' : 'warning') . '">' . ($dbExists ? '✅' : '⚠️') . '</span>';
                    echo '<span class="check-label">Base de datos "gastos_app_db"</span>';
                    echo '<span class="check-value">' . ($dbExists ? 'EXISTE' : 'NO EXISTE') . '</span>';
                    echo '</div>';

                    if (! $dbExists) {
                        $warnings[] = "La base de datos 'gastos_app_db' no existe. Necesitas crearla.";

                        echo '<div class="alert alert-warning" style="margin-top: 15px;">';
                        echo '<strong>⚠️ Base de datos no encontrada</strong><br><br>';
                        echo 'Ejecuta este SQL en phpMyAdmin:<br>';
                        echo '<div class="code-block">';
                        echo 'CREATE DATABASE gastos_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;';
                        echo '</div>';
                        echo '</div>';
                    } else {
                        // Conectar a la base de datos específica
                        $dsn = "mysql:host=localhost;dbname=gastos_app_db;charset=utf8mb4";
                        $pdo = new PDO($dsn, $user, $pass);

                        // Listar tablas
                        $stmt   = $pdo->query("SHOW TABLES");
                        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

                        echo '<div class="check-item">';
                        echo '<span class="check-icon success">✅</span>';
                        echo '<span class="check-label">Tablas en la base de datos</span>';
                        echo '<span class="check-value">' . count($tables) . ' encontradas</span>';
                        echo '</div>';

                        if (count($tables) === 0) {
                            $warnings[] = "No hay tablas en la base de datos. Necesitas ejecutar el schema.sql";
                        }
                    }

                } catch (PDOException $e) {
                    echo '<div class="alert alert-error">';
                    echo '<strong>❌ Error al verificar base de datos:</strong><br>';
                    echo htmlspecialchars($e->getMessage());
                    echo '</div>';
                }

                echo '</div>';
            }

            // ================================================
            // 5. VERIFICAR ARCHIVO DE CONFIGURACIÓN
            // ================================================
            echo '<div class="section">';
            echo '<h2>5️⃣ Archivo de Configuración</h2>';

            $configFile   = __DIR__ . '/config/database.php';
            $configExists = file_exists($configFile);

            echo '<div class="check-item">';
            echo '<span class="check-icon ' . ($configExists ? 'success' : 'error') . '">' . ($configExists ? '✅' : '❌') . '</span>';
            echo '<span class="check-label">Archivo database.php</span>';
            echo '<span class="check-value">' . ($configExists ? 'Existe' : 'NO ENCONTRADO') . '</span>';
            echo '</div>';

            if (! $configExists) {
                $errors[] = "El archivo config/database.php no existe.";
                $allOk    = false;
            } else {
                $configReadable = is_readable($configFile);

                echo '<div class="check-item">';
                echo '<span class="check-icon ' . ($configReadable ? 'success' : 'error') . '">' . ($configReadable ? '✅' : '❌') . '</span>';
                echo '<span class="check-label">Permisos de lectura</span>';
                echo '<span class="check-value">' . ($configReadable ? 'OK' : 'SIN PERMISOS') . '</span>';
                echo '</div>';

                if ($workingCredentials && $configReadable) {
                    list($workingUser, $workingPass) = $workingCredentials;

                    echo '<div class="alert alert-warning" style="margin-top: 15px;">';
                    echo '<strong>📝 Configuración recomendada para database.php:</strong><br><br>';
                    echo 'En la sección <code>\'development\'</code>, usa estas credenciales:<br>';
                    echo '<div class="code-block">';
                    echo "'development' => [<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'host'     => 'localhost',<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'port'     => '3306',<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'database' => 'gastos_app_db',<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'username' => '" . htmlspecialchars($workingUser) . "',<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'password' => '" . htmlspecialchars($workingPass) . "',<br>";
                    echo "&nbsp;&nbsp;&nbsp;&nbsp;'charset'  => 'utf8mb4'<br>";
                    echo "],";
                    echo '</div>';
                    echo '</div>';
                }
            }

            echo '</div>';

            // ================================================
            // RESUMEN FINAL
            // ================================================
            echo '<div class="section" style="border-left-color: ' . ($allOk && count($warnings) === 0 ? '#27ae60' : ($allOk ? '#f39c12' : '#e74c3c')) . ';">';
            echo '<h2>📋 Resumen</h2>';

            if (count($errors) > 0) {
                echo '<div class="alert alert-error">';
                echo '<strong>❌ Errores críticos encontrados:</strong><br><ul style="margin: 10px 0 0 20px;">';
                foreach ($errors as $error) {
                    echo '<li>' . htmlspecialchars($error) . '</li>';
                }
                echo '</ul></div>';
            }

            if (count($warnings) > 0) {
                echo '<div class="alert alert-warning">';
                echo '<strong>⚠️ Advertencias:</strong><br><ul style="margin: 10px 0 0 20px;">';
                foreach ($warnings as $warning) {
                    echo '<li>' . htmlspecialchars($warning) . '</li>';
                }
                echo '</ul></div>';
            }

            if ($allOk && count($warnings) === 0) {
                echo '<div class="alert alert-success">';
                echo '<strong>✅ ¡Todo está configurado correctamente!</strong><br>';
                echo 'El sistema está listo para usarse.';
                echo '</div>';
            }

            echo '</div>';
        ?>

        <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost/phpMyAdmin/" target="_blank" class="btn">
                📊 Abrir phpMyAdmin
            </a>
            <?php if ($connectionSuccess): ?>
            <a href="test-connection.php" class="btn btn-success">
                ✅ Ir a Test de Conexión
            </a>
            <?php endif; ?>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #7f8c8d; font-size: 14px;">
            <p>Symbiot Finance Manager - Diagnóstico v1.0</p>
        </div>
    </div>
</body>
</html>