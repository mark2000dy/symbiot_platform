/* ====================================================
   DASHBOARD MODALS MODULE - SYMBIOT FINANCIAL MANAGER
   Archivo: public/js/dashboard-modals.js
   Todos los modales y formularios del sistema
   ==================================================== */

// ============================================================
// 🎓 MODALES DE GESTIÓN DE ALUMNOS
// ============================================================

/**
 * Crear HTML del modal de editar alumno
 */
function createEditStudentModalHTML() {
    return `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-edit me-2"></i>
                        Editar Información del Alumno
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editStudentForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Nombre Completo *
                                </label>
                                <input type="text" class="form-control" id="editStudentName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentAge" class="form-label">
                                    <i class="fas fa-birthday-cake me-1"></i>Edad *
                                </label>
                                <input type="number" class="form-control" id="editStudentAge" min="1" max="100" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentPhone" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Teléfono
                                </label>
                                <input type="tel" class="form-control" id="editStudentPhone" placeholder="Ej: 5512345678">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEmail" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>Email
                                </label>
                                <input type="email" class="form-control" id="editStudentEmail" placeholder="alumno@email.com">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentEnrollmentDate" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de Inscripción *
                                </label>
                                <input type="date" class="form-control" id="editStudentEnrollmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentInstrument" class="form-label">
                                    <i class="fas fa-music me-1"></i>Instrumento/Clase *
                                </label>
                                <select class="form-select" id="editStudentInstrument" required>
                                    <option value="">Selecciona instrumento</option>
                                    <option value="Guitarra">🎸 Guitarra Eléctrica</option>
                                    <option value="Teclado">🎹 Teclado/Piano</option>
                                    <option value="Batería">🥁 Batería</option>
                                    <option value="Bajo">🎸 Bajo Eléctrico</option>
                                    <option value="Canto">🎤 Canto</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="editStudentTeacher" class="form-label">
                                    <i class="fas fa-chalkboard-teacher me-1"></i>Maestro Asignado
                                </label>
                                <select class="form-select" id="editStudentTeacher">
                                    <option value="">Selecciona maestro</option>
                                    <!-- Se llena dinámicamente -->
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editStudentSchedule" class="form-label">
                                    <i class="fas fa-clock me-1"></i>Horario
                                </label>
                                <input type="text" class="form-control" id="editStudentSchedule" placeholder="Ej: Lunes 4:00 PM">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="editStudentStatus" class="form-label">
                                    <i class="fas fa-toggle-on me-1"></i>Estatus *
                                </label>
                                <select class="form-select" id="editStudentStatus" required>
                                    <option value="Activo">✅ Activo</option>
                                    <option value="Baja">❌ Baja</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentPromotion" class="form-label">
                                    <i class="fas fa-tags me-1"></i>Promoción
                                </label>
                                <input type="text" class="form-control" id="editStudentPromotion" placeholder="Ej: Descuento 10%">
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentMonthlyFee" class="form-label">
                                    <i class="fas fa-dollar-sign me-1"></i>Mensualidad *
                                </label>
                                <input type="number" class="form-control" id="editStudentMonthlyFee" min="0" step="0.01" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="editStudentPaymentMethod" class="form-label">
                                    <i class="fas fa-credit-card me-1"></i>Forma de Pago
                                </label>
                                <select class="form-select" id="editStudentPaymentMethod">
                                    <option value="">Selecciona forma de pago</option>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="Transferencia">🏦 Transferencia</option>
                                    <option value="TDC">💳 Tarjeta de Crédito</option>
                                    <option value="TDD">💳 Tarjeta de Débito</option>
                                    <option value="TPV">📱 TPV</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentDomiciled" class="form-label">
                                    <i class="fas fa-home me-1"></i>Domiciliado
                                </label>
                                <select class="form-select" id="editStudentDomiciled" onchange="toggleDomiciliadoName()">
                                    <option value="No">❌ No</option>
                                    <option value="Si">✅ Sí</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="editStudentDomiciliedName" class="form-label">
                                    <i class="fas fa-user-tag me-1"></i>Nombre Domiciliado
                                </label>
                                <input type="text" class="form-control" id="editStudentDomiciliedName" placeholder="Nombre para domiciliación" disabled>
                            </div>
                        </div>
                        
                        <input type="hidden" id="editStudentId" value="">
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-danger" onclick="deleteStudent()" style="display: none;">
                        <i class="fas fa-trash me-1"></i>Eliminar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveStudentChanges()">
                        <i class="fas fa-save me-1"></i>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Crear HTML del modal de nuevo alumno
 */
function createAddStudentModalHTML() {
    return `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-plus me-2"></i>
                        Registrar Nuevo Alumno
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addStudentForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentName" class="form-label">
                                    <i class="fas fa-user me-1"></i>Nombre Completo *
                                </label>
                                <input type="text" class="form-control" id="newStudentName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentAge" class="form-label">
                                    <i class="fas fa-birthday-cake me-1"></i>Edad *
                                </label>
                                <input type="number" class="form-control" id="newStudentAge" min="1" max="100" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentPhone" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Teléfono
                                </label>
                                <input type="tel" class="form-control" id="newStudentPhone" placeholder="Ej: 5512345678">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentEmail" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>Email
                                </label>
                                <input type="email" class="form-control" id="newStudentEmail" placeholder="alumno@email.com">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentEnrollmentDate" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de Inscripción *
                                </label>
                                <input type="date" class="form-control" id="newStudentEnrollmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentInstrument" class="form-label">
                                    <i class="fas fa-music me-1"></i>Instrumento/Clase *
                                </label>
                                <select class="form-select" id="newStudentInstrument" required>
                                    <option value="">Selecciona instrumento</option>
                                    <option value="Guitarra">🎸 Guitarra Eléctrica</option>
                                    <option value="Teclado">🎹 Teclado/Piano</option>
                                    <option value="Batería">🥁 Batería</option>
                                    <option value="Bajo">🎸 Bajo Eléctrico</option>
                                    <option value="Canto">🎤 Canto</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentTeacher" class="form-label">
                                    <i class="fas fa-chalkboard-teacher me-1"></i>Maestro Asignado
                                </label>
                                <select class="form-select" id="newStudentTeacher">
                                    <option value="">Selecciona maestro</option>
                                    <!-- Se llena dinámicamente -->
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentSchedule" class="form-label">
                                    <i class="fas fa-clock me-1"></i>Horario
                                </label>
                                <input type="text" class="form-control" id="newStudentSchedule" placeholder="Ej: Lunes 4:00 PM">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="newStudentPromotion" class="form-label">
                                    <i class="fas fa-tags me-1"></i>Promoción
                                </label>
                                <input type="text" class="form-control" id="newStudentPromotion" placeholder="Ej: Descuento 10%">
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="newStudentMonthlyFee" class="form-label">
                                    <i class="fas fa-dollar-sign me-1"></i>Mensualidad *
                                </label>
                                <input type="number" class="form-control" id="newStudentMonthlyFee" min="0" step="0.01" value="1200" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="newStudentPaymentMethod" class="form-label">
                                    <i class="fas fa-credit-card me-1"></i>Forma de Pago
                                </label>
                                <select class="form-select" id="newStudentPaymentMethod">
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="Transferencia">🏦 Transferencia</option>
                                    <option value="TDC">💳 Tarjeta de Crédito</option>
                                    <option value="TDD">💳 Tarjeta de Débito</option>
                                    <option value="TPV">📱 TPV</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="newStudentDomiciled" class="form-label">
                                    <i class="fas fa-home me-1"></i>Domiciliado
                                </label>
                                <select class="form-select" id="newStudentDomiciled" onchange="toggleNewStudentDomiciliadoName()">
                                    <option value="No">❌ No</option>
                                    <option value="Si">✅ Sí</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="newStudentDomiciliedName" class="form-label">
                                    <i class="fas fa-user-tag me-1"></i>Nombre Domiciliado
                                </label>
                                <input type="text" class="form-control" id="newStudentDomiciliedName" placeholder="Nombre para domiciliación" disabled>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" onclick="saveNewStudent()">
                        <i class="fas fa-save me-1"></i>Registrar Alumno
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Crear HTML del modal de detalle de alumno
 */
function createStudentDetailModalHTML() {
    return `
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark">
            <div class="modal-header">
                <h5 class="modal-title text-white">
                    <i class="fas fa-user-circle me-2"></i>Detalle del Alumno
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-white">Información Personal</h6>
                        <p><strong>Nombre:</strong> <span id="modalStudentName">-</span></p>
                        <p><strong>Edad:</strong> <span id="modalStudentAge">-</span></p>
                        <p><strong>Instrumento:</strong> <span id="modalStudentInstrument">-</span></p>
                        <p><strong>Maestro:</strong> <span id="modalStudentTeacher">-</span></p>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-white">Información de Pagos</h6>
                        <p><strong>Inscripción:</strong> <span id="modalStudentEnrollment">-</span></p>
                        <p><strong>Mensualidad:</strong> <span id="modalStudentFee">-</span></p>
                        <p><strong>Último Pago:</strong> <span id="modalStudentLastPayment">-</span></p>
                        <p><strong>Estado:</strong> <span id="modalStudentStatus">-</span></p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fas fa-times me-1"></i>Cerrar
                </button>
            </div>
        </div>
    </div>`;
}

// ============================================================
// 💰 MANEJO DEL MODAL DE TRANSACCIONES
// ============================================================

/**
 * Configurar listeners del modal de nueva transacción
 */
function setupTransactionModalListeners() {
    // Listener para cálculo automático del total
    const quantityInput = document.getElementById('transactionQuantity');
    const priceInput = document.getElementById('transactionPrice');
    const totalInput = document.getElementById('transactionTotal');
    
    function calculateTotal() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;
        
        totalInput.value = formatCurrency(total);
    }
    
    if (quantityInput && priceInput) {
        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
    }
}

