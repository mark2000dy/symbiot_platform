@echo off
echo ========================================
echo   SYMBIOT - Inicializacion Local
echo ========================================
echo.

echo [1/3] Verificando servicios AppServ...
net start Apache2.4 >nul 2>&1
if %errorlevel% neq 0 (
    echo Apache ya esta iniciado
) else (
    echo Apache iniciado
)

net start MySQL >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL ya esta iniciado
) else (
    echo MySQL iniciado
)

echo.
echo [2/3] Abriendo VSCode...
code .

echo.
echo [3/3] Abriendo navegador...
timeout /t 2 >nul
start http://localhost/symbiot/

echo.
echo ========================================
echo   Entorno listo!
echo ========================================
echo.
echo URLs disponibles:
echo - Landing: http://localhost/symbiot/
echo - Dashboard: http://localhost/symbiot/finance_manager/public/login.html
echo - phpMyAdmin: http://localhost/phpMyAdmin/
echo.
pause
```

---

### **9. CHECKLIST DE INSTALACIÓN**
```
□ AppServ 9.3.0 instalado
□ Servicios Apache y MySQL iniciados
□ VSCode instalado
□ Extensiones de VSCode instaladas
□ php.ini configurado correctamente
□ Carpeta del proyecto creada en htdocs
□ Virtual host configurado (opcional)
□ Base de datos "gastos_app_db" creada
□ Usuario "gastos_user" creado en MySQL
□ Archivo .vscode/settings.json creado
□ Git inicializado en el proyecto