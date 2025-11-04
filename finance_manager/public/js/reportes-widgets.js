/* ====================================================
   REPORTES WIDGETS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/reportes-widgets.js
   Widgets específicos para reportes
   ==================================================== */

console.log('📊 Cargando Reportes Widgets Module...');

// ============================================================
// 🌍 VARIABLES GLOBALES DE WIDGETS
// ============================================================

let gastosRealesChart = null;
let gastosRealesData = null;

// ============================================================
// 🎨 HELPERS DE FORMATO PARA EXCEL
// ============================================================

/**
 * Aplicar formato de moneda a una celda
 */
function setCellCurrency(cell) {
    cell.z = '"$"#,##0.00';
    return cell;
}

/**
 * Aplicar formato de porcentaje a una celda
 */
function setCellPercentage(cell) {
    cell.z = '0.00%';
    return cell;
}

/**
 * Crear celda con estilo
 */
function createStyledCell(value, style = {}) {
    const cell = { v: value };
    
    // Tipo de celda
    if (typeof value === 'number') {
        cell.t = 'n';
    } else if (typeof value === 'string') {
        cell.t = 's';
    }
    
    // Aplicar estilo
    if (style.currency) {
        setCellCurrency(cell);
    }
    if (style.percentage) {
        setCellPercentage(cell);
    }
    
    return cell;
}

/**
 * Combinar celdas en un rango
 */
function mergeCells(worksheet, startRow, startCol, endRow, endCol) {
    if (!worksheet['!merges']) {
        worksheet['!merges'] = [];
    }
    worksheet['!merges'].push({
        s: { r: startRow, c: startCol },
        e: { r: endRow, c: endCol }
    });
}

/**
 * Establecer ancho de columna
 */
function setColumnWidth(worksheet, colIndex, width) {
    if (!worksheet['!cols']) {
        worksheet['!cols'] = [];
    }
    worksheet['!cols'][colIndex] = { wch: width };
}

// ============================================================
// 📊 WIDGET: GASTOS REALES
// ============================================================

/**
 * Inicializar widget de Gastos Reales
 */
async function initializeGastosRealesWidget() {
    try {
        console.log('📊 Inicializando widget Gastos Reales...');
        
        // Cargar datos iniciales
        const filters = {
            empresa: '',
            ano: '2025',
            mes: '',
            tipo: ''
        };
        
        await loadGastosRealesData(filters);
        
        console.log('✅ Widget Gastos Reales inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando widget Gastos Reales:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando reporte de Gastos Reales');
        }
    }
}

/**
 * Cargar datos del reporte de Gastos Reales
 */