/**
 * Mostrar modal de nueva transacción
 */
function showAddTransactionModal() {
    try {
        console.log('🎭 Abriendo modal de nueva transacción');
        
        // Limpiar formulario
        const form = document.getElementById('addTransactionForm');
        if (form) {
            form.reset();
            clearFormErrors('addTransactionForm');
        }
        
        // Establecer fecha actual
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Mostrar modal
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }
        
        console.log('✅ Modal de transacción abierto');
        
    } catch (error) {
        console.error('❌ Error abriendo modal:', error);
    }
}

/**
 * Enviar nueva transacción al servidor
 */
async function submitTransaction() {
    try {
        console.log('💾 Iniciando envío de transacción...');
        
        // Obtener valores del formulario
        const fecha = document.getElementById('transactionDate')?.value;
        const tipo = document.getElementById('transactionType')?.value;
        const empresa_id = parseInt(document.getElementById('transactionCompany')?.value);
        const socio = document.getElementById('transactionPartner')?.value;
        const concepto = document.getElementById('transactionConcept')?.value;
        const cantidad = parseInt(document.getElementById('transactionQuantity')?.value);
        const precio_unitario = parseFloat(document.getElementById('transactionUnitPrice')?.value);
        const forma_pago = document.getElementById('transactionPaymentMethod')?.value;
        
        // Validar campos requeridos
        if (!fecha) {
            showAlert('warning', 'Por favor selecciona una fecha');
            return;
        }
        
        if (!tipo) {
            showAlert('warning', 'Por favor selecciona el tipo de transacción');
            return;
        }
        
        if (!empresa_id) {
            showAlert('warning', 'Por favor selecciona una empresa');
            return;
        }
        
        if (!socio || socio.trim() === '') {
            showAlert('warning', 'Por favor ingresa el socio/cliente');
            return;
        }
        
        if (!concepto || concepto.trim() === '') {
            showAlert('warning', 'Por favor ingresa el concepto');
            return;
        }
        
        if (!cantidad || cantidad <= 0) {
            showAlert('warning', 'Por favor ingresa una cantidad válida');
            return;
        }
        
        if (!precio_unitario || precio_unitario <= 0) {
            showAlert('warning', 'Por favor ingresa un precio unitario válido');
            return;
        }
        
        if (!forma_pago) {
            showAlert('warning', 'Por favor selecciona una forma de pago');
            return;
        }
        
        // Preparar datos
        const transactionData = {
            fecha,
            tipo,
            empresa_id,
            socio,
            concepto,
            cantidad,
            precio_unitario,
            forma_pago
        };
        
        console.log('📦 Datos a enviar:', transactionData);
        
        // Deshabilitar botón mientras se procesa
        const submitButton = document.querySelector('#addTransactionModal button[onclick="submitTransaction()"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Guardando...';
        }
        
        // Enviar al servidor
        const response = await window.createTransaction(transactionData);
        
        if (response.success) {
            console.log('✅ Transacción creada exitosamente');
            
            // Mostrar mensaje de éxito
            showAlert('success', 'Transacción registrada exitosamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
            if (modal) {
                modal.hide();
            }
            
            // Limpiar formulario
            document.getElementById('transactionForm')?.reset();
            
            // Refrescar datos del dashboard
            if (typeof window.loadDashboardData === 'function') {
                await window.loadDashboardData();
            }
            
            // Refrescar lista de transacciones si existe
            if (typeof window.loadRecentTransactions === 'function') {
                await window.loadRecentTransactions(1);
            }
            
            console.log('✅ Dashboard actualizado');
            
        } else {
            throw new Error(response.message || 'Error guardando transacción');
        }
        
    } catch (error) {
        console.error('❌ Error en submitTransaction:', error);
        showAlert('danger', `Error: ${error.message}`);
        
        // Re-habilitar botón
        const submitButton = document.querySelector('#addTransactionModal button[onclick="submitTransaction()"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-save me-1"></i>Guardar Transacción';
        }
    }
}

// ============================================================
// 🔧 FUNCIONES DE INICIALIZACIÓN DE MODALES
// ============================================================

/**
 * Inicializar todos los modales del sistema
 */
function initializeModals() {
    try {
        console.log('🎭 Inicializando modales del sistema...');
        
        // Crear contenido de modales de alumnos
        createStudentModals();
        
        // Configurar modal de transacciones
        setupTransactionModal();
        
        // Configurar listeners globales
        setupGlobalModalListeners();
        
        console.log('✅ Modales inicializados correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando modales:', error);
    }
}

/**
 * Crear modales de alumnos dinámicamente
 */
function createStudentModals() {
    // Modal de editar alumno
    const editStudentModal = document.getElementById('editStudentModal');
    if (editStudentModal) {
        editStudentModal.innerHTML = createEditStudentModalHTML();
    }
    
    // Modal de nuevo alumno
    const addStudentModal = document.getElementById('addStudentModal');
    if (addStudentModal) {
        addStudentModal.innerHTML = createAddStudentModalHTML();
    }
    
    console.log('✅ Modales de alumnos creados');
}

/**
 * Configurar modal de transacciones
 */
function setupTransactionModal() {
    try {
        // Inicializar instancia del modal
        const modalElement = document.getElementById('addTransactionModal');
        if (modalElement) {
            addTransactionModalInstance = new bootstrap.Modal(modalElement);
            console.log('✅ Modal de transacciones inicializado');
        }
        
        // Configurar listeners
        setupTransactionModalListeners();
        
    } catch (error) {
        console.error('❌ Error configurando modal de transacciones:', error);
    }
}

/**
 * Configurar listeners globales para modales
 */
function setupGlobalModalListeners() {
    // Listener para limpiar formularios al cerrar modales
    document.addEventListener('hidden.bs.modal', function (event) {
        const modal = event.target;
        const forms = modal.querySelectorAll('form');
        
        forms.forEach(form => {
            // Limpiar validación de Bootstrap
            form.classList.remove('was-validated');
            
            // Limpiar mensajes de error personalizados
            const errorMessages = form.querySelectorAll('.invalid-feedback');
            errorMessages.forEach(msg => msg.remove());
        });
    });
    
    // Listener para manejar validación en tiempo real
    document.addEventListener('input', function (event) {
        const input = event.target;
        
        if (input.classList.contains('form-control') || input.classList.contains('form-select')) {
            // Validar campo individual
            validateFormField(input);
        }
    });
    
    console.log('✅ Listeners globales de modales configurados');
}

// ============================================================
// ✅ FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Validar campo individual de formulario
 */
function validateFormField(field) {
    const isValid = field.checkValidity();
    
    // Remover clases anteriores
    field.classList.remove('is-valid', 'is-invalid');
    
    // Agregar clase apropiada
    if (isValid) {
        field.classList.add('is-valid');
    } else {
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

/**
 * Validar formulario completo
 */
function validateForm(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
        console.warn(`⚠️ Formulario ${formId} no encontrado`);
        return false;
    }
    
    const fields = form.querySelectorAll('.form-control, .form-select');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateFormField(field)) {
            isValid = false;
        }
    });
    
    // Agregar clase de validación de Bootstrap
    form.classList.add('was-validated');
    
    return isValid;
}

