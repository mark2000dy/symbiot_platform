/* ====================================================
   DASHBOARD TRANSACTIONS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-transactions.js
   Widget de transacciones recientes y gestión
   ==================================================== */

// ============================================================
// 💰 FUNCIONES PRINCIPALES DE TRANSACCIONES
// ============================================================

/**
 * Cargar y renderizar transacciones recientes
 */
async function loadRecentTransactions(page = 1) {
    try {
        console.log(`💰 Cargando transacciones recientes - Página ${page}...`);
        
        // Mostrar estado de carga
        showTransactionsLoadingState(true);
        
        // Construir parámetros
        const params = {
            page: page,
            limit: transactionsPerPage,
            sort: 'fecha DESC' // Más recientes primero
        };
        
        // Agregar filtro de empresa si existe
        if (currentCompanyFilter) {
            params.empresa_id = currentCompanyFilter;
        }
        
        console.log('📡 Parámetros de solicitud:', params);
        
        const response = await apiGet('/gastos/api/transacciones', params);
        
        if (response.success && response.data) {
            // ✅ LIMPIAR Y ACTUALIZAR cache global
            window.recentTransactionsCache = [];  // Limpiar primero
            window.recentTransactionsCache = response.data.slice(); // Copiar array nuevo
            currentPage = page;
            
            console.log(`✅ ${response.data.length} transacciones cargadas`);

            // CORRECCIÓN: Verificar que los elementos DOM existan antes de renderizar
            const tbody = document.getElementById('transactionsBody') || document.getElementById('tableBody');
            const table = document.getElementById('transactionsTable') || document.querySelector('.table-responsive');

            if (!tbody) {
                console.warn('⚠️ Elemento tbody de transacciones no encontrado');
                return;
            }

            if (!table) {
                console.warn('⚠️ Elemento table de transacciones no encontrado');
                return;
            }
            
            // Ocultar estado de carga
            showTransactionsLoadingState(false);
            
            if (response.data.length === 0) {
                showTransactionsEmptyState('No hay transacciones registradas');
            } else {
                // Renderizar tabla y paginación
                renderTransactions(response.data); 
                renderPagination(response.pagination);
            }
            
        } else {
            throw new Error(response.message || 'Error cargando transacciones');
        }
        
    } catch (error) {
        console.error('❌ Error cargando transacciones:', error);
        showTransactionsLoadingState(false);
        showTransactionsError('Error cargando transacciones recientes');
        showAlert('danger', 'Error cargando transacciones: ' + error.message);
    }
}

/**
 * Renderizar tabla de transacciones
 */