async function loadGastosRealesData(filters = {}) {
    try {
        console.log('📥 Cargando datos de Gastos Reales...', filters);
        
        // Construir parámetros
        const params = new URLSearchParams();
        if (filters.empresa) params.append('empresa_id', filters.empresa);
        if (filters.ano) params.append('ano', filters.ano);
        if (filters.mes) params.append('mes', filters.mes);
        if (filters.tipo) params.append('tipo', filters.tipo);
        
        // Llamar al endpoint
        const response = await fetch(`/gastos/api/reportes/gastos-reales?${params.toString()}`, {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error en respuesta del servidor');
        }
        
        console.log('✅ Datos recibidos:', data.data);
        
        // Actualizar indicadores
        updateGastosRealesIndicators(data.data);
        
        // Actualizar gráfico
        updateGastosRealesChart(data.data.detalle_mensual);
        
        // Actualizar tabla
        updateGastosRealesTable(data.data.detalle_mensual);
        
        // Guardar datos para exportación
        gastosRealesData = data.data;
        
        console.log('✅ Datos de Gastos Reales cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando datos de Gastos Reales:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cargando datos del reporte: ' + error.message);
        }
        
        // Mostrar mensaje en la tabla
        const tbody = document.getElementById('tablaGastosReales');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error cargando datos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Actualizar indicadores (cards) de Gastos Reales
 */
function updateGastosRealesIndicators(data) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    // Total Entradas
    const totalEntradasEl = document.getElementById('totalEntradas');
    if (totalEntradasEl) {
        totalEntradasEl.textContent = formatCurrency(data.total_entradas);
    }
    
    // Total Salidas
    const totalSalidasEl = document.getElementById('totalSalidas');
    if (totalSalidasEl) {
        totalSalidasEl.textContent = formatCurrency(data.total_salidas);
    }
    
    // Flujo Neto
    const flujoNetoEl = document.getElementById('flujoNeto');
    if (flujoNetoEl) {
        flujoNetoEl.textContent = formatCurrency(data.flujo_neto);
        
        // Cambiar color según sea positivo o negativo
        if (data.flujo_neto >= 0) {
            flujoNetoEl.className = 'text-success mb-0';
        } else {
            flujoNetoEl.className = 'text-danger mb-0';
        }
    }
}

/**
 * Actualizar gráfico de Gastos Reales
 */
function updateGastosRealesChart(detalleMensual) {
    const ctx = document.getElementById('chartGastosReales');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (gastosRealesChart) {
        gastosRealesChart.destroy();
    }
    
    const meses = detalleMensual.map(d => d.mes);
    const entradas = detalleMensual.map(d => d.entradas);
    const salidas = detalleMensual.map(d => d.salidas);
    const flujos = detalleMensual.map(d => d.flujo);
    
    gastosRealesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Salidas',
                    data: salidas,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Flujo Neto',
                    data: flujos,
                    borderColor: 'rgb(255, 206, 86)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E4E6EA'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#E4E6EA',
                        callback: function(value) {
                            return '$' + value.toLocaleString('es-MX');
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#E4E6EA'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

/**
 * Actualizar tabla de Gastos Reales
 */
function updateGastosRealesTable(detalleMensual) {
    const tbody = document.getElementById('tablaGastosReales');
    if (!tbody) return;
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    if (!detalleMensual || detalleMensual.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos disponibles para los filtros seleccionados
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    detalleMensual.forEach(item => {
        const flujoClass = item.flujo >= 0 ? 'text-success' : 'text-danger';
        const flujoIcon = item.flujo >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        const row = `
            <tr>
                <td>
                    <i class="fas fa-calendar-alt me-2 text-muted"></i>
                    ${item.mes}
                </td>
                <td class="text-end text-success">
                    <i class="fas fa-arrow-up me-1"></i>
                    ${formatCurrency(item.entradas)}
                </td>
                <td class="text-end text-danger">
                    <i class="fas fa-arrow-down me-1"></i>
                    ${formatCurrency(item.salidas)}
                </td>
                <td class="text-end ${flujoClass}">
                    <i class="fas ${flujoIcon} me-1"></i>
                    <strong>${formatCurrency(item.flujo)}</strong>
                </td>
            </tr>
        `;
        
        tbody.insertAdjacentHTML('beforeend', row);
    });
    
    console.log(`✅ Tabla actualizada con ${detalleMensual.length} registros`);
}

/**
 * Exportar Gastos Reales a Excel con formato idéntico al original
 */
function exportGastosRealesExcel() {
    try {
        console.log('📤 Exportando Gastos Reales a Excel...');
        
        if (!gastosRealesData || !gastosRealesData.detalle_mensual) {
            if (typeof showAlert === 'function') {
                showAlert('warning', 'No hay datos para exportar');
            }
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            console.error('❌ SheetJS no está cargado');
            if (typeof showAlert === 'function') {
                showAlert('danger', 'Error: Librería de exportación no disponible');
            }
            return;
        }
        
        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = {};
        
        // ============================================================
        // ESTRUCTURA DE LA HOJA "GASTOS REALES"
        // ============================================================
        
        const detalle = gastosRealesData.detalle_mensual;
        
        // Fila 1: Encabezado de años (vacío hasta columna D, luego años)
        // Fila 2: Encabezados de columnas
        const row1 = ['', '', '', ''];
        const row2 = ['Concepto', 'Cantidad', 'Costo', ''];
        
        // Agregar meses dinámicamente
        let currentYear = null;
        let yearStartCol = 4;
        
        detalle.forEach((item, idx) => {
            if (item.ano !== currentYear) {
                if (currentYear !== null) {
                    // Marcar donde termina el año anterior para combinar celdas
                    mergeCells(ws, 0, yearStartCol, 0, 3 + idx);
                }
                currentYear = item.ano;
                yearStartCol = 4 + idx;
                row1.push(currentYear.toString());
            } else {
                row1.push('');
            }
            
            // Nombres de meses
            row2.push(item.mes.split(' ')[0]); // Solo el nombre del mes
        });
        
        // Combinar último año
        if (detalle.length > 0) {
            mergeCells(ws, 0, yearStartCol, 0, 3 + detalle.length);
        }
        
        // Agregar columna de Total
        row1.push('', '', 'Total');
        row2.push('', '', 'Total');
        
        // Fila 3: Vacía
        const row3 = Array(row2.length).fill('');
        
        // Fila 4: Entradas
        const row4 = ['Entradas', '', '', ''];
        detalle.forEach(item => {
            row4.push(item.entradas);
        });
        row4.push('', '', gastosRealesData.total_entradas);
        
        // Fila 5: Salidas
        const row5 = ['Salidas', '', '', ''];
        detalle.forEach(item => {
            row5.push(item.salidas);
        });
        row5.push('', '', gastosRealesData.total_salidas);
        
        // Fila 6: Flujo de Efectivo
        const row6 = ['Flujo de Efectivo', '', '', ''];
        detalle.forEach(item => {
            row6.push(item.flujo);
        });
        row6.push('', '', gastosRealesData.flujo_neto);
        
        // Fila 7: Vacía
        const row7 = Array(row2.length).fill('');
        
        // Fila 8: Total de Gastos
        const row8 = ['Total de Gastos', '', gastosRealesData.total_salidas, ''];
        
        // Construir array de datos
        const data = [row1, row2, row3, row4, row5, row6, row7, row8];
        
        // Convertir array a worksheet
        const wsData = XLSX.utils.aoa_to_sheet(data);
        
        // ============================================================
        // APLICAR FORMATOS
        // ============================================================
        
        // Formato de moneda para las celdas numéricas
        const currencyFormat = '"$"#,##0.00';
        
        // Filas de datos (4, 5, 6) - columnas E en adelante
        for (let col = 4; col < row2.length - 3; col++) {
            // Fila 4 (Entradas) - índice 3
            const cellEntradas = XLSX.utils.encode_cell({ r: 3, c: col });
            if (wsData[cellEntradas]) {
                wsData[cellEntradas].z = currencyFormat;
            }
            
            // Fila 5 (Salidas) - índice 4
            const cellSalidas = XLSX.utils.encode_cell({ r: 4, c: col });
            if (wsData[cellSalidas]) {
                wsData[cellSalidas].z = currencyFormat;
            }
            
            // Fila 6 (Flujo) - índice 5
            const cellFlujo = XLSX.utils.encode_cell({ r: 5, c: col });
            if (wsData[cellFlujo]) {
                wsData[cellFlujo].z = currencyFormat;
            }
        }
        
        // Columna Total (últimas 3 filas)
        const totalCol = row2.length - 1;
        ['C8', 'C4', 'C5', 'C6'].forEach(cell => {
            if (wsData[cell]) {
                wsData[cell].z = currencyFormat;
            }
        });
        
        // Formato para totales en columna final
        const cellTotalEntradas = XLSX.utils.encode_cell({ r: 3, c: totalCol });
        const cellTotalSalidas = XLSX.utils.encode_cell({ r: 4, c: totalCol });
        const cellTotalFlujo = XLSX.utils.encode_cell({ r: 5, c: totalCol });
        
        if (wsData[cellTotalEntradas]) wsData[cellTotalEntradas].z = currencyFormat;
        if (wsData[cellTotalSalidas]) wsData[cellTotalSalidas].z = currencyFormat;
        if (wsData[cellTotalFlujo]) wsData[cellTotalFlujo].z = currencyFormat;
        
        // ============================================================
        // CONFIGURAR ANCHOS DE COLUMNA
        // ============================================================
        
        wsData['!cols'] = [
            { wch: 33 },  // Columna A: Concepto
            { wch: 9 },   // Columna B: Cantidad
            { wch: 13 },  // Columna C: Costo
            { wch: 2 }    // Columna D: Separador
        ];
        
        // Columnas de meses (E en adelante)
        for (let i = 0; i < detalle.length + 3; i++) {
            wsData['!cols'].push({ wch: 12 });
        }
        
        // ============================================================
        // COMBINAR CELDAS
        // ============================================================
        
        // Ya se combinaron los años en row1 arriba con mergeCells()
        
        // Combinar celda "Flujo de Efectivo" (A6:D6)
        mergeCells(wsData, 5, 0, 5, 3);
        
        // Establecer rango de la hoja
        const range = XLSX.utils.decode_range(wsData['!ref']);
        range.e.c = row2.length - 1;
        range.e.r = 7;
        wsData['!ref'] = XLSX.utils.encode_range(range);
        
        // Aplicar merges al worksheet
        Object.assign(ws, wsData);
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Gastos Reales');
        
        // ============================================================
        // GENERAR Y DESCARGAR ARCHIVO
        // ============================================================
        
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Gastos_Reales_${fecha}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Archivo Excel generado:', fileName);
        
        if (typeof showAlert === 'function') {
            showAlert('success', `Reporte exportado: ${fileName}`, 3000);
        }
        
    } catch (error) {
        console.error('❌ Error exportando:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error al exportar el reporte: ' + error.message);
        }
    }
}

// ============================================================
// 📊 WIDGET: BALANCE GENERAL
// ============================================================

let balanceGeneralChart = null;
let balanceGeneralData = null;

/**
 * Inicializar widget de Balance General
 */
async function initializeBalanceGeneralWidget() {
    try {
        console.log('💰 Inicializando widget Balance General...');
        
        // Cargar datos iniciales
        const filters = {
            empresa: '',
            ano: '2025',
            mes: ''
        };
        
        await loadBalanceGeneralData(filters);
        
        console.log('✅ Widget Balance General inicializado');
        
    } catch (error) {
        console.error('❌ Error inicializando widget Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error inicializando Balance General');
        }
    }
}

/**
 * Cargar datos del Balance General
 */
async function loadBalanceGeneralData(filters = {}) {
    try {
        console.log('📥 Cargando datos de Balance General...', filters);
        
        // Construir parámetros
        const params = new URLSearchParams();
        if (filters.empresa) params.append('empresa_id', filters.empresa);
        if (filters.ano) params.append('ano', filters.ano);
        if (filters.mes) params.append('mes', filters.mes);
        
        // Llamar al endpoint
        const response = await fetch(`/gastos/api/reportes/balance-general?${params.toString()}`, {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error en respuesta del servidor');
        }
        
        console.log('✅ Datos de Balance General recibidos:', data.data);
        
        // Actualizar resumen principal
        updateBalanceGeneralResumen(data.data.resumen);
        
        // Actualizar tabla de socios
        updateTablaSocios(data.data.socios, data.data.resumen.inversion_total);
        
        // Actualizar gastos escuela
        updateGastosEscuela(data.data.gastos_escuela);
        
        // Actualizar estado de cuentas
        updateEstadoCuentas(data.data.cuentas_bancarias);
        
        // Actualizar gráfico de participación
        updateChartParticipacion(data.data.participacion);
        
        // Actualizar tabla de participación
        updateTablaParticipacion(data.data.participacion);
        
        // Guardar datos para exportación
        balanceGeneralData = data.data;
        
        console.log('✅ Balance General actualizado correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error cargando Balance General: ' + error.message);
        }
    }
}

/**
 * Actualizar resumen principal del Balance General
 */
function updateBalanceGeneralResumen(resumen) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    // Inversión Total
    const inversionTotalEl = document.getElementById('inversionTotal');
    if (inversionTotalEl) {
        inversionTotalEl.textContent = formatCurrency(resumen.inversion_total);
    }
    
    const totalSociosEl = document.getElementById('totalSocios');
    if (totalSociosEl) {
        totalSociosEl.textContent = `${resumen.numero_socios} socio${resumen.numero_socios !== 1 ? 's' : ''}`;
    }
    
    // Saldo Total en Cuentas
    const saldoTotalEl = document.getElementById('saldoTotalCuentas');
    if (saldoTotalEl) {
        saldoTotalEl.textContent = formatCurrency(resumen.saldo_disponible);
    }
    
    const numeroCuentasEl = document.getElementById('numeroCuentas');
    if (numeroCuentasEl) {
        numeroCuentasEl.textContent = '2 cuentas'; // Hardcoded ya que tenemos Inbursa y Mercado Pago
    }
}

/**
 * Actualizar tabla de socios
 */
function updateTablaSocios(socios, totalInversion) {
    const tbody = document.getElementById('tablaSocios');
    const totalEl = document.getElementById('totalInversionSocios');
    
    if (!tbody) return;
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX');
    };
    
    if (!socios || socios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos de inversión disponibles
                </td>
            </tr>
        `;
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }
    
    tbody.innerHTML = '';
    
    socios.forEach(socio => {
        const row = `
            <tr>
                <td>
                    <i class="fas fa-user-circle me-2 text-primary"></i>
                    <strong>${socio.socio}</strong>
                </td>
                <td class="text-end text-success">
                    ${formatCurrency(socio.inversion)}
                </td>
                <td class="text-end">
                    <span class="badge bg-info">${socio.porcentaje.toFixed(2)}%</span>
                </td>
                <td class="text-end text-muted">
                    ${formatDate(socio.ultima_actualizacion)}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
    
    // Actualizar total
    if (totalEl) {
        totalEl.textContent = formatCurrency(totalInversion);
    }
}

/**
 * Actualizar gastos escuela
 */
function updateGastosEscuela(gastosEscuela) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    const gastosEl = document.getElementById('gastosEscuela');
    if (gastosEl) {
        gastosEl.textContent = formatCurrency(gastosEscuela.monto);
    }
    
    const porcentajeEl = document.getElementById('porcentajeGastos');
    if (porcentajeEl) {
        porcentajeEl.textContent = `${gastosEscuela.porcentaje.toFixed(2)}% del total`;
    }
}

