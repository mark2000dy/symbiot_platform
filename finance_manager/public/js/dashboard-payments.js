/* ====================================================
   DASHBOARD PAYMENTS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-payments.js
   Widget de alertas de pagos con corrección crítica de lógica
   ==================================================== */

// ============================================================
// 💰 FUNCIONES PRINCIPALES DE ALERTAS DE PAGOS
// ============================================================

/**
 * CORRECCIÓN CRÍTICA: Función de alertas de pagos con lógica corregida
 * PROBLEMA ORIGINAL: Lógica invertida en cálculo de días vencidos
 */
async function refreshPaymentAlerts() {
    try {
        console.log('🔔 Actualizando alertas de pagos...');
        
        const container = document.getElementById('paymentAlertsContainer');
        if (!container) {
            console.warn('⚠️ Contenedor paymentAlertsContainer no encontrado');
            return;
        }
        
        const empresaParam = currentCompanyFilter || 1;
        const response = await fetch(`/gastos/api/dashboard/alertas-pagos?empresa_id=${empresaParam}`, { 
            cache: 'no-store',
            credentials: 'same-origin',  // ⭐ CAMBIAR DE 'include' A 'same-origin'
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('🔔 DEBUG alertas recibidas:', data.data);

            let proximos_vencer = Array.isArray(data.data.proximos_vencer) ? data.data.proximos_vencer : [];
            let vencidos = Array.isArray(data.data.vencidos) ? data.data.vencidos : [];

            console.log('🔔 Próximos originales:', proximos_vencer.length);
            console.log('🔔 Vencidos originales:', vencidos.length);

            // Filtrar alumnos dados de baja
            proximos_vencer = proximos_vencer.filter(a => String(a.estatus || '').toLowerCase() !== 'baja');
            vencidos = vencidos.filter(a => String(a.estatus || '').toLowerCase() !== 'baja');

            // CONFIAR EN BACKEND: Los datos ya vienen correctamente calculados
            console.log(`Alertas del backend: ${proximos_vencer.length} próximos, ${vencidos.length} vencidos`);

            // Generar HTML con dos columnas
            let alertsHTML = `
                <div class="row">
                    <!-- COLUMNA IZQUIERDA: Próximos a Vencer -->
                    <div class="col-md-6">
                        <div class="payment-section upcoming">
                            <h6 class="mb-3">
                                <i class="fas fa-clock text-warning me-2"></i>
                                Próximos a Vencer (${proximos_vencer.length})
                            </h6>
                            <div class="alerts-list" style="max-height: 300px; overflow-y: auto;">
            `;
            
            if (proximos_vencer.length > 0) {
                proximos_vencer.slice(0, 10).forEach(alumno => {
                    // Usar datos directos del backend
                    const diasRestantes = alumno.dias_restantes !== undefined ? alumno.dias_restantes : 'N/A';
                    
                    alertsHTML += `
                        <div class="alert-item d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <strong>${alumno.nombre}</strong><br>
                                <small class="text-muted">${alumno.clase || 'Sin clase'}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-warning">${diasRestantes} días</span>
                            </div>
                        </div>
                    `;
                });
                
                if (proximos_vencer.length > 10) {
                    alertsHTML += `<small class="text-muted">... y ${proximos_vencer.length - 10} más</small>`;
                }
            } else {
                alertsHTML += '<div class="text-center text-muted py-3">✅ No hay pagos próximos a vencer</div>';
            }
            
            alertsHTML += `
                            </div>
                        </div>
                    </div>
                    
                    <!-- COLUMNA DERECHA: Vencidos -->
                    <div class="col-md-6">
                        <div class="payment-section overdue">
                            <h6 class="mb-3">
                                <i class="fas fa-exclamation-triangle text-danger me-2"></i>
                                Vencidos (${vencidos.length})
                            </h6>
                            <div class="alerts-list" style="max-height: 300px; overflow-y: auto;">
            `;
            
            if (vencidos.length > 0) {
                vencidos.slice(0, 10).forEach(alumno => {
                    // Usar datos directos del backend
                    const diasVencidos = alumno.dias_vencido !== undefined ? alumno.dias_vencido : 'N/A';
                    
                    alertsHTML += `
                        <div class="alert-item d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <strong>${alumno.nombre}</strong><br>
                                <small class="text-muted">${alumno.clase || 'Sin clase'}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-danger">${diasVencidos} días</span>
                            </div>
                        </div>
                    `;
                });
                
                if (vencidos.length > 10) {
                    alertsHTML += `<small class="text-muted">... y ${vencidos.length - 10} más</small>`;
                }
            } else {
                alertsHTML += '<div class="text-center text-muted py-3">✅ No hay pagos vencidos</div>';
            }
            
            alertsHTML += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = alertsHTML;
            
            const totalAlertas = proximos_vencer.length + vencidos.length;
            console.log(`✅ Alertas actualizadas: ${totalAlertas} alertas activas`);
            
        } else {
            throw new Error(data.error || 'Error obteniendo alertas');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando alertas:', error);
        const container = document.getElementById('paymentAlertsContainer');
        if (container) {
            container.innerHTML = '<div class="text-center text-muted py-3">⚠️ Error cargando alertas de pagos</div>';
        }
    }
}

/**
 * FUNCIÓN CORREGIDA: Calcular próxima fecha de pago de un alumno
 * Basada en fecha de inscripción y ciclo mensual
 */
function getNextPaymentDate(alumno) {
    const fechaInscripcion = alumno.fechaInscripcion || alumno.fecha_inscripcion;
    
    if (!fechaInscripcion) {
        console.warn('⚠️ Alumno sin fecha de inscripción:', alumno.nombre);
        return null;
    }
    
    try {
        const enrollment = new Date(fechaInscripcion);
        const today = new Date();
        
        // Validar fecha
        if (isNaN(enrollment.getTime())) {
            console.warn('⚠️ Fecha de inscripción inválida:', fechaInscripcion);
            return null;
        }
        
        // Obtener día del mes de inscripción (día de corte mensual)
        const enrollmentDay = enrollment.getDate();
        
        // Calcular próximo día de pago
        let nextPayment = new Date(today.getFullYear(), today.getMonth(), enrollmentDay);
        
        // Si ya pasó este mes, calcular para el siguiente
        if (nextPayment <= today) {
            nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, enrollmentDay);
        }
        
        // Ajustar si el día no existe en el mes
        if (nextPayment.getDate() !== enrollmentDay) {
            nextPayment = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        }
        
        return nextPayment;
        
    } catch (error) {
        console.error('❌ Error calculando próxima fecha de pago:', error);
        return null;
    }
}

/**
 * Calcular estado de pago de un alumno específico
 */
function calculatePaymentStatus(alumno) {
    if (!alumno || String(alumno.estatus || '').toLowerCase() === 'baja') {
        return {
            status: 'inactive',
            daysInfo: 0,
            statusText: 'Inactivo',
            statusClass: 'secondary',
            statusIcon: 'minus-circle'
        };
    }
    
    const nextPaymentDate = getNextPaymentDate(alumno);
    
    if (!nextPaymentDate) {
        return {
            status: 'unknown',
            daysInfo: 0,
            statusText: 'Sin fecha',
            statusClass: 'warning',
            statusIcon: 'question-circle'
        };
    }
    
    const today = new Date();
    const daysDiff = daysBetweenDates(today, nextPaymentDate);
    
    if (daysDiff < -5) {
        // Más de 5 días vencido
        return {
            status: 'overdue',
            daysInfo: Math.abs(daysDiff),
            statusText: `Vencido ${Math.abs(daysDiff)} días`,
            statusClass: 'danger',
            statusIcon: 'exclamation-triangle'
        };
    } else if (daysDiff < 0) {
        // Vencido pero menos de 5 días
        return {
            status: 'recent_overdue',
            daysInfo: Math.abs(daysDiff),
            statusText: `Vencido ${Math.abs(daysDiff)} días`,
            statusClass: 'warning',
            statusIcon: 'clock'
        };
    } else if (daysDiff <= 3) {
        // Próximo a vencer (3 días o menos)
        return {
            status: 'upcoming',
            daysInfo: daysDiff,
            statusText: `Vence en ${daysDiff} días`,
            statusClass: 'warning',
            statusIcon: 'clock'
        };
    } else {
        // Al corriente
        return {
            status: 'current',
            daysInfo: daysDiff,
            statusText: 'Al corriente',
            statusClass: 'success',
            statusIcon: 'check-circle'
        };
    }
}

/**
 * Obtener resumen de alertas de pagos
 */
async function getPaymentAlertsummary() {
    try {
        const empresaParam = currentCompanyFilter || 1;
        const response = await fetch(`/gastos/api/dashboard/alertas-pagos?empresa_id=${empresaParam}`, { 
            cache: 'no-store',
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('🔍 Datos recibidos del backend:', data.data);
            console.log('📊 Próximos a vencer:', data.data.proximos_vencer);
            console.log('📊 Vencidos:', data.data.vencidos);
            const proximos = Array.isArray(data.data.proximos_vencer) ? data.data.proximos_vencer : [];
            const vencidos = Array.isArray(data.data.vencidos) ? data.data.vencidos : [];
            
            // Filtrar alumnos activos
            const proximosActivos = proximos.filter(a => String(a.estatus || '').toLowerCase() !== 'baja');
            const vencidosActivos = vencidos.filter(a => String(a.estatus || '').toLowerCase() !== 'baja');
            
            return {
                upcoming: proximosActivos.length,
                overdue: vencidosActivos.length,
                total: proximosActivos.length + vencidosActivos.length
            };
        }
        
        return { upcoming: 0, overdue: 0, total: 0 };
        
    } catch (error) {
        console.error('❌ Error obteniendo resumen de alertas:', error);
        return { upcoming: 0, overdue: 0, total: 0 };
    }
}

/**
 * Marcar alerta como notificada (funcionalidad futura)
 */
async function markAlertAsNotified(alumnoId) {
    try {
        console.log(`📧 Marcando alerta como notificada para alumno ${alumnoId}`);
        
        const response = await fetch(`/gastos/api/alertas-pagos/marcar-notificado/${alumnoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Alerta marcada como notificada');
            showAlert('success', 'Alerta marcada como notificada');
        } else {
            throw new Error(result.message || 'Error marcando alerta');
        }
        
    } catch (error) {
        console.error('❌ Error marcando alerta:', error);
        showAlert('danger', 'Error marcando alerta como notificada');
    }
}

/**
 * Generar reporte de pagos vencidos
 */
async function generateOverduePaymentsReport() {
    try {
        console.log('📊 Generando reporte de pagos vencidos...');
        
        const empresaParam = currentCompanyFilter || 1;
        const response = await fetch(`/gastos/api/dashboard/alertas-pagos?empresa_id=${empresaParam}`, { 
            cache: 'no-store',
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const vencidos = Array.isArray(data.data.vencidos) ? data.data.vencidos : [];
            const vencidosActivos = vencidos.filter(a => String(a.estatus || '').toLowerCase() !== 'baja');
            
            if (vencidosActivos.length === 0) {
                showAlert('info', '✅ No hay pagos vencidos para reportar');
                return;
            }
            
            // Crear contenido del reporte
            let reportContent = `REPORTE DE PAGOS VENCIDOS\n`;
            reportContent += `Fecha: ${new Date().toLocaleDateString('es-MX')}\n`;
            reportContent += `Empresa: ${empresaParam === '1' ? 'Rockstar Skull' : 'Symbiot Technologies'}\n`;
            reportContent += `Total de alumnos con pagos vencidos: ${vencidosActivos.length}\n\n`;
            
            reportContent += `DETALLE:\n`;
            reportContent += `=========\n`;
            
            vencidosActivos.forEach((alumno, index) => {
                const nextDate = getNextPaymentDate(alumno);
                const daysOverdue = nextDate ? daysBetweenDates(nextDate, new Date()) : 'N/A';
                const monthlyFee = alumno.precio_mensual ? formatCurrency(alumno.precio_mensual) : 'No definido';
                
                reportContent += `${index + 1}. ${alumno.nombre}\n`;
                reportContent += `   Clase: ${alumno.clase || 'Sin definir'}\n`;
                reportContent += `   Mensualidad: ${monthlyFee}\n`;
                reportContent += `   Días vencidos: ${daysOverdue}\n`;
                reportContent += `   Teléfono: ${alumno.telefono || 'No disponible'}\n\n`;
            });
            
            // Descargar como archivo de texto
            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_pagos_vencidos_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showAlert('success', `Reporte generado: ${vencidosActivos.length} alumnos con pagos vencidos`);
            
        } else {
            throw new Error(data.error || 'Error generando reporte');
        }
        
    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        showAlert('danger', 'Error generando reporte de pagos vencidos');
    }
}

/**
 * Auto-refresh de alertas de pagos
 */
function startPaymentAlertsAutoRefresh() {
    // Refrescar alertas cada 60 segundos
    setInterval(async () => {
        try {
            await refreshPaymentAlerts();
            console.log('🔄 Auto-refresh de alertas de pagos ejecutado');
        } catch (error) {
            console.error('❌ Error en auto-refresh de alertas:', error);
        }
    }, PAYMENT_ALERT_CONFIG.AUTO_REFRESH);
    
    console.log(`🔄 Auto-refresh de alertas iniciado (cada ${PAYMENT_ALERT_CONFIG.AUTO_REFRESH / 1000} segundos)`);
}

/**
 * Validar configuración de alertas
 */
function validatePaymentAlertsConfig() {
    const config = PAYMENT_ALERT_CONFIG;
    
    if (!config.UPCOMING_DAYS || config.UPCOMING_DAYS < 1 || config.UPCOMING_DAYS > 30) {
        console.warn('⚠️ Configuración UPCOMING_DAYS inválida, usando valor por defecto');
        config.UPCOMING_DAYS = 3;
    }
    
    if (!config.OVERDUE_DAYS || config.OVERDUE_DAYS < 1 || config.OVERDUE_DAYS > 90) {
        console.warn('⚠️ Configuración OVERDUE_DAYS inválida, usando valor por defecto');
        config.OVERDUE_DAYS = 5;
    }
    
    if (!config.AUTO_REFRESH || config.AUTO_REFRESH < 10000) {
        console.warn('⚠️ Configuración AUTO_REFRESH inválida, usando valor por defecto');
        config.AUTO_REFRESH = 60000;
    }
    
    console.log('✅ Configuración de alertas validada:', config);
}

/**
 * Inicializar módulo de alertas de pagos
 */
async function initializePaymentAlerts() {
    try {
        console.log('💰 Inicializando módulo de alertas de pagos...');
        
        // Validar configuración
        validatePaymentAlertsConfig();
        
        // Cargar alertas iniciales
        await refreshPaymentAlerts();
        
        // Iniciar auto-refresh si está habilitado
        if (PAYMENT_ALERT_CONFIG.AUTO_REFRESH > 0) {
            startPaymentAlertsAutoRefresh();
        }
        
        console.log('✅ Módulo de alertas de pagos inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando módulo de alertas:', error);
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Hacer funciones disponibles globalmente
window.refreshPaymentAlerts = refreshPaymentAlerts;
window.getNextPaymentDate = getNextPaymentDate;
window.calculatePaymentStatus = calculatePaymentStatus;
window.getPaymentAlertsummary = getPaymentAlertsummary;
window.markAlertAsNotified = markAlertAsNotified;
window.generateOverduePaymentsReport = generateOverduePaymentsReport;
window.initializePaymentAlerts = initializePaymentAlerts;

console.log('✅ Dashboard Payments Module cargado - Funciones de alertas disponibles');