function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    const table = document.getElementById('transactionsTable');
    const empty = document.getElementById('emptyState');
    
    if (!transactions || transactions.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    tbody.innerHTML = '';
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        // Usar la lógica exacta del dashboard original aquí
        row.innerHTML = `
            <td>${formatDate(transaction.fecha)}</td>
            <td>${transaction.concepto}</td>
            <td>${transaction.socio}</td>
            <td>${transaction.nombre_empresa || 'N/A'}</td>
            <td><span class="badge ${transaction.tipo === 'I' ? 'badge-success' : 'badge-danger'}">
                <i class="fas ${transaction.tipo === 'I' ? 'fa-arrow-up' : 'fa-arrow-down'} me-1"></i>
                ${transaction.tipo === 'I' ? 'Ingreso' : 'Gasto'}
            </span></td>
            <td class="${transaction.tipo === 'I' ? 'text-success' : 'text-danger'}">
                ${formatCurrency(parseFloat(transaction.total) || parseFloat(transaction.cantidad) * parseFloat(transaction.precio_unitario) || 0)}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTransactionFromDashboard(${transaction.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    table.style.display = 'block';
    empty.style.display = 'none';
}

/**
 * Renderizar fila individual de transacción
 */
function renderTransactionRow(transaction) {
    const formattedDate = transaction.fecha ? formatDate(transaction.fecha) : 'Sin fecha';
    const formattedTotal = formatCurrency(transaction.total || 0);
    const transactionType = transaction.tipo === 'I' ? 'Ingreso' : 'Gasto';
    const amountClass = transaction.tipo === 'I' ? 'text-success' : 'text-danger';
    const amountIcon = transaction.tipo === 'I' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
    
    // Obtener nombre de empresa
    const empresaName = getCompanyName(transaction.empresa_id);
    
    // Truncar concepto si es muy largo
    const conceptoTruncado = transaction.concepto && transaction.concepto.length > 30 
        ? transaction.concepto.substring(0, 30) + '...'
        : transaction.concepto || 'Sin concepto';
    
    return `
        <tr>
            <td>
                <small>${formattedDate}</small>
            </td>
            <td>
                <div title="${transaction.concepto || 'Sin concepto'}">
                    <strong>${conceptoTruncado}</strong>
                    <br><small class="text-muted">${transactionType}</small>
                </div>
            </td>
            <td>
                <small>${transaction.socio || 'Sin especificar'}</small>
            </td>
            <td>
                <small>${empresaName}</small>
            </td>
            <td>
                <span class="badge bg-secondary">${transaction.forma_pago || 'N/A'}</span>
            </td>
            <td>
                <strong class="${amountClass}">
                    <i class="${amountIcon} me-1"></i>${formattedTotal}
                </strong>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewTransactionDetails(${transaction.id})" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${isUserAdmin() ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

/**
 * Renderizar paginación de transacciones
 */
function renderPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    
    if (!pagination || pagination.total_pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Lógica exacta del dashboard original
    if (pagination.current_page > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${pagination.current_page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    }
    
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === pagination.current_page ? 'active' : '';
        paginationHTML += `
            <li class="page-item ${isActive}">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${i})">${i}</a>
            </li>
        `;
    }
    
    if (pagination.current_page < pagination.total_pages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="event.preventDefault(); loadRecentTransactions(${pagination.current_page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

// ============================================================
// 🎨 FUNCIONES DE ESTADOS DE UI
// ============================================================

/**
 * Mostrar/ocultar estado de carga de transacciones
 */
function showTransactionsLoadingState(show) {
    const loading = document.getElementById('transactionsLoading');
    const table = document.getElementById('transactionsTable');
    const empty = document.getElementById('emptyState');
    
    if (show) {
        loading.style.display = 'block';
        table.style.display = 'none';
        empty.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

/**
 * Mostrar estado vacío de transacciones
 */
function showTransactionsEmptyState(message = 'No hay transacciones') {
    const container = document.getElementById('recentTransactionsContainer');
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-receipt fa-3x mb-3"></i>
            <h5>Sin Transacciones</h5>
            <p class="text-muted">${message}</p>
            <button class="btn btn-primary btn-sm" onclick="showAddTransactionModal()">
                <i class="fas fa-plus me-1"></i>Nueva Transacción
            </button>
        </div>
    `;
    
    const paginationNav = document.getElementById('transactionsPaginationNav');
    if (paginationNav) {
        paginationNav.style.display = 'none';
    }
}

/**
 * Mostrar estado de error de transacciones
 */
function showTransactionsError(message = 'Error cargando datos') {
    const container = document.getElementById('recentTransactionsContainer');
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
            <h5>Error de Carga</h5>
            <p class="text-muted">${message}</p>
            <button class="btn btn-outline-primary btn-sm" onclick="loadRecentTransactions(currentPage)">
                <i class="fas fa-sync-alt me-1"></i>Reintentar
            </button>
        </div>
    `;
    
    const paginationNav = document.getElementById('transactionsPaginationNav');
    if (paginationNav) {
        paginationNav.style.display = 'none';
    }
}

// ============================================================
// 🔧 FUNCIONES DE GESTIÓN DE TRANSACCIONES
// ============================================================

/**
 * Editar transacción existente
 */
async function editTransaction(transactionId) {
    console.log('✏️ Editando transacción:', transactionId);
    
    try {
        // Buscar la transacción en el caché
        let transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            console.warn('⚠️ Transacción no encontrada en caché, consultando API...');
            
            const response = await fetch(`/gastos/api/transacciones/${transactionId}`, {
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error('No se pudo obtener la transacción');
            }
            
            const result = await response.json();
            transaction = result.data;
        }
        
        if (!transaction) {
            showAlert('warning', 'Transacción no encontrada');
            return;
        }
        
        console.log('📄 Datos de la transacción:', transaction);
        
        // Establecer modo de edición GLOBAL
        window.editingTransactionId = transactionId;
        
        // Obtener el modal
        const modal = document.getElementById('transactionModal');
        if (!modal) {
            console.error('❌ Modal de transacción no encontrado');
            return;
        }
        
        // ⭐ CARGAR FECHA CORRECTAMENTE
        const fechaInput = document.getElementById('transactionDate');
        if (fechaInput && transaction.fecha) {
            // Convertir fecha del formato "YYYY-MM-DD HH:mm:ss" a "YYYY-MM-DD"
            const fechaSolo = transaction.fecha.split(' ')[0].split('T')[0];
            fechaInput.value = fechaSolo;
            console.log('📅 Fecha cargada:', fechaSolo);
        }
        
        // Llenar resto de campos
        const camposMap = {
            'transactionType': transaction.tipo,
            'transactionConcept': transaction.concepto,
            'transactionPartner': transaction.socio,
            'transactionCompany': transaction.empresa_id,
            'transactionPaymentMethod': transaction.forma_pago,
            'transactionQuantity': transaction.cantidad || 1,
            'transactionUnitPrice': transaction.precio_unitario || 0
        };
        
        Object.entries(camposMap).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value !== null && value !== undefined) {
                field.value = value;
                console.log(`✅ Campo ${fieldId}: ${value}`);
            }
        });
        
        // Calcular y mostrar total
        if (typeof calculateTotal === 'function') {
            calculateTotal();
        }
        
        // Cambiar título del modal
        const modalTitle = document.querySelector('#transactionModal .modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Transacción';
        }
        
        // Cambiar texto del botón
        const saveBtn = document.querySelector('#transactionModal .btn-primary');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Actualizar Transacción';
        }
        
        // Mostrar botón de eliminar
        const deleteBtn = document.getElementById('deleteTransactionBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
            deleteBtn.onclick = () => deleteTransactionFromModal(transactionId);
        }
        
        // Mostrar modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        console.log('✅ Modal de edición abierto');
        
    } catch (error) {
        console.error('❌ Error editando transacción:', error);
        showAlert('danger', 'Error al abrir editor de transacciones');
    }
}

/**
 * Ver detalles completos de transacción
 */
async function viewTransactionDetails(transactionId) {
    try {
        console.log(`👁️ Viendo detalles de transacción ID: ${transactionId}`);
        
        // Buscar transacción en cache
        let transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            // Si no está en cache, cargar desde API
            const response = await apiGet(`/gastos/api/transacciones/${transactionId}`);
            if (!response.success) {
                throw new Error('Transacción no encontrada');
            }
            transaction = response.data;
        }
        
        // Crear modal de detalles dinámicamente
        const detailsModal = createTransactionDetailsModal(transaction);
        
        // Agregar modal al DOM temporalmente
        document.body.appendChild(detailsModal);
        
        // Mostrar modal
        const modalInstance = new bootstrap.Modal(detailsModal);
        modalInstance.show();
        
        // Remover modal del DOM cuando se cierre
        detailsModal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(detailsModal);
        });
        
        console.log('✅ Modal de detalles mostrado');
        
    } catch (error) {
        console.error('❌ Error mostrando detalles:', error);
        showAlert('danger', 'Error cargando detalles de la transacción');
    }
}

