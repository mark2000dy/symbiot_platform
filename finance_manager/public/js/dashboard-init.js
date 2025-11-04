/* ====================================================
   DASHBOARD INIT MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-init.js
   Inicialización y orquestación final del dashboard
   ==================================================== */

// ============================================================
// 🚀 INICIALIZACIÓN PRINCIPAL DEL DASHBOARD
// ============================================================

/**
 * Función principal de inicialización del dashboard
 */
async function initializeDashboard() {
    try {
        console.log('🚀 Iniciando Sistema Dashboard - Symbiot Financial Manager');
        console.log('====================================================');

        // CORRECCIÓN: Usar variable global del stats module
let     currentCompanyFilter = window.currentCompanyFilter || '';

        // ✅ NUEVO: Restaurar filtro desde localStorage
        function restoreCompanyFilter() {
            try {
                const savedFilter = localStorage.getItem('dashboardCompanyFilter');
                if (savedFilter !== null) {
                    window.currentCompanyFilter = savedFilter;
                    currentCompanyFilter = savedFilter;
                    
                    const companySelect = document.getElementById('companyFilter');
                    if (companySelect) {
                        companySelect.value = savedFilter;
                        console.log(`📂 Filtro restaurado desde localStorage: ${savedFilter || 'Todas'}`);
                        return savedFilter;
                    }
                }
            } catch (e) {
                console.warn('⚠️ No se pudo leer localStorage:', e);
            }
            return '';
        }

        // Restaurar filtro guardado
        const restoredFilter = restoreCompanyFilter();
        
        // Verificar que los módulos están cargados
        if (!verifyModulesLoaded()) {
            throw new Error('No todos los módulos requeridos están cargados');
        }
        
        // Mostrar indicador de carga inicial
        showInitializationLoader();
        
        // FASE 1: Autenticación y seguridad
        console.log('📋 FASE 1: Verificando autenticación...');
        const isAuthenticated = await requireAuthentication();
        if (!isAuthenticated) {
            return; // Se redirige al login automáticamente
        }
        
        // FASE 2: Cargar información del usuario
        console.log('📋 FASE 2: Cargando información del usuario...');
        await loadAndDisplayUserInfo();

        // FASE 2.5: Asegurar que stats module esté completamente cargado
        console.log('📋 FASE 2.5: Verificando módulo Stats...');
        let statsRetries = 0;
        while (typeof window.loadCompanyFilterFromURL !== 'function' && statsRetries < 10) {
            console.log(`⏳ Esperando módulo Stats... (intento ${statsRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            statsRetries++;
        }

        if (typeof window.loadCompanyFilterFromURL !== 'function') {
            console.warn('⚠️ loadCompanyFilterFromURL no disponible después de esperar');
        }

        // FASE 3: Inicializar selector de empresa
        //console.log('📋 FASE 3: Inicializando selector de empresa...');
        //initializeCompanySelector();
        
        // FASE 4: Configurar filtros desde URL (con verificación)
        if (typeof window.loadCompanyFilterFromURL === 'function') {
            window.loadCompanyFilterFromURL();
        } else {
            console.warn('⚠️ loadCompanyFilterFromURL no disponible, omitiendo configuración de URL');
        }

        // CORRECCIÓN NAVEGACIÓN: Verificar y recargar datos perdidos
        setTimeout(async () => {
            const balanceElement = document.getElementById('balanceTotal');
            if (balanceElement && balanceElement.textContent === '$0.00') {
                console.log('🔄 Datos perdidos por navegación, recargando...');
                await window.loadDashboardData();
                
                if (window.currentCompanyFilter === '1') {
                    if (typeof window.loadRockstarSkullDataReal === 'function') {
                        await window.loadRockstarSkullDataReal();
                    }
                }
            }
        }, 2000);

        // FASE 5: Cargar datos del dashboard con verificación
        console.log('📋 FASE 5: Cargando datos del dashboard...');
        let dataLoadRetries = 0;
        while (dataLoadRetries < 5) {
            try {
                if (typeof loadDashboardData === 'function') {
                    await loadDashboardData();
                    console.log('✅ Datos del dashboard cargados exitosamente');
                    break;
                } else {
                    console.log(`⏳ Esperando módulo Stats... (intento ${dataLoadRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    dataLoadRetries++;
                }
            } catch (error) {
                console.error('❌ Error en carga de datos:', error);
                dataLoadRetries++;
                if (dataLoadRetries < 5) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        // FASE 5: Inicializar modales y UI
        console.log('📋 FASE 4: Inicializando interfaz de usuario...');
        initializeModals();
        setupEventListeners();
        
       // FASE 6: Cargar datos principales
        console.log('📋 FASE 5: Cargando datos del dashboard...');
        await loadDashboardData();

        // ✅ NUEVO: Si es RockstarSkull, cargar sus datos específicos
        if (window.currentCompanyFilter === '1') {
            console.log('🎸 Detectado filtro RockstarSkull, cargando datos específicos...');
            
            if (typeof window.loadRockstarSkullDataReal === 'function') {
                await window.loadRockstarSkullDataReal();
            }
            
            if (typeof window.refreshPaymentAlerts === 'function') {
                await window.refreshPaymentAlerts();
            }
            
            if (typeof loadStudentsList === 'function') {
                await loadStudentsList(1);
            }
            
            console.log('✅ Datos de RockstarSkull cargados tras navegación');
        }

        // CORRECCIÓN NAVEGACIÓN: Verificar si los datos se cargaron correctamente
        setTimeout(async () => {
            const balanceElement = document.getElementById('balanceTotal');
            if (balanceElement && (balanceElement.textContent === '$0.00' || balanceElement.innerHTML.includes('spinner'))) {
                console.log('🔄 Datos no cargados correctamente, reintentando...');
                await loadDashboardData();
                
                // Si sigue siendo RockstarSkull, forzar carga de datos específicos
                if (window.currentCompanyFilter === '1') {
                    if (typeof window.loadRockstarSkullDataReal === 'function') {
                        await window.loadRockstarSkullDataReal();
                    }
                }
            }
        }, 1500);

        // FASE 7: FORZAR CARGA INICIAL DE DATOS
        console.log('🔋 FASE 7: Cargando datos iniciales...');
        await forcedDataInitialization();

        // FASE 8: VERIFICACIÓN FINAL DE DATOS
        setTimeout(async () => {
            console.log('🔄 Verificación final de datos...');
            await verifyDataIntegrity();
        }, 2000);
        
        // FASE 9: Cargar transacciones recientes
        console.log('📋 FASE 6: Cargando transacciones recientes...');
        if (typeof loadRecentTransactions === 'function') {
            await loadRecentTransactions(1);
            // CORRECCIÓN: Debug de elementos DOM de transacciones
            const transactionsElements = {
                tbody: document.getElementById('transactionsBody') || document.getElementById('tableBody'),
                table: document.getElementById('transactionsTable') || document.querySelector('.table-responsive'),
                empty: document.getElementById('emptyState')
            };

            console.log('🔍 Elementos de transacciones encontrados:', {
                tbody: !!transactionsElements.tbody,
                table: !!transactionsElements.table,
                empty: !!transactionsElements.empty
            });

            if (!transactionsElements.tbody) {
                console.error('❌ CRÍTICO: Elemento tbody de transacciones no encontrado');
            }
        } else {
            console.warn('⚠️ Función loadRecentTransactions no disponible');
        }
        
        // FASE 10: Inicializar módulos específicos
        console.log('📋 FASE 7: Inicializando módulos específicos...');
        await initializeSpecificModules();

        // ✅ CORRECCIÓN: Cargar lista de alumnos cuando es RockstarSkull
        if ((currentCompanyFilter === '1' || !currentCompanyFilter) && typeof loadStudentsList === 'function') {
            console.log('🎓 Cargando lista inicial de alumnos...');
            await loadStudentsList(1);
        }
        
        // FASE 11: Configurar actualizaciones automáticas
        console.log('📋 FASE 8: Configurando actualizaciones automáticas...');
        setupAutoRefreshSystems();
        
        // FASE 12: Configurar monitoreo de sesión
        console.log('📋 FASE 9: Iniciando monitoreo de sesión...');
        startSessionMonitoring();
        
        // FASE 13: Finalización
        console.log('📋 FASE 10: Finalizando inicialización...');
        await finalizeDashboardSetup();

        // CORRECCIÓN CRÍTICA: Forzar carga inicial de datos
        console.log('🔄 Ejecutando carga forzada inicial...');
        try {
            await window.loadDashboardData();
            console.log('✅ Datos iniciales cargados exitosamente');
        } catch (error) {
            console.error('❌ Error carga inicial:', error);
            // Reintentar una vez más después de 1 segundo
            setTimeout(async () => {
                try {
                    await window.loadDashboardData();
                } catch (retryError) {
                    console.error('❌ Error en reintento:', retryError);
                }
            }, 1000);
        }
        
        // Ocultar loader y mostrar dashboard
        hideInitializationLoader();
        
        console.log('✅ Dashboard inicializado completamente');
        console.log('====================================================');
        
        // Mostrar mensaje de bienvenida
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Error crítico inicializando dashboard:', error);
        handleInitializationError(error);
    }
}

/**
 * Verificar que todos los módulos necesarios están cargados
 */
function verifyModulesLoaded() {
    console.log('🔍 Verificando módulos cargados...');
    
    const requiredModules = [
        { name: 'Core', check: () => window.dashboardCoreLoaded },
        { name: 'API', check: () => typeof window.apiRequest === 'function' },
        { name: 'Auth', check: () => typeof window.checkAuthentication === 'function' },
        { name: 'Stats', check: () => typeof window.loadDashboardData === 'function' && typeof window.loadCompanyFilterFromURL === 'function' },
        { name: 'Transactions', check: () => typeof window.loadRecentTransactions === 'function' },
        { name: 'Students', check: () => typeof window.loadStudentsList === 'function' },
        { name: 'Payments', check: () => typeof window.refreshPaymentAlerts === 'function' },
        { name: 'Modals', check: () => true } // Se inicializa en este archivo
    ];
    
    const missingModules = [];
    
    requiredModules.forEach(module => {
        try {
            if (module.check()) {
                console.log(`✅ Módulo ${module.name}: Cargado`);
            } else {
                console.error(`❌ Módulo ${module.name}: Faltante`);
                missingModules.push(module.name);
            }
        } catch (error) {
            console.error(`❌ Módulo ${module.name}: Error - ${error.message}`);
            missingModules.push(module.name);
        }
    });
    
    if (missingModules.length > 0) {
        console.error(`❌ Módulos faltantes: ${missingModules.join(', ')}`);
        return false;
    }
    
    console.log('✅ Todos los módulos requeridos están disponibles');
    return true;
}

/**
 * Mostrar loader de inicialización
 */
function showInitializationLoader() {
    const loader = document.createElement('div');
    loader.id = 'dashboardInitLoader';
    loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loader.style.cssText = `
        background: rgba(25, 28, 36, 0.95);
        z-index: 9999;
        backdrop-filter: blur(10px);
    `;
    
    loader.innerHTML = `
        <div class="text-center text-white">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <h5 class="mb-2">
                <i class="fas fa-chart-line me-2"></i>
                Symbiot Financial Manager
            </h5>
            <p class="text-muted mb-0" id="initStatus">Iniciando sistema...</p>
            <div class="progress mt-3" style="width: 300px;">
                <div id="initProgress" class="progress-bar bg-primary" style="width: 0%"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
}

/**
 * Ocultar loader de inicialización
 */
function hideInitializationLoader() {
    const loader = document.getElementById('dashboardInitLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 500);
    }
}

/**
 * Forzar inicialización de datos críticos
 */
async function forcedDataInitialization() {
    try {
        console.log('💪 Forzando carga de datos críticos...');
        
        // Asegurar que currentCompanyFilter esté definido
        if (typeof window.currentCompanyFilter === 'undefined') {
            window.currentCompanyFilter = '';
        }
        
        // Cargar datos principales con reintentos
        let retries = 0;
        while (retries < 3) {
            try {
                await window.loadDashboardData();
                console.log('✅ loadDashboardData() ejecutado exitosamente');
                break;
            } catch (error) {
                retries++;
                console.warn(`⚠️ Reintento ${retries} de loadDashboardData():`, error);
                if (retries < 3) await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Cargar datos de RockstarSkull si es empresa 1
        if (window.currentCompanyFilter === '1' || !window.currentCompanyFilter) {
            retries = 0;
            while (retries < 3) {
                try {
                    if (typeof window.loadRockstarSkullData === 'function') {
                        await window.loadRockstarSkullData();
                        console.log('✅ loadRockstarSkullData() ejecutado exitosamente');
                    }
                    break;
                } catch (error) {
                    retries++;
                    console.warn(`⚠️ Reintento ${retries} de loadRockstarSkullData():`, error);
                    if (retries < 3) await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error en forcedDataInitialization:', error);
    }
}

/**
 * Verificar integridad de datos después de la inicialización
 */
async function verifyDataIntegrity() {
    try {
        console.log('🔍 Verificando integridad de datos...');
        
        // Verificar elementos principales
        const criticalElements = [
            'balanceTotal', 'totalIngresos', 'totalGastos', 'esteMes',
            'totalStudents', 'activeStudents', 'currentStudents', 'pendingStudents'
        ];
        
        let elementsWithZero = 0;
        criticalElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                const value = element.textContent.trim();
                if (value === '$0.00' || value === '0' || value.includes('spinner')) {
                    elementsWithZero++;
                    console.warn(`⚠️ Elemento ${elementId} tiene valor: ${value}`);
                }
            }
        });
        
        // Si muchos elementos están en 0, recargar datos
        if (elementsWithZero > 4) {
            console.warn('🔄 Demasiados elementos en 0, recargando datos...');
            await forcedDataInitialization();
        } else {
            console.log('✅ Integridad de datos verificada correctamente');
        }
        
    } catch (error) {
        console.error('❌ Error verificando integridad:', error);
    }
}

/**
 * Actualizar progreso de inicialización
 */
function updateInitProgress(phase, percentage) {
    const statusElement = document.getElementById('initStatus');
    const progressElement = document.getElementById('initProgress');
    
    if (statusElement) {
        statusElement.textContent = phase;
    }
    
    if (progressElement) {
        progressElement.style.width = `${percentage}%`;
    }
}

/**
 * Configurar event listeners globales
 
function setupEventListeners() {
    console.log('🎧 Configurando event listeners...');
    
    try {
        // Listener para actualizar fecha actual cada minuto
        setInterval(updateCurrentDate, 60000);
        
        // Listener para detectar cambios de visibilidad de la página
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Listener para detectar cambios de conexión
        window.addEventListener('online', handleConnectionChange);
        window.addEventListener('offline', handleConnectionChange);
        
        // Listener para manejar errores no capturados
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // Listener para shortcuts de teclado
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('✅ Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
    }
}*/

/**
 * Inicializar módulos específicos según la empresa
 */
async function initializeSpecificModules() {
    try {
        updateInitProgress('Inicializando módulos específicos...', 70);
        
        // Cargar empresas para modales
        await loadCompaniesForModal();
        
        // Configurar listeners de cálculo
        setupCalculationListeners();

        // Inicializar modales de estudiantes (si la función existe)
        if (typeof initializeStudentModals === 'function') {
            initializeStudentModals();
        } else {
            console.log('ℹ️ Función initializeStudentModals no disponible');
        }
        
        // ⭐ SIEMPRE inicializar filtros de alumnos (independientemente del widget)
        console.log('🎓 Inicializando filtros de alumnos...');
        await initializeStudentsModule();

        // Solo cargar datos si el widget está visible
        if ((currentCompanyFilter === '1' || !currentCompanyFilter) && document.getElementById('studentsContainer')) {
            console.log('📊 Widget de alumnos visible, cargando lista...');
            // Widget existe, no hacer nada adicional aquí
            // loadStudentsList() se ejecuta desde handleCompanyChange() 
            
            // Inicializar alertas de pagos solo si existe el contenedor
            if (document.getElementById('paymentAlertsContainer')) {
                console.log('💰 Inicializando módulo de alertas de pagos...');
                await initializePaymentAlerts();
            }
        }
        
        console.log('✅ Módulos específicos inicializados');
        
    } catch (error) {
        console.error('❌ Error inicializando módulos específicos:', error);
    }
}

/**
 * Configurar sistemas de actualización automática
 */
function setupAutoRefreshSystems() {
    try {
        console.log('🔄 Configurando actualizaciones automáticas...');
        
        // Auto-refresh de estadísticas cada 5 minutos
        startStatsAutoRefresh();
        
        console.log('✅ Sistemas de auto-refresh configurados');
        
    } catch (error) {
        console.error('❌ Error configurando auto-refresh:', error);
    }
}

/**
 * Finalizar configuración del dashboard
 */
async function finalizeDashboardSetup() {
    try {
        // Actualizar fecha actual si no se hizo antes
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement && !currentDateElement.textContent.includes('2025')) {
            const now = new Date();
            const dateOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDateElement.textContent = now.toLocaleDateString('es-ES', dateOptions);
        }

        // CORRECCIÓN: Ocultar campo "Alumnos Activos" por defecto
        const companyStudentsContainer = document.querySelector('#companyStudents').closest('.col-md-3');
        if (companyStudentsContainer) {
            companyStudentsContainer.style.display = 'none';
        }

        updateInitProgress('Finalizando configuración...', 90);
        
        // Establecer fecha actual
        updateCurrentDate();
        
        // Configurar preferencias del usuario si existen
        loadUserPreferences();
        
        // Verificar y mostrar widgets específicos de la empresa
        handleCompanySpecificSetup();
        
        updateInitProgress('Completado', 100);
        
        console.log('✅ Configuración del dashboard finalizada');
        
    } catch (error) {
        console.error('❌ Error finalizando configuración:', error);
    }
}

/**
 * Configurar elementos específicos según la empresa seleccionada
 */
function handleCompanySpecificSetup() {
    const rockstarWidgets = document.getElementById('rockstarSkullWidgets');
    
    if (currentCompanyFilter === '1') {
        // Mostrar widgets de RockstarSkull
        if (rockstarWidgets) {
            rockstarWidgets.style.display = 'block';
        }
        if (typeof showRockstarSkullIndicators === 'function') {
            showRockstarSkullIndicators();
        }
        
        // Cargar lista de alumnos solo si existe el contenedor
        if (typeof loadStudentsList === 'function' && document.getElementById('studentsTableContainer')) {
            loadStudentsList(1);
        }
    } else {
        // Ocultar widgets específicos
        if (rockstarWidgets) {
            rockstarWidgets.style.display = 'none';
        }
        if (typeof hideRockstarSkullIndicators === 'function') {
            hideRockstarSkullIndicators();
        }
    }
}

// ============================================================
// 🎯 FUNCIONES DE MANEJO DE EVENTOS
// ============================================================

/**
 * Manejar cambios de visibilidad de la página
 */
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('👁️ Página visible - Verificando actualizaciones...');
        
        // Actualizar datos cuando la página vuelve a ser visible
        setTimeout(async () => {
            try {
                await loadDashboardData();
                await loadRecentTransactions(currentPage);
            } catch (error) {
                console.error('❌ Error actualizando datos al volver a la página:', error);
            }
        }, 1000);
    }
}

/**
 * Manejar cambios de conexión
 */
function handleConnectionChange() {
    if (navigator.onLine) {
        console.log('🌐 Conexión restaurada');
        showAlert('success', 'Conexión a internet restaurada', 3000);
        
        // Recargar datos al restaurar conexión
        setTimeout(() => {
            loadDashboardData();
        }, 2000);
    } else {
        console.log('📡 Conexión perdida');
        showAlert('warning', 'Sin conexión a internet. Algunos datos podrían no estar actualizados.', 5000);
    }
}

/**
 * Manejar errores globales no capturados
 */
function handleGlobalError(event) {
    console.error('❌ Error global capturado:', event.error);
    
    // No mostrar alerts para todos los errores para evitar spam
    // Solo registrar en consola para debugging
}

/**
 * Manejar promesas rechazadas no capturadas
 */
function handleUnhandledRejection(event) {
    console.error('❌ Promesa rechazada no capturada:', event.reason);
    
    // Prevenir que el error se muestre en consola del navegador
    event.preventDefault();
}

/**
 * Manejar shortcuts de teclado
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Actualizar dashboard
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        console.log('⌨️ Shortcut: Actualizando dashboard...');
        loadDashboardData();
        showAlert('info', 'Dashboard actualizado', 2000);
    }
    
    // Ctrl/Cmd + N: Nueva transacción (si tiene permisos)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        if (hasPermission('create_transaction')) {
            console.log('⌨️ Shortcut: Abriendo nueva transacción...');
            showAddTransactionModal();
        }
    }
    
    // ESC: Cerrar modales abiertos
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
}

// ============================================================
// 💾 FUNCIONES DE PREFERENCIAS DE USUARIO
// ============================================================

/**
 * Cargar preferencias del usuario
 */
function loadUserPreferences() {
    try {
        const savedPreferences = localStorage.getItem('dashboardPreferences');
        
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            // Aplicar filtro de empresa guardado
            if (preferences.companyFilter && !currentCompanyFilter) {
                currentCompanyFilter = preferences.companyFilter;
                const companySelect = document.getElementById('companyFilter');
                if (companySelect) {
                    companySelect.value = preferences.companyFilter;
                }
            }
            
            console.log('✅ Preferencias de usuario cargadas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando preferencias:', error);
    }
}

/**
 * Guardar preferencias del usuario
 */
function saveUserPreferences() {
    try {
        const preferences = {
            companyFilter: currentCompanyFilter,
            lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem('dashboardPreferences', JSON.stringify(preferences));
        console.log('✅ Preferencias guardadas');
        
    } catch (error) {
        console.error('❌ Error guardando preferencias:', error);
    }
}

// ============================================================
// 🎉 FUNCIONES DE MENSAJES Y FEEDBACK
// ============================================================

/**
 * Mostrar mensaje de bienvenida
 */
function showWelcomeMessage() {
    if (currentUser) {
        const timeOfDay = getTimeOfDayGreeting();
        showAlert('success', `${timeOfDay}, ${currentUser.nombre}! Dashboard cargado correctamente.`, 4000);
    }
}

/**
 * Obtener saludo según la hora del día
 */
function getTimeOfDayGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return 'Buenos días';
    } else if (hour < 18) {
        return 'Buenas tardes';
    } else {
        return 'Buenas noches';
    }
}

/**
 * Manejar errores de inicialización
 */
function handleInitializationError(error) {
    console.error('❌ Error crítico de inicialización:', error);
    
    hideInitializationLoader();
    
    // Mostrar mensaje de error al usuario
    const errorContainer = document.createElement('div');
    errorContainer.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    errorContainer.style.cssText = `
        background: rgba(25, 28, 36, 0.95);
        z-index: 9999;
        backdrop-filter: blur(10px);
    `;
    
    errorContainer.innerHTML = `
        <div class="text-center text-white">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h4 class="mb-3">Error de Inicialización</h4>
            <p class="text-muted mb-4">
                Hubo un problema cargando el dashboard.<br>
                Por favor, recarga la página o contacta al administrador.
            </p>
            <div class="d-flex gap-3 justify-content-center">
                <button class="btn btn-primary" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Recargar Página
                </button>
                <button class="btn btn-secondary" onclick="window.location.href='/gastos/login.html'">
                    <i class="fas fa-sign-out-alt me-2"></i>Ir al Login
                </button>
            </div>
            <div class="mt-4">
                <small class="text-muted">Error: ${error.message}</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorContainer);
}

/**
 * Inicializar modales del sistema
 */
function initializeModals() {
    console.log('🎭 Inicializando modales...');
    
    // Verificar que Bootstrap esté disponible
    if (typeof bootstrap === 'undefined') {
        console.error('❌ Bootstrap no está disponible');
        return;
    }
    
    // Inicializar modal de transacciones si existe
    const addTransactionModal = document.getElementById('addTransactionModal');
    if (addTransactionModal) {
        addTransactionModalInstance = new bootstrap.Modal(addTransactionModal);
        console.log('✅ Modal de transacciones inicializado');
    }
    
    console.log('✅ Modales inicializados');
}

/**
 * Configurar event listeners globales
 */
function setupEventListeners() {
    console.log('🎧 Configurando event listeners...');
    
    try {
        // Listener para actualizar fecha actual cada minuto
        setInterval(updateCurrentDate, 60000);
        
        // Listener para detectar cambios de visibilidad de la página
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Listener para detectar cambios de conexión
        window.addEventListener('online', handleConnectionChange);
        window.addEventListener('offline', handleConnectionChange);
        
        // Listener para manejar errores no capturados
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // Listener para shortcuts de teclado
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('✅ Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
    }
}

/**
 * Cargar empresas para modales
 */
async function loadCompaniesForModal() {
    try {
        console.log('🏢 Cargando empresas para modales...');
        
        // Por ahora usar empresas predefinidas
        const companies = [
            { id: 1, name: 'Rockstar Skull' },
            { id: 2, name: 'Symbiot Technologies' }
        ];
        
        // Actualizar selects de empresa en modales si existen
        const companySelects = document.querySelectorAll('#transactionCompany, #editTransactionCompany');
        companySelects.forEach(select => {
            if (select) {
                const optionsHTML = companies.map(company => 
                    `<option value="${company.id}">${company.name}</option>`
                ).join('');
                select.innerHTML = '<option value="">Seleccionar empresa...</option>' + optionsHTML;
            }
        });
        
        console.log('✅ Empresas cargadas en modales');
        
    } catch (error) {
        console.error('❌ Error cargando empresas:', error);
    }
}

/**
 * Configurar listeners de cálculo
 */
function setupCalculationListeners() {
    console.log('🧮 Configurando listeners de cálculo...');
    
    // Configurar cálculo automático en modal de transacciones
    const quantityInput = document.getElementById('transactionQuantity');
    const unitPriceInput = document.getElementById('transactionUnitPrice');
    
    if (quantityInput && unitPriceInput) {
        [quantityInput, unitPriceInput].forEach(input => {
            input.addEventListener('input', calculateTotal);
            input.addEventListener('change', calculateTotal);
        });
        console.log('✅ Listeners de cálculo configurados');
    }
}

/**
 * Calcular total de transacción
 */
function calculateTotal() {
    const quantity = parseFloat(document.getElementById('transactionQuantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('transactionUnitPrice')?.value) || 0;
    const total = quantity * unitPrice;
    
    const totalElement = document.getElementById('transactionTotal');
    if (totalElement) {
        totalElement.value = formatCurrency(total);
    }
}

/**
 * Inicializar alertas de pagos
 */
async function initializePaymentAlerts() {
    try {
        console.log('💰 Inicializando módulo de alertas de pagos...');
        
        // Verificar si la función de refreshPaymentAlerts existe
        if (typeof refreshPaymentAlerts === 'function') {
            await refreshPaymentAlerts();
            console.log('✅ Alertas de pagos inicializadas');
        } else {
            console.warn('⚠️ Función refreshPaymentAlerts no disponible');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando alertas de pagos:', error);
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES Y INICIALIZACIÓN
// ============================================================

// Funciones principales
window.initializeDashboard = initializeDashboard;
window.saveUserPreferences = saveUserPreferences;
window.loadUserPreferences = loadUserPreferences;

// Funciones faltantes críticas
window.initializeModals = initializeModals;
window.setupEventListeners = setupEventListeners;
window.loadCompaniesForModal = loadCompaniesForModal;
window.setupCalculationListeners = setupCalculationListeners;
window.calculateTotal = calculateTotal;
window.initializePaymentAlerts = initializePaymentAlerts;

// Event listeners para cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando dashboard...');
    
    // Pequeño delay para asegurar que todos los scripts están cargados
    setTimeout(() => {
        initializeDashboard();
    }, 100);
});

// Guardar preferencias al salir de la página
window.addEventListener('beforeunload', function() {
    try {
        saveUserPreferences();
    } catch (error) {
        console.error('❌ Error guardando preferencias al salir:', error);
    }
});

console.log('✅ Dashboard Init Module cargado - Sistema listo para inicializar');