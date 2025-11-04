/* ====================================================
   DASHBOARD API MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-api.js
   Funciones de comunicación con backend centralizadas
   ==================================================== */

// ============================================================
// 🌐 FUNCIONES BASE DE API
// ============================================================

/**
 * Función base para realizar peticiones HTTP
 */
async function apiRequest(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ API Response: ${url}`, data);
        
        return data;
        
    } catch (error) {
        console.error(`❌ API Error: ${url}`, error);
        throw error;
    }
}

/**
 * Realizar petición GET
 */
async function apiGet(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return await apiRequest(fullUrl, { method: 'GET' });
}

/**
 * Realizar petición POST
 */
async function apiPost(url, data = {}) {
    return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Realizar petición PUT
 */
async function apiPut(url, data = {}) {
    return await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Realizar petición DELETE
 */
async function apiDelete(url) {
    return await apiRequest(url, { method: 'DELETE' });
}

// ============================================================
// 👤 FUNCIONES DE AUTENTICACIÓN Y USUARIO
// ============================================================

/**
 * Cargar información del usuario actual
 */
async function loadCurrentUser() {
    try {
        console.log('👤 Cargando información del usuario...');
        
        const response = await apiGet('/gastos/api/me');
        
        if (response.success && response.user) {
            currentUser = response.user;
            
            // Actualizar UI con información del usuario
            const userNameElements = document.querySelectorAll('#userName, #userNameDisplay');
            userNameElements.forEach(element => {
                if (element) element.textContent = currentUser.nombre;
            });
            
            console.log(`✅ Usuario cargado: ${currentUser.nombre} (${currentUser.rol})`);
            
            return currentUser;
        } else {
            throw new Error('No se pudo obtener información del usuario');
        }
        
    } catch (error) {
        console.error('❌ Error cargando usuario:', error);
        
        // Redireccionar al login si no hay sesión válida
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            window.location.href = '/gastos/login.html';
        }
        
        throw error;
    }
}

/**
 * Verificar si el usuario es administrador
 */
function isUserAdmin() {
    return currentUser && currentUser.rol === 'admin';
}

/**
 * Cerrar sesión
 */
async function logout() {
    try {
        await apiPost('/gastos/api/logout');
        window.location.href = '/gastos/login.html';
    } catch (error) {
        console.error('❌ Error cerrando sesión:', error);
        // Forzar redirección al login aunque falle la API
        window.location.href = '/gastos/login.html';
    }
}

// ============================================================
// 📊 FUNCIONES DE DATOS DEL DASHBOARD
// ============================================================

/**
 * Cargar estadísticas principales del dashboard
 */
async function loadDashboardStats(empresaId = null) {
    try {
        console.log('📊 Cargando estadísticas del dashboard...');
        
        const params = {};
        if (empresaId) {
            params.empresa_id = empresaId;
        }
        
        const response = await apiGet('/gastos/api/dashboard', params);
        
        if (response.success) {
            // Actualizar elementos del DOM
            updateStatsElements(response.data);
            
            console.log('✅ Estadísticas del dashboard cargadas');
            return response.data;
        } else {
            throw new Error(response.message || 'Error cargando estadísticas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        
        // Mostrar valores por defecto en caso de error
        resetStatsElements();
        
        throw error;
    }
}

/**
 * Actualizar elementos de estadísticas en el DOM
 */
function updateStatsElements(data) {
    const elements = {
        'balanceTotal': data.balance_general || 0,
        'totalIngresos': data.total_ingresos || 0,
        'totalGastos': data.total_gastos || 0,
        'esteMes': data.balance_mes_actual || 0
    };
    
    Object.entries(elements).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = formatCurrency(value);
        }
    });
}

/**
 * Resetear elementos de estadísticas a valores por defecto
 */
function resetStatsElements() {
    const elements = ['balanceTotal', 'totalIngresos', 'totalGastos', 'esteMes'];
    
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '$0.00';
        }
    });
}

/**
 * Cargar estadísticas específicas de empresa
 */
async function loadCompanyStats(companyId) {
    try {
        if (!companyId) {
            // Si no hay empresa seleccionada, cargar stats generales
            return await loadDashboardStats();
        }
        
        console.log(`🏢 Cargando estadísticas de empresa ${companyId}...`);
        
        const response = await apiGet('/gastos/api/dashboard', { empresa_id: companyId });
        
        if (response.success) {
            // Actualizar stats de empresa en el selector
            updateCompanyStatsElements(response.data);
            
            // Actualizar stats principales
            updateStatsElements(response.data);
            
            console.log(`✅ Estadísticas de empresa ${companyId} cargadas`);
            return response.data;
        } else {
            throw new Error(response.message || 'Error cargando estadísticas de empresa');
        }
        
    } catch (error) {
        console.error('❌ Error cargando estadísticas de empresa:', error);
        throw error;
    }
}

/**
 * Actualizar elementos de estadísticas de empresa
 */
function updateCompanyStatsElements(data) {
    const balanceElement = document.getElementById('companyBalance');
    const transactionsElement = document.getElementById('companyTransactions');
    
    if (balanceElement) {
        balanceElement.textContent = formatCurrency(data.balance_general || 0);
    }
    
    if (transactionsElement) {
        transactionsElement.textContent = data.total_transacciones || 0;
    }
}

// ============================================================
// 🏢 FUNCIONES DE EMPRESAS
// ============================================================

/**
 * Cargar lista de empresas
 */
async function loadCompanies() {
    try {
        console.log('🏢 Cargando empresas...');
        
        const response = await apiGet('/gastos/api/empresas');
        
        if (response.success) {
            console.log(`✅ ${response.data.length} empresas cargadas`);
            return response.data;
        } else {
            throw new Error(response.message || 'Error cargando empresas');
        }
        
    } catch (error) {
        console.error('❌ Error cargando empresas:', error);
        throw error;
    }
}

/**
 * Cargar empresas para modales
 */
async function loadCompaniesForModal() {
    try {
        const empresas = await loadCompanies();
        
        const selectElement = document.getElementById('transactionCompany');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Selecciona empresa</option>';
            
            empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nombre;
                selectElement.appendChild(option);
            });
            
            console.log('✅ Empresas cargadas en modal de transacciones');
        }
        
    } catch (error) {
        console.error('❌ Error cargando empresas para modal:', error);
    }
}

// ============================================================
// 💰 FUNCIONES DE TRANSACCIONES
// ============================================================

/**
 * Cargar transacciones recientes
 */
async function loadRecentTransactions(page = 1) {
    try {
        console.log(`💰 Cargando transacciones recientes - Página ${page}...`);
        
        const params = {
            page: page,
            limit: transactionsPerPage
        };
        
        if (currentCompanyFilter) {
            params.empresa_id = currentCompanyFilter;
        }
        
        const response = await apiGet('/gastos/api/transacciones', params);
        
        if (response.success) {
            // Actualizar cache de transacciones
            window.recentTransactionsCache = response.data;
            
            // Renderizar transacciones
            renderRecentTransactions(response.data, response.pagination);
            
            console.log(`✅ ${response.data.length} transacciones cargadas`);
            return response.data;
        } else {
            throw new Error(response.message || 'Error cargando transacciones');
        }
        
    } catch (error) {
        console.error('❌ Error cargando transacciones:', error);
        
        // Mostrar estado de error
        showTransactionsError('Error cargando transacciones recientes');
        
        throw error;
    }
}

/**
 * Crear nueva transacción
 */
async function createTransaction(transactionData) {
    try {
        console.log('💰 Creando nueva transacción...', transactionData);
        
        const response = await apiPost('/gastos/api/transacciones', transactionData);
        
        if (response.success) {
            console.log('✅ Transacción creada exitosamente');
            
            // 🔥 CRÍTICO: Si es un ingreso (pago), actualizar alertas
            if (transactionData.tipo === 'I') {
                console.log('🔄 Refrescando alertas de pagos...');
                
                // Esperar 500ms para que la base de datos se actualice
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refrescar alertas de pagos
                if (typeof window.refreshPaymentAlerts === 'function') {
                    await window.refreshPaymentAlerts();
                }
                
                // Refrescar estadísticas del dashboard
                if (typeof window.loadDashboardData === 'function') {
                    await window.loadDashboardData();
                }
            }
            
            return response;
        } else {
            throw new Error(response.message || 'Error creando transacción');
        }
        
    } catch (error) {
        console.error('❌ Error creando transacción:', error);
        throw error;
    }
}

/**
 * Actualizar transacción existente
 */
async function updateTransaction(transactionId, transactionData) {
    try {
        console.log(`💰 Actualizando transacción ${transactionId}...`, transactionData);
        
        const response = await apiPut(`/gastos/api/transacciones/${transactionId}`, transactionData);
        
        if (response.success) {
            console.log('✅ Transacción actualizada exitosamente');
            return response;
        } else {
            throw new Error(response.message || 'Error actualizando transacción');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando transacción:', error);
        throw error;
    }
}

/**
 * Eliminar transacción
 */
async function deleteTransaction(transactionId) {
    try {
        console.log(`💰 Eliminando transacción ${transactionId}...`);
        
        const response = await apiDelete(`/gastos/api/transacciones/${transactionId}`);
        
        if (response.success) {
            console.log('✅ Transacción eliminada exitosamente');
            
            // 🔥 CRÍTICO: Actualizar estadísticas PRIMERO
            if (typeof window.loadDashboardData === 'function') {
                await window.loadDashboardData();
            }
            
            // 🔥 CRÍTICO: Luego actualizar lista de transacciones
            if (typeof window.loadRecentTransactions === 'function') {
                const pageToLoad = window.currentPage || 1;
                await window.loadRecentTransactions(pageToLoad);
            }
            
            return response;
        } else {
            throw new Error(response.message || 'Error eliminando transacción');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando transacción:', error);
        throw error;
    }
}

// ============================================================
// 🎓 FUNCIONES DE ALUMNOS (API)
// ============================================================

/**
 * Cargar lista de alumnos con filtros y paginación
 */
async function loadStudentsData(page = 1, filters = {}) {
    try {
        console.log(`🎓 Cargando alumnos vía API - Página ${page}...`);
        
        const params = {
            page: page,
            limit: studentsPerPage,
            empresa_id: currentCompanyFilter || 1
        };
        
        // Agregar filtros
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params[key] = filters[key];
            }
        });
        
        const response = await apiGet('/gastos/api/alumnos', params);
        
        if (response.success) {
            console.log(`✅ ${response.data.length} alumnos cargados vía API`);
            return response;
        } else {
            throw new Error(response.message || 'Error cargando alumnos');
        }
        
    } catch (error) {
        console.error('❌ Error cargando alumnos vía API:', error);
        throw error;
    }
}

/**
 * Crear nuevo alumno
 */
async function createStudent(studentData) {
    try {
        console.log('🎓 Creando nuevo alumno vía API...', studentData);
        
        const response = await apiPost('/gastos/api/alumnos', studentData);
        
        if (response.success) {
            console.log('✅ Alumno creado exitosamente vía API');
            return response;
        } else {
            throw new Error(response.message || 'Error creando alumno');
        }
        
    } catch (error) {
        console.error('❌ Error creando alumno vía API:', error);
        throw error;
    }
}

/**
 * Actualizar alumno existente
 */
async function updateStudent(studentId, studentData) {
    try {
        console.log(`🎓 Actualizando alumno ${studentId} vía API...`, studentData);
        
        const response = await apiPut(`/gastos/api/alumnos/${studentId}`, studentData);
        
        if (response.success) {
            console.log('✅ Alumno actualizado exitosamente vía API');
            return response;
        } else {
            throw new Error(response.message || 'Error actualizando alumno');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando alumno vía API:', error);
        throw error;
    }
}

/**
 * Eliminar alumno
 */
async function deleteStudent(studentId) {
    try {
        console.log(`🎓 Eliminando alumno ${studentId} vía API...`);
        
        const response = await apiDelete(`/gastos/api/alumnos/${studentId}`);
        
        if (response.success) {
            console.log('✅ Alumno eliminado exitosamente vía API');
            return response;
        } else {
            throw new Error(response.message || 'Error eliminando alumno');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando alumno vía API:', error);
        throw error;
    }
}

// ============================================================
// 🔔 FUNCIONES DE ALERTAS DE PAGOS (API)
// ============================================================

/**
 * Cargar alertas de pagos
 */
async function loadPaymentAlerts(empresaId = null) {
    try {
        console.log('🔔 Cargando alertas de pagos vía API...');
        
        const params = {};
        if (empresaId) {
            params.empresa_id = empresaId;
        }
        
        const response = await apiGet('/gastos/api/alertas-pagos', params);
        
        if (response.success) {
            console.log('✅ Alertas de pagos cargadas vía API');
            return response.data;
        } else {
            throw new Error(response.message || 'Error cargando alertas de pagos');
        }
        
    } catch (error) {
        console.error('❌ Error cargando alertas de pagos vía API:', error);
        throw error;
    }
}

// ============================================================
// 🛠️ FUNCIONES DE UTILIDAD Y MANEJO DE ERRORES
// ============================================================

/**
 * Manejar errores de API de forma centralizada
 */
function handleApiError(error, context = 'Operación') {
    console.error(`❌ Error en ${context}:`, error);
    
    let userMessage = 'Ha ocurrido un error inesperado';
    
    if (error.message.includes('401')) {
        userMessage = 'Tu sesión ha expirado. Redirigiendo al login...';
        setTimeout(() => {
            window.location.href = '/gastos/login.html';
        }, 2000);
    } else if (error.message.includes('403')) {
        userMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.message.includes('404')) {
        userMessage = 'El recurso solicitado no fue encontrado';
    } else if (error.message.includes('500')) {
        userMessage = 'Error interno del servidor. Intenta nuevamente';
    } else if (error.message) {
        userMessage = error.message;
    }
    
    showAlert('danger', userMessage);
    
    return {
        success: false,
        error: userMessage,
        originalError: error
    };
}

/**
 * Validar respuesta de API
 */
function validateApiResponse(response, context = 'API') {
    if (!response) {
        throw new Error(`${context}: Respuesta vacía del servidor`);
    }
    
    if (typeof response !== 'object') {
        throw new Error(`${context}: Formato de respuesta inválido`);
    }
    
    if (response.success === false) {
        throw new Error(response.message || response.error || `${context}: Error no especificado`);
    }
    
    return true;
}

/**
 * Reintentar petición de API en caso de fallo
 */
async function retryApiRequest(apiFunction, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Intento ${attempt} de ${maxRetries}...`);
            const result = await apiFunction();
            console.log(`✅ Éxito en intento ${attempt}`);
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Fallo en intento ${attempt}:`, error.message);
            
            if (attempt < maxRetries) {
                console.log(`⏱️ Esperando ${delay}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Incrementar delay exponencialmente
            }
        }
    }
    
    console.error(`❌ Todos los intentos fallaron. Último error:`, lastError);
    throw lastError;
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones base de API
window.apiRequest = apiRequest;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiDelete = apiDelete;

// Funciones de autenticación
window.loadCurrentUser = loadCurrentUser;
window.isUserAdmin = isUserAdmin;
window.logout = logout;

// Funciones de dashboard
window.loadDashboardStats = loadDashboardStats;
window.loadCompanyStats = loadCompanyStats;
window.loadCompanies = loadCompanies;
window.loadCompaniesForModal = loadCompaniesForModal;

// Funciones de transacciones
window.loadRecentTransactions = loadRecentTransactions;
window.createTransaction = createTransaction;
window.updateTransaction = updateTransaction;
window.deleteTransaction = deleteTransaction;

// Funciones de alumnos (API)
window.loadStudentsData = loadStudentsData;
window.createStudent = createStudent;
window.updateStudent = updateStudent;

// Funciones de alertas
window.loadPaymentAlerts = loadPaymentAlerts;

// Funciones de utilidad
window.handleApiError = handleApiError;
window.validateApiResponse = validateApiResponse;
window.retryApiRequest = retryApiRequest;

console.log('✅ Dashboard API Module cargado - Todas las funciones de API disponibles');