/**
 * Mostrar mensaje de error en campo específico
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    
    if (!field) {
        console.warn(`⚠️ Campo ${fieldId} no encontrado`);
        return;
    }
    
    // Marcar campo como inválido
    field.classList.add('is-invalid');
    
    // Buscar o crear contenedor de mensaje de error
    let errorContainer = field.parentNode.querySelector('.invalid-feedback');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'invalid-feedback';
        field.parentNode.appendChild(errorContainer);
    }
    
    errorContainer.textContent = message;
}

/**
 * Limpiar errores de formulario
 */
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    
    if (!form) {
        console.warn(`⚠️ Formulario ${formId} no encontrado`);
        return;
    }
    
    // Remover clases de validación
    form.classList.remove('was-validated');
    
    // Remover clases de campos
    const fields = form.querySelectorAll('.form-control, .form-select');
    fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
    });
    
    // Remover mensajes de error
    const errorMessages = form.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(msg => msg.remove());
}

// ============================================================
// 🔄 FUNCIONES DE UTILIDAD PARA MODALES
// ============================================================

/**
 * Mostrar modal por ID
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } else {
        console.warn(`⚠️ Modal ${modalId} no encontrado`);
    }
}

/**
 * Ocultar modal por ID
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    } else {
        console.warn(`⚠️ Modal ${modalId} no encontrado`);
    }
}

/**
 * Verificar si un modal está abierto
 */