/**
 * Crear modal de detalles de transacción
 */
function createTransactionDetailsModal(transaction) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = -1;
    
    const formattedDate = transaction.fecha ? formatDate(transaction.fecha) : 'Sin fecha';
    const formattedTotal = formatCurrency(transaction.total || 0);
    const transactionType = transaction.tipo === 'I' ? 'Ingreso' : 'Gasto';
    const typeClass = transaction.tipo === 'I' ? 'success' : 'danger';
    const empresaName = getCompanyName(transaction.empresa_id);
    
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-receipt me-2"></i>
                        Detalles de Transacción
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                            <table class="table table-dark table-sm">
                                <tr>
                                    <td><strong>ID:</strong></td>
                                    <td>#${transaction.id}</td>
                                </tr>
                                <tr>
                                    <td><strong>Fecha:</strong></td>
                                    <td>${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td><strong>Tipo:</strong></td>
                                    <td><span class="badge bg-${typeClass}">${transactionType}</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Empresa:</strong></td>
                                    <td>${empresaName}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-dollar-sign me-2"></i>Información Financiera</h6>
                            <table class="table table-dark table-sm">
                                <tr>
                                    <td><strong>Cantidad:</strong></td>
                                    <td>${transaction.cantidad || 1}</td>
                                </tr>
                                <tr>
                                    <td><strong>Precio Unitario:</strong></td>
                                    <td>${formatCurrency(transaction.precio_unitario || 0)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total:</strong></td>
                                    <td><strong class="text-${typeClass}">${formattedTotal}</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>Forma de Pago:</strong></td>
                                    <td><span class="badge bg-secondary">${transaction.forma_pago || 'N/A'}</span></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <hr>
                    <h6><i class="fas fa-file-alt me-2"></i>Descripción</h6>
                    <div class="alert alert-dark">
                        <strong>Concepto:</strong> ${transaction.concepto || 'Sin descripción'}
                    </div>
                    <div class="alert alert-dark">
                        <strong>Socio/Responsable:</strong> ${transaction.socio || 'Sin especificar'}
                    </div>
                    ${transaction.created_at ? `
                        <hr>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            Registrado el ${formatDate(transaction.created_at)}
                        </small>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" onclick="editTransaction(${transaction.id}); this.closest('.modal').querySelector('[data-bs-dismiss]').click();">
                        <i class="fas fa-edit me-1"></i>Editar
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modalDiv;
}

/**
 * Eliminar transacción (solo administradores)
 */
async function deleteTransactionFromList(transactionId) {
    try {
        // Buscar transacción para obtener información
        const transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            showAlert('warning', 'Transacción no encontrada');
            return;
        }
        
        // Confirmación
        const confirmMessage = `¿Eliminar la transacción "${transaction.concepto}"?\n\n` +
                              `Total: ${formatCurrency(transaction.total || (transaction.cantidad * transaction.precio_unitario) || 0)}\n` +
                              `Fecha: ${formatDate(transaction.fecha)}\n\n` +
                              `Esta acción no se puede deshacer.`;
        
        if (!confirm(confirmMessage)) {
            console.log('🚫 Eliminación cancelada por el usuario');
            return;
        }
        
        console.log(`🗑️ Eliminando transacción: ${transaction.concepto} (ID: ${transactionId})`);
    
        // Llamar a la API directamente
        const response = await fetch(`/gastos/api/transacciones/${transactionId}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Error eliminando transacción');
        }

        // Recargar transacciones
        await loadRecentTransactions(currentPage);

        showAlert('success', `Transacción "${transaction.concepto}" eliminada exitosamente`);
        
        console.log(`✅ Transacción eliminada: ${transaction.concepto}`);
        
    } catch (error) {
        console.error('❌ Error eliminando transacción:', error);
        showAlert('danger', `Error eliminando transacción: ${error.message}`);
    }
}