/**
 * Actualizar estado de cuentas bancarias
 */
function updateEstadoCuentas(cuentas) {
    const container = document.getElementById('cuentasBancarias');
    if (!container) return;
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    if (!cuentas || cuentas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <i class="fas fa-info-circle me-2"></i>
                No hay cuentas registradas
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    cuentas.forEach(cuenta => {
        const saldoClass = cuenta.saldo >= 0 ? 'text-success' : 'text-danger';
        const iconoBanco = cuenta.banco === 'Inbursa' ? 'university' : 'credit-card';
        
        const card = `
            <div class="col-md-6 mb-3">
                <div class="card" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="text-white mb-1">
                                    <i class="fas fa-${iconoBanco} me-2"></i>${cuenta.nombre}
                                </h6>
                                <small class="text-muted">${cuenta.tipo}</small>
                            </div>
                            <span class="badge bg-primary">${cuenta.banco}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted d-block">Saldo Disponible</small>
                                <h3 class="${saldoClass} mb-0">${formatCurrency(cuenta.saldo)}</h3>
                            </div>
                            <i class="fas fa-wallet fa-2x text-muted"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', card);
    });
}

/**
 * Actualizar gráfico de participación
 */
function updateChartParticipacion(participacion) {
    const ctx = document.getElementById('chartParticipacion');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    if (balanceGeneralChart) {
        balanceGeneralChart.destroy();
    }
    
    if (!participacion || participacion.length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-center text-muted">No hay datos de participación</p>';
        return;
    }
    
    const labels = participacion.map(p => p.socio);
    const data = participacion.map(p => p.porcentaje);
    
    // Colores para cada socio
    const colors = [
        'rgba(13, 202, 240, 0.8)',   // Cyan
        'rgba(255, 193, 7, 0.8)',    // Amarillo
        'rgba(82, 196, 26, 0.8)',    // Verde
        'rgba(255, 99, 132, 0.8)',   // Rojo
        'rgba(153, 102, 255, 0.8)'   // Morado
    ];
    
    balanceGeneralChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, participacion.length),
                borderColor: colors.slice(0, participacion.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E4E6EA',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualizar tabla de participación
 */
function updateTablaParticipacion(participacion) {
    const tbody = document.getElementById('tablaParticipacion');
    if (!tbody) return;
    
    if (!participacion || participacion.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay datos de participación
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    participacion.forEach(item => {
        const row = `
            <tr>
                <td>
                    <i class="fas fa-user me-2 text-primary"></i>
                    ${item.socio}
                </td>
                <td class="text-end">
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar bg-info" role="progressbar" 
                             style="width: ${item.porcentaje}%"
                             aria-valuenow="${item.porcentaje}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${item.porcentaje.toFixed(2)}%
                        </div>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/**
 * Exportar Balance General a Excel con formato idéntico al original
 */
function exportBalanceGeneralExcel() {
    try {
        console.log('📤 Exportando Balance General a Excel...');
        
        if (!balanceGeneralData) {
            if (typeof showAlert === 'function') {
                showAlert('warning', 'No hay datos para exportar');
            }
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            console.error('❌ SheetJS no está cargado');
            if (typeof showAlert === 'function') {
                showAlert('danger', 'Error: Librería de exportación no disponible');
            }
            return;
        }
        
        const wb = XLSX.utils.book_new();
        const data = [];
        
        // ============================================================
        // ESTRUCTURA DE LA HOJA "BALANCE GENERAL"
        // ============================================================
        
        // Fila 1: Título principal (merge)
        const row1 = ['BALANCE GENERAL SYMBIOT FINANCIAL MANAGER'];
        for (let i = 1; i < 34; i++) row1.push('');
        data.push(row1);
        
        // Fila 2-3: Vacías
        data.push(Array(34).fill(''));
        data.push(Array(34).fill(''));
        
        // Fila 4: Encabezados de secciones
        const row4 = [
            'INVERSIÓN POR SOCIO', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            'ESTADO DE CUENTA', '', '', '',
            'PORCENTAJES DE PARTICIPACIÓN SOCIEDAD', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ];
        data.push(row4);
        
        // ============================================================
        // SECCIÓN: INVERSIÓN POR SOCIO
        // ============================================================
        
        const socios = balanceGeneralData.socios || [];
        const formatCurrency = (val) => parseFloat(val) || 0;
        const formatPercent = (val) => (parseFloat(val) || 0) / 100;
        
        // Fila 5-7: Socios individuales
        socios.forEach((socio, idx) => {
            const row = Array(34).fill('');
            row[0] = `Inversión ${socio.socio}`;
            row[13] = formatCurrency(socio.inversion);
            row[14] = formatPercent(socio.porcentaje);
            
            // Estado de cuenta (solo para primera fila)
            if (idx === 0 && balanceGeneralData.cuentas_bancarias) {
                row[16] = 'Saldo Cuenta Inbursa:';
                row[18] = formatCurrency(balanceGeneralData.cuentas_bancarias[0]?.saldo || 0);
            } else if (idx === 1 && balanceGeneralData.cuentas_bancarias) {
                row[16] = 'Saldo Mercado Pago:';
                row[18] = formatCurrency(balanceGeneralData.cuentas_bancarias[1]?.saldo || 0);
            } else if (idx === 2) {
                row[16] = 'TOTAL';
                row[18] = formatCurrency(balanceGeneralData.resumen.saldo_disponible);
            }
            
            // Participación (columna 20-23)
            row[20] = socio.socio;
            row[23] = formatPercent(socio.porcentaje);
            
            data.push(row);
        });
        
        // Fila 8: Gastos Escuela
        const row8 = Array(34).fill('');
        row8[0] = 'Gastos Escuela';
        row8[13] = formatCurrency(balanceGeneralData.gastos_escuela?.monto || 0);
        row8[14] = formatPercent(balanceGeneralData.gastos_escuela?.porcentaje || 0);
        data.push(row8);
        
        // Fila 9: TOTAL
        const row9 = Array(34).fill('');
        row9[0] = 'TOTAL';
        row9[13] = formatCurrency(balanceGeneralData.resumen.total_general);
        row9[14] = 1; // 100%
        row9[33] = `Fecha: ${new Date().toLocaleDateString('es-MX')}`;
        data.push(row9);
        
        // Fila 10: Hoja 1 de 1
        const row10 = Array(34).fill('');
        row10[33] = 'Hoja 1 de 1';
        data.push(row10);
        
        // ============================================================
        // CONVERTIR A WORKSHEET Y APLICAR FORMATOS
        // ============================================================
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Formato de moneda
        const currencyFormat = '"$"#,##0.00';
        const percentFormat = '0.00%';
        
        // Aplicar formato a inversiones (columna N, filas 5-9)
        for (let row = 4; row <= 8; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 13 });
            if (ws[cell]) ws[cell].z = currencyFormat;
        }
        
        // Aplicar formato a porcentajes (columna O, filas 5-9)
        for (let row = 4; row <= 8; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 14 });
            if (ws[cell]) ws[cell].z = percentFormat;
        }
        
        // Aplicar formato a estado de cuenta (columna S, filas 5-7)
        for (let row = 4; row <= 6; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 18 });
            if (ws[cell]) ws[cell].z = currencyFormat;
        }
        
        // Aplicar formato a participación (columna X, filas 5-7)
        for (let row = 4; row <= 6; row++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: 23 });
            if (ws[cell]) ws[cell].z = percentFormat;
        }
        
        // ============================================================
        // COMBINAR CELDAS
        // ============================================================
        
        ws['!merges'] = [
            // Fila 1: Título (A1:AH2)
            { s: { r: 0, c: 0 }, e: { r: 1, c: 33 } },
            
            // Fila 4: Encabezados
            { s: { r: 3, c: 0 }, e: { r: 3, c: 15 } },   // INVERSIÓN POR SOCIO
            { s: { r: 3, c: 16 }, e: { r: 3, c: 19 } },  // ESTADO DE CUENTA
            { s: { r: 3, c: 20 }, e: { r: 3, c: 23 } }   // PORCENTAJES
        ];
        
        // ============================================================
        // CONFIGURAR ANCHOS DE COLUMNA
        // ============================================================
        
        ws['!cols'] = [
            { wch: 30 },  // A: Concepto
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 15 },  // N: Monto
            { wch: 10 },  // O: %
            { wch: 5 },
            { wch: 25 },  // Q: Estado cuenta
            { wch: 5 },
            { wch: 15 },  // S: Saldo
            { wch: 5 },
            { wch: 20 },  // U: Socio
            { wch: 5 }, { wch: 5 },
            { wch: 10 },  // X: %
            { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
            { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
            { wch: 5 }, { wch: 15 }  // AH: Fecha
        ];
        
        // Agregar al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Balance General');
        
        // ============================================================
        // GENERAR Y DESCARGAR
        // ============================================================
        
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Balance_General_${fecha}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Balance General exportado:', fileName);
        
        if (typeof showAlert === 'function') {
            showAlert('success', `Balance General exportado: ${fileName}`, 3000);
        }
        
    } catch (error) {
        console.error('❌ Error exportando Balance General:', error);
        if (typeof showAlert === 'function') {
            showAlert('danger', 'Error al exportar: ' + error.message);
        }
    }
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Gastos Reales
window.initializeGastosRealesWidget = initializeGastosRealesWidget;
window.loadGastosRealesData = loadGastosRealesData;
window.exportGastosRealesExcel = exportGastosRealesExcel;
window.updateGastosRealesChart = updateGastosRealesChart;
window.updateGastosRealesTable = updateGastosRealesTable;

// Balance General
window.initializeBalanceGeneralWidget = initializeBalanceGeneralWidget;
window.loadBalanceGeneralData = loadBalanceGeneralData;
window.exportBalanceGeneralExcel = exportBalanceGeneralExcel;
window.updateChartParticipacion = updateChartParticipacion;
window.updateTablaParticipacion = updateTablaParticipacion;

console.log('✅ Reportes Widgets Module cargado');