function isModalOpen(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        return modal.classList.contains('show');
    }
    return false;
}

/**
 * CORRECCIÓN: Funciones faltantes para transacciones
 */
function updateTransactionTypeStyle() {
    const typeSelect = document.getElementById('transactionType');
    if (typeSelect) {
        const selectedType = typeSelect.value;
        
        // Cambiar estilo según el tipo
        typeSelect.classList.remove('border-success', 'border-danger');
        
        if (selectedType === 'I') {
            typeSelect.classList.add('border-success');
        } else if (selectedType === 'G') {
            typeSelect.classList.add('border-danger');
        }
    }
}

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('transactionQuantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('transactionUnitPrice').value) || 0;
    const total = quantity * unitPrice;
    
    const totalInput = document.getElementById('transactionTotal');
    if (totalInput) {
        totalInput.value = formatCurrency(total);
    }
}

function refreshTransactions() {
    if (typeof loadRecentTransactions === 'function') {
        loadRecentTransactions(1);
    } else {
        console.error('❌ Función loadRecentTransactions no disponible');
    }
}

function editTransactionFromDashboard(transactionId) {
    console.log('📝 Editando transacción:', transactionId);
    showAlert('info', 'Funcionalidad de edición en desarrollo');
}

/**
 * Función de edición de transacciones
 */
