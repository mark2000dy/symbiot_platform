/* ====================================================
   REPORTES INITIALIZATION MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/reportes-init.js
   Inicialización de la página de reportes
   ==================================================== */

console.log('📊 Cargando Reportes Init Module...');

// ============================================================
// 🌍 VARIABLES GLOBALES DE REPORTES
// ============================================================

let reportesInitialized = false;
let currentFilters = {
    empresa: '',
    ano: '2025',
    mes: '',
    tipo: ''
};

// ============================================================
// 🚀 FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ============================================================

/**
 * Inicializar página de reportes
 */
async function initializeReportes() {
    try {
        console.log('====================================================');
        console.log('🚀 INICIANDO SISTEMA DE REPORTES');
        console.log('====================================================');
        
        // FASE 1: Verificar autenticación
        console.log('📋 FASE 1: Verificando autenticación...');
        const isAuth = await verifyAuthenticationForReportes();
        if (!isAuth) {
            console.log('❌ Usuario no autenticado, redirigiendo...');
            window.location.href = '/gastos/login.html';
            return;
        }
        
        // FASE 2: Cargar y mostrar información del usuario
        console.log('📋 FASE 2: Cargando información del usuario...');
        await loadUserInfoForReportes();
        
        // FASE 3: Cargar empresas en filtro
        console.log('📋 FASE 3: Cargando empresas...');
        await loadCompaniesForFilter();
        
        // FASE 4: Cargar periodo de análisis dinámico
        console.log('📋 FASE 4: Calculando periodo de análisis...');
        await loadPeriodoAnalisis();
        
        // FASE 5: Cargar total de transacciones
        console.log('📋 FASE 5: Cargando total de transacciones...');
        await loadTotalTransacciones();
        
        // FASE 6: Actualizar fecha actual
        console.log('📋 FASE 6: Actualizando fecha...');
        updateCurrentDate();
        
        // FASE 7: Inicializar widget de Gastos Reales
        console.log('📋 FASE 7: Inicializando widget Gastos Reales...');
        if (typeof initializeGastosRealesWidget === 'function') {
            await initializeGastosRealesWidget();
        }

        // FASE 7.5: Inicializar widget de Balance General
        console.log('📋 FASE 7.5: Inicializando widget Balance General...');
        if (typeof initializeBalanceGeneralWidget === 'function') {
            await initializeBalanceGeneralWidget();
        }
        
        // FASE 8: Habilitar botón de exportar
        console.log('📋 FASE 8: Habilitando exportación...');
        enableExportButton();
        
        reportesInitialized = true;
        
        console.log('====================================================');
        console.log('✅ SISTEMA DE REPORTES INICIALIZADO CORRECTAMENTE');
        console.log('====================================================');
        
    } catch (error) {
        console.error('❌ Error crítico inicializando reportes:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando reportes: ' + error.message);
        }
    }
}

// ============================================================
// 🔐 FUNCIONES DE AUTENTICACIÓN Y USUARIO
// ============================================================

/**
 * Verificar autenticación para reportes
 */
async function verifyAuthenticationForReportes() {
    try {
        console.log('🔐 Verificando autenticación del usuario...');
        
        const response = await fetch('/gastos/api/user', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.user) {
                console.log(`✅ Usuario autenticado: ${data.user.nombre}`);
                return true;
            }
        }
        
        console.log('❌ Usuario no autenticado');
        return false;
        
    } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        return false;
    }
}

/**
 * Cargar información del usuario y actualizar UI
 */
async function loadUserInfoForReportes() {
    try {
        console.log('👤 Cargando información del usuario...');
        
        const response = await fetch('/gastos/api/user', {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error cargando usuario');
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            // Actualizar nombre de usuario en navbar
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = user.nombre || 'Usuario';
                console.log('✅ userName actualizado:', user.nombre);
            } else {
                console.warn('⚠️ Elemento userName no encontrado');
            }
            
            // Actualizar nombre de usuario en welcome banner
            const userNameDisplayElement = document.getElementById('userNameDisplay');
            if (userNameDisplayElement) {
                userNameDisplayElement.textContent = user.nombre || 'Usuario';
                console.log('✅ userNameDisplay actualizado:', user.nombre);
            } else {
                console.warn('⚠️ Elemento userNameDisplay no encontrado');
            }
            
            // Actualizar empresa si está disponible
            const userCompanyElement = document.getElementById('userCompany');
            if (userCompanyElement && user.empresa) {
                userCompanyElement.textContent = user.empresa;
                console.log('✅ userCompany actualizado:', user.empresa);
            }
            
            console.log('✅ Información del usuario cargada correctamente');
            return user;
        } else {
            throw new Error('Usuario no encontrado en respuesta');
        }
        
    } catch (error) {
        console.error('❌ Error cargando información del usuario:', error);
        throw error;
    }
}

/**
 * Actualizar fecha actual en welcome banner
 */
function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const now = new Date();
        currentDateElement.textContent = now.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        console.log('✅ Fecha actualizada');
    }
}

// ============================================================
// 📊 FUNCIONES DE CARGA DE DATOS
// ============================================================

/**
 * Cargar empresas para el filtro
 */