/**
 * Eliminar transacción desde el modal con confirmación
 */
async function deleteTransactionFromModal(transactionId) {
    try {
        // Buscar información de la transacción
        const transaction = window.recentTransactionsCache.find(t => t.id == transactionId);
        
        if (!transaction) {
            showAlert('warning', 'Transacción no encontrada');
            return;
        }
        
        // ⭐ CONFIRMACIÓN CON DIÁLOGO NATIVO
        const confirmMessage = `¿Estás seguro de que deseas eliminar esta transacción?\n\n` +
                              `Concepto: ${transaction.concepto}\n` +
                              `Total: $${(transaction.cantidad * transaction.precio_unitario).toFixed(2)}\n` +
                              `Fecha: ${transaction.fecha.split('T')[0]}\n\n` +
                              `Esta acción no se puede deshacer.`;
        
        if (!confirm(confirmMessage)) {
            console.log('❌ Usuario canceló la eliminación');
            return;
        }
        
        // Mostrar indicador de carga
        const deleteBtn = document.getElementById('deleteTransactionBtn');
        const originalText = deleteBtn ? deleteBtn.innerHTML : '';
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Eliminando...';
        }
        
        // Llamar al API para eliminar
        const response = await fetch(`/gastos/api/transacciones/${transactionId}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Transacción eliminada exitosamente');
            showAlert('success', 'Transacción eliminada correctamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
            if (modal) modal.hide();
            
            // Limpiar ID de edición
            window.editingTransactionId = null;
            
            // Recargar transacciones
            if (typeof loadRecentTransactions === 'function') {
                await loadRecentTransactions();
            }
        } else {
            throw new Error(result.message || 'Error al eliminar transacción');
        }
        
    } catch (error) {
        console.error('❌ Error eliminando transacción:', error);
        showAlert('danger', `Error: ${error.message}`);
    } finally {
        // Restaurar botón
        const deleteBtn = document.getElementById('deleteTransactionBtn');
        if (deleteBtn && originalText) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    }
}

// ============================================================
// 🔧 FUNCIONES DE UTILIDAD
// ============================================================

/**
 * Obtener nombre de empresa por ID
 */
function getCompanyName(empresaId) {
    const companies = {
        '1': 'Rockstar Skull',
        '2': 'Symbiot Technologies'
    };
    return companies[empresaId] || 'Empresa Desconocida';
}

/**
 * Configurar listeners para cálculo automático
 */
function setupCalculationListeners() {
    const quantityInput = document.getElementById('transactionQuantity');
    const priceInput = document.getElementById('transactionPrice');
    
    if (quantityInput && priceInput) {
        function updateTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            
            const totalInput = document.getElementById('transactionTotal');
            if (totalInput) {
                totalInput.value = formatCurrency(total);
            }
        }
        
        quantityInput.addEventListener('input', updateTotal);
        priceInput.addEventListener('input', updateTotal);
        
        console.log('✅ Listeners de cálculo configurados');
    }
}

/**
 * Exportar transacciones a CSV
 */
function exportTransactionsToCSV() {
    try {
        console.log('📊 Exportando transacciones a CSV...');
        
        if (!window.recentTransactionsCache || window.recentTransactionsCache.length === 0) {
            showAlert('warning', 'No hay transacciones para exportar');
            return;
        }
        
        // Crear contenido CSV
        const headers = ['Fecha', 'Concepto', 'Socio', 'Empresa', 'Forma de Pago', 'Cantidad', 'Precio Unitario', 'Total', 'Tipo'];
        const csvContent = [
            headers.join(','),
            ...window.recentTransactionsCache.map(transaction => [
                transaction.fecha || '',
                `"${(transaction.concepto || '').replace(/"/g, '""')}"`,
                `"${(transaction.socio || '').replace(/"/g, '""')}"`,
                `"${getCompanyName(transaction.empresa_id)}"`,
                transaction.forma_pago || '',
                transaction.cantidad || 0,
                transaction.precio_unitario || 0,
                transaction.total || 0,
                transaction.tipo === 'I' ? 'Ingreso' : 'Gasto'
            ].join(','))
        ].join('\n');
        
        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('success', 'Transacciones exportadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error exportando transacciones:', error);
        showAlert('danger', 'Error exportando transacciones');
    }
}

