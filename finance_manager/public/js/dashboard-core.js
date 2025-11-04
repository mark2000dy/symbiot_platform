/* ====================================================
   DASHBOARD CORE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-core.js
   Variables globales y funciones base extraídas de dashboard.html
   SIN MODIFICACIONES - Solo reorganización modular
   ==================================================== */

// ============================================================
// 🌐 VARIABLES GLOBALES PRINCIPALES
// ============================================================

// Usuario y sesión
let currentUser = null;

// Paginación general
let currentPage = 1;

// Filtro de empresa actual
// let currentCompanyFilter = null; // Declarada en stats module

// ============================================================
// 🎓 VARIABLES PARA GESTIÓN DE ALUMNOS
// ============================================================

// Datos de alumnos
let studentsData = [];                    // Datos de la página actual desde el servidor
let currentStudentsPage = 1;              // Página actual
let studentsPerPage = 10;                 // Registros por página
let totalStudentsPages = 1;               // Total de páginas desde el servidor
let totalStudentsRecords = 0;             // Total de registros desde el servidor

// Variables para filtros actuales
let currentStudentFilters = {
    teacherFilter: '',
    statusFilter: '',
    instrumentFilter: '',
    paymentFilter: ''
};

// Datos de distribución de clases
let classDistributionData = [];

console.log('🎓 Variables globales de alumnos inicializadas');

// ============================================================
// 💰 VARIABLES PARA TRANSACCIONES
// ============================================================

// Paginación de transacciones
const transactionsPerPage = 10;

// Estado para edición desde dashboard y cache temporal de transacciones
window.editingTransactionId = null;
window.recentTransactionsCache = [];

// Modal de transacciones
let addTransactionModalInstance = null;

// ============================================================
// 🏢 VARIABLES PARA FILTRO DE EMPRESA
// ============================================================

// Datos específicos de RockstarSkull
let rockstarStudentsData = [];

// ============================================================
// ⚙️ CONFIGURACIONES Y CONSTANTES
// ============================================================

// Configuración de alertas de pagos
const PAYMENT_ALERT_CONFIG = {
    UPCOMING_DAYS: 3,        // Días para considerar "próximo a vencer"
    OVERDUE_DAYS: 5,         // Días para considerar "vencido"
    AUTO_REFRESH: 60000      // Auto-refresh cada 60 segundos
};

// Configuración de paginación
const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
    SHOW_PAGE_INFO: true
};

// Configuración de formularios
const FORM_CONFIG = {
    AUTO_SAVE_DELAY: 2000,   // Auto-save después de 2 segundos
    VALIDATION_DELAY: 500,   // Validación después de 500ms
    MAX_RETRIES: 3           // Máximo 3 reintentos en caso de error
};

// ============================================================
// 🎨 CONFIGURACIÓN DE UI
// ============================================================

// Clases CSS para diferentes estados
const UI_CLASSES = {
    LOADING: 'loading-spinner',
    EMPTY: 'empty-state',
    ERROR: 'error-state',
    SUCCESS: 'success-state'
};

// Iconos para diferentes tipos de clase musical
const CLASS_ICONS = {
    'Guitarra': 'fas fa-guitar',
    'Teclado': 'fas fa-piano-keyboard', 
    'Batería': 'fas fa-drum-steelpan',
    'Bajo': 'fas fa-guitar',
    'Canto': 'fas fa-microphone-alt'
};

// Colores para diferentes tipos de clase
const CLASS_COLORS = {
    'Guitarra': 'primary',
    'Teclado': 'success', 
    'Batería': 'warning',
    'Bajo': 'info',
    'Canto': 'secondary'
};

// Estados de pago y sus colores
const PAYMENT_STATUS = {
    CURRENT: { class: 'success', label: 'Al Corriente', icon: 'check-circle' },
    UPCOMING: { class: 'warning', label: 'Próximo a Vencer', icon: 'clock' },
    OVERDUE: { class: 'danger', label: 'Vencido', icon: 'exclamation-triangle' },
    INACTIVE: { class: 'secondary', label: 'Inactivo', icon: 'minus-circle' }
};

// ============================================================
// 🔧 FUNCIONES UTILITARIAS BÁSICAS
// ============================================================

/**
 * Función para mostrar alertas en el dashboard
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en milisegundos (opcional)
 */
function showAlert(type, message, duration = 5000) {
    // Buscar contenedor de alertas existente o crear uno
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '9999';
        document.body.appendChild(alertContainer);
    }

    // Crear elemento de alerta
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.style.minWidth = '300px';
    alertElement.style.marginBottom = '10px';
    
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Agregar al contenedor
    alertContainer.appendChild(alertElement);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            if (alertElement && alertElement.parentNode) {
                alertElement.remove();
            }
        }, duration);
    }

    console.log(`📢 Alerta ${type}: ${message}`);
}

/**
 * Función para formatear moneda mexicana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como moneda
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Función para formatear fechas en español
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
function formatDate(date) {
    if (!date) return 'Sin fecha';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Función para calcular días entre fechas
 * @param {Date} fromDate - Fecha inicial
 * @param {Date} toDate - Fecha final
 * @returns {number} - Número de días
 */
function daysBetweenDates(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    // Usar UTC para evitar problemas de zona horaria
    const fromUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    
    return Math.round((toUTC - fromUTC) / (24 * 60 * 60 * 1000));
}

/**
 * Función para obtener el icono de una clase musical
 * @param {string} clase - Nombre de la clase
 * @returns {string} - Clase CSS del icono
 */
function getClassIcon(clase) {
    return CLASS_ICONS[clase] || 'fas fa-music';
}

/**
 * Función para obtener el color de una clase musical
 * @param {string} clase - Nombre de la clase
 * @returns {string} - Clase CSS del color
 */
function getClassColor(clase) {
    return CLASS_COLORS[clase] || 'primary';
}

/**
 * Función para actualizar la fecha actual en el dashboard
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/Mexico_City'
        };
        dateElement.textContent = now.toLocaleDateString('es-MX', options);
    }
}

/**
 * Función para debug - Log con timestamp
 * @param {string} message - Mensaje a mostrar
 * @param {any} data - Datos adicionales (opcional)
 */
function debugLog(message, data = null) {
    const timestamp = new Date().toLocaleTimeString('es-MX');
    if (data) {
        console.log(`[${timestamp}] ${message}`, data);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}

// Exponer función globalmente
window.formatCurrency = formatCurrency;

// ============================================================
// 🚀 INICIALIZACIÓN DE VARIABLES GLOBALES
// ============================================================

// Marcar que el core está cargado
window.dashboardCoreLoaded = true;

debugLog('✅ Dashboard Core cargado - Variables globales inicializadas');

// Exportar funciones principales para otros módulos
window.showAlert = showAlert;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.daysBetweenDates = daysBetweenDates;
window.getClassIcon = getClassIcon;
window.getClassColor = getClassColor;
window.updateCurrentDate = updateCurrentDate;
window.debugLog = debugLog;