function editTransactionFromDashboard(transactionId) {
    console.log('📝 Editando transacción ID:', transactionId);
    
    try {
        // Buscar la transacción en los datos cargados
        const transaction = window.recentTransactionsCache?.find(t => t.id == transactionId);
        
        if (!transaction) {
            showAlert('warning', 'Transacción no encontrada en caché. Recargando...');
            if (typeof refreshTransactions === 'function') {
                refreshTransactions();
            }
            return;
        }
        
        // CORRECCIÓN: Cargar datos en modal de edición
        loadTransactionInModal(transaction);
        
        // Mostrar modal
        const modal = document.getElementById('editTransactionModal') || document.getElementById('addTransactionModal');
        if (modal) {
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }
        
    } catch (error) {
        console.error('❌ Error editando transacción:', error);
        showAlert('danger', 'Error abriendo editor de transacciones');
    }
}

/**
 * FUNCIÓN AUXILIAR: Cargar transacción en modal
 */
function loadTransactionInModal(transaction) {
    // Cambiar título del modal
    const modalTitle = document.querySelector('#addTransactionModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Transacción';
    }
    
    // Cargar datos en formulario
    const fields = {
        'transactionDate': transaction.fecha,
        'transactionType': transaction.tipo,
        'transactionConcept': transaction.concepto,
        'transactionPartner': transaction.socio,
        'transactionCompany': transaction.empresa_id,
        'transactionPayment': transaction.forma_pago,
        'transactionQuantity': transaction.cantidad,
        'transactionUnitPrice': transaction.precio_unitario
    };
    
    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field && value !== null && value !== undefined) {
            field.value = value;
        }
    });
    
    // Calcular total
    if (typeof calculateTotal === 'function') {
        calculateTotal();
    }
    
    // Guardar ID para actualización
    window.editingTransactionId = transaction.id;
}