/**
 * Filtrar transacciones por texto
 */
function filterTransactions(searchText) {
    if (!searchText || searchText.trim() === '') {
        // Si no hay filtro, recargar todas las transacciones
        loadRecentTransactions(1);
        return;
    }
    
    const filteredTransactions = window.recentTransactionsCache.filter(transaction => {
        const searchLower = searchText.toLowerCase();
        return (
            (transaction.concepto && transaction.concepto.toLowerCase().includes(searchLower)) ||
            (transaction.socio && transaction.socio.toLowerCase().includes(searchLower)) ||
            (transaction.forma_pago && transaction.forma_pago.toLowerCase().includes(searchLower))
        );
    });
    
    console.log(`🔍 Filtro aplicado: "${searchText}" - ${filteredTransactions.length} resultados`);
    
    if (filteredTransactions.length === 0) {
        showTransactionsEmptyState(`No se encontraron transacciones que coincidan con "${searchText}"`);
    } else {
        renderTransactionsTable(filteredTransactions);
        // Ocultar paginación cuando se filtran resultados
        const paginationNav = document.getElementById('transactionsPaginationNav');
        if (paginationNav) {
            paginationNav.style.display = 'none';
        }
    }
}

/**
 * Actualizar transacciones
 */
function refreshTransactions() {
    console.log('🔄 Actualizando transacciones...');
    if (typeof loadRecentTransactions === 'function') {
        loadRecentTransactions(1);
    } else {
        showAlert('info', 'Función de transacciones en desarrollo');
    }
}