async function loadCompaniesForFilter() {
    try {
        console.log('🏢 Cargando empresas...');
        
        const response = await fetch('/gastos/api/empresas', {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error cargando empresas');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const selectElement = document.getElementById('filterEmpresa');
            if (selectElement) {
                // Limpiar opciones existentes excepto la primera
                selectElement.innerHTML = '<option value="">Todas las Empresas</option>';
                
                // Agregar empresas
                data.data.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.id;
                    option.textContent = empresa.nombre;
                    selectElement.appendChild(option);
                });
                
                console.log(`✅ ${data.data.length} empresas cargadas`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error cargando empresas:', error);
    }
}

/**
 * Cargar y calcular periodo de análisis dinámicamente
 */
async function loadPeriodoAnalisis() {
    try {
        console.log('📅 Calculando periodo de análisis...');
        
        const response = await fetch('/gastos/api/transacciones/rango-fechas', {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error obteniendo rango de fechas');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const { fecha_minima, fecha_maxima } = data.data;
            
            if (fecha_minima && fecha_maxima) {
                const fechaMin = new Date(fecha_minima);
                const fechaMax = new Date(fecha_maxima);
                
                const periodoText = `${fechaMin.getFullYear()} - ${fechaMax.getFullYear()}`;
                
                const periodoElement = document.getElementById('periodoAnalisis');
                if (periodoElement) {
                    periodoElement.innerHTML = `<span style="font-size: 1rem;">${periodoText}</span>`;
                }
                
                console.log(`✅ Periodo calculado: ${periodoText}`);
            } else {
                const periodoElement = document.getElementById('periodoAnalisis');
                if (periodoElement) {
                    periodoElement.innerHTML = `<span style="font-size: 0.8rem;">Sin datos</span>`;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error calculando periodo:', error);
        const periodoElement = document.getElementById('periodoAnalisis');
        if (periodoElement) {
            periodoElement.innerHTML = `<span style="font-size: 1rem;">N/A</span>`;
        }
    }
}

/**
 * Cargar total de transacciones
 */
async function loadTotalTransacciones() {
    try {
        console.log('🔢 Cargando total de transacciones...');
        
        const response = await fetch('/gastos/api/transacciones/count', {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error obteniendo total de transacciones');
        }
        
        const data = await response.json();
        
        if (data.success) {
            const total = data.data?.total || data.total || 0;
            
            const totalElement = document.getElementById('totalTransacciones');
            if (totalElement) {
                totalElement.textContent = total.toLocaleString('es-MX');
            }
            
            console.log(`✅ Total de transacciones: ${total}`);
        }
        
    } catch (error) {
        console.error('❌ Error cargando total de transacciones:', error);
        const totalElement = document.getElementById('totalTransacciones');
        if (totalElement) {
            totalElement.textContent = '0';
        }
    }
}

/**
 * Habilitar botón de exportar
 */
function enableExportButton() {
    const btnExport = document.getElementById('btnExportGlobal');
    if (btnExport) {
        btnExport.disabled = false;
        console.log('✅ Botón de exportar habilitado');
    }
}

// ============================================================
// 🔄 FUNCIONES DE FILTROS
// ============================================================

/**
 * Aplicar filtros y actualizar reportes
 */
async function applyFilters() {
    console.log('🔍 Aplicando filtros...');
    
    // Obtener valores actuales de filtros
    currentFilters.empresa = document.getElementById('filterEmpresa')?.value || '';
    currentFilters.ano = document.getElementById('filterAno')?.value || '';
    currentFilters.mes = document.getElementById('filterMes')?.value || '';
    currentFilters.tipo = document.getElementById('filterTipo')?.value || '';
    
    console.log('Filtros aplicados:', currentFilters);
    
    // Actualizar widget de Gastos Reales
    if (typeof loadGastosRealesData === 'function') {
        await loadGastosRealesData(currentFilters);
    }
    
    // Actualizar widget de Balance General
    if (typeof loadBalanceGeneralData === 'function') {
        await loadBalanceGeneralData(currentFilters);
    }
}

/**
 * Refrescar widget de Balance General
 */
async function refreshBalanceGeneral() {
    console.log('🔄 Refrescando widget Balance General...');
    
    if (typeof loadBalanceGeneralData === 'function') {
        await loadBalanceGeneralData(currentFilters);
        
        if (typeof showAlert === 'function') {
            showAlert('success', 'Balance General actualizado correctamente', 2000);
        }
    }
}

/**
 * Obtener filtros actuales
 */
function getCurrentFilters() {
    return { ...currentFilters };
}

// ============================================================
// 🔄 FUNCIONES DE REFRESH
// ============================================================

/**
 * Refrescar widget de Gastos Reales
 */
async function refreshGastosReales() {
    console.log('🔄 Refrescando widget Gastos Reales...');
    
    if (typeof loadGastosRealesData === 'function') {
        await loadGastosRealesData(currentFilters);
        
        if (typeof showAlert === 'function') {
            showAlert('success', 'Widget actualizado correctamente', 2000);
        }
    }
}

// ============================================================
// 📤 FUNCIONES DE EXPORTACIÓN
// ============================================================

/**
 * Exportar reporte actual a Excel
 */
function exportCurrentReport() {
    console.log('📤 Exportando reportes...');
    
    // Exportar ambos reportes
    if (typeof exportGastosRealesExcel === 'function') {
        exportGastosRealesExcel();
    }
    
    // Pequeño delay para el segundo archivo
    setTimeout(() => {
        if (typeof exportBalanceGeneralExcel === 'function') {
            exportBalanceGeneralExcel();
        }
    }, 500);
    
    if (typeof showAlert === 'function') {
        showAlert('success', 'Exportando reportes...', 2000);
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

window.initializeReportes = initializeReportes;
window.applyFilters = applyFilters;
window.refreshGastosReales = refreshGastosReales;
window.refreshBalanceGeneral = refreshBalanceGeneral;
window.exportCurrentReport = exportCurrentReport;
window.getCurrentFilters = getCurrentFilters;
window.loadUserInfoForReportes = loadUserInfoForReportes;
window.updateCurrentDate = updateCurrentDate;

// ============================================================
// 🚀 AUTO-INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado en reportes...');
    
    // Esperar a que los módulos se carguen
    setTimeout(() => {
        initializeReportes();
    }, 100);
});

console.log('✅ Reportes Init Module cargado');