/**
 * Resetear modal de transacción a modo creación
 */
function resetTransactionModal() {
    console.log('🔄 Reseteando modal a modo creación...');
    
    // Limpiar variable global
    window.editingTransactionId = null;
    
    // Limpiar formulario
    const form = document.getElementById('transactionForm');
    if (form) form.reset();
    
    // Restaurar título
    const modalTitle = document.querySelector('#transactionModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Nueva Transacción';
    }
    
    // Restaurar texto del botón
    const saveBtn = document.querySelector('#transactionModal .btn-primary');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Guardar Transacción';
    }
    
    // Ocultar botón de eliminar
    const deleteBtn = document.getElementById('deleteTransactionBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    // Establecer fecha actual
    const dateInput = document.getElementById('transactionDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    console.log('✅ Modal reseteado');
}

// Exponer función globalmente
window.editTransactionFromDashboard = editTransactionFromDashboard;

// ============================================================
// 🔗 EXPOSICIÓN DE FUNCIONES GLOBALES
// ============================================================

// Exponer funciones globalmente
window.createAddStudentModalHTML = createAddStudentModalHTML;
window.createEditStudentModalHTML = createEditStudentModalHTML;
window.createStudentDetailModalHTML = createStudentDetailModalHTML;

// Funciones de modales
window.initializeModals = initializeModals;
window.showAddTransactionModal = showAddTransactionModal;
window.submitTransaction = submitTransaction;
window.resetTransactionModal = resetTransactionModal;
window.showModal = showModal;
window.hideModal = hideModal;
window.isModalOpen = isModalOpen;
// Exponer funciones globalmente
window.updateTransactionTypeStyle = updateTransactionTypeStyle;
window.calculateTotal = calculateTotal;
window.refreshTransactions = refreshTransactions;
window.editTransactionFromDashboard = editTransactionFromDashboard;

// Funciones de validación
window.validateForm = validateForm;
window.validateFormField = validateFormField;
window.showFieldError = showFieldError;
window.clearFormErrors = clearFormErrors;

// Funciones específicas de configuración
window.setupTransactionModalListeners = setupTransactionModalListeners;

console.log('✅ Dashboard Modals Module cargado - Todas las funciones de modales disponibles');