/**
 * Mostrar modal de nueva transacción
 */
function showAddTransactionModal() {
    console.log('➕ Mostrando modal de nueva transacción...');
    const modal = new bootstrap.Modal(document.getElementById('addTransactionModal'));
    modal.show();
}

/**
 * Calcular total en modal de transacción
 */
function calculateTotal() {
    const quantity = parseFloat(document.getElementById('transactionQuantity')?.value) || 0;
    const unitPrice = parseFloat(document.getElementById('transactionUnitPrice')?.value) || 0;
    const total = quantity * unitPrice;
    
    const totalElement = document.getElementById('transactionTotal');
    if (totalElement) {
        totalElement.value = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(total);
    }
}

/**
 * Actualizar estilo según tipo de transacción
 */
function updateTransactionTypeStyle() {
    const typeSelect = document.getElementById('transactionType');
    if (typeSelect) {
        const type = typeSelect.value;
        if (type === 'I') {
            typeSelect.className = 'form-select border-success';
        } else if (type === 'G') {
            typeSelect.className = 'form-select border-danger';
        } else {
            typeSelect.className = 'form-select';
        }
    }
}

/**
 * Enviar nueva transacción
 */
function submitTransaction() {
    console.log('💾 Enviando nueva transacción...');
    showAlert('info', 'Función de crear transacción en desarrollo');
}

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Funciones principales
window.loadRecentTransactions = loadRecentTransactions;
window.editTransaction = editTransaction;
window.viewTransactionDetails = viewTransactionDetails;
window.deleteTransactionFromList = deleteTransactionFromList;
window.deleteTransactionFromModal = deleteTransactionFromModal;

// Funciones de UI
window.showTransactionsLoadingState = showTransactionsLoadingState;
window.showTransactionsEmptyState = showTransactionsEmptyState;
window.showTransactionsError = showTransactionsError;

// Funciones de utilidad
window.setupCalculationListeners = setupCalculationListeners;
window.exportTransactionsToCSV = exportTransactionsToCSV;
window.filterTransactions = filterTransactions;
window.getCompanyName = getCompanyName;

window.refreshTransactions = refreshTransactions;
window.showAddTransactionModal = showAddTransactionModal;
window.calculateTotal = calculateTotal;
window.updateTransactionTypeStyle = updateTransactionTypeStyle;
window.submitTransaction = submitTransaction;

console.log('✅ Dashboard Transactions Module cargado - Funciones de transacciones disponibles');