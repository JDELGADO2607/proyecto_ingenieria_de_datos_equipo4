let parsedData = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('fileInfo').style.display = 'block';
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('fileSize').textContent = formatBytes(file.size);
            }
        });
    }

    // Event listener para el formulario de activos
    document.getElementById('formActivo').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarActivo();
    });
});

// ===== NAVEGACIÓN =====
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
    
    document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Cargar datos según la página
    if (pageName === 'home') loadResumenData();
    if (pageName === 'validations') loadValidacionesData();
    if (pageName === 'assets') buscarActivos();
    if (pageName === 'vendors') loadVendorsData();
    if (pageName === 'reports') loadReportesData();
    if (pageName === 'inconsistencies') loadInconsistenciasData(); // NUEVA LINEA
}

// ===== CARGA DE DATOS =====
function loadDashboardData() {
    loadResumenData();
    loadValidacionesData();
}

function loadResumenData() {
    console.log('🔄 Cargando datos del resumen...');
    
    fetch('api/get_resumen.php')
        .then(response => {
            console.log('📡 Respuesta recibida, status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Datos recibidos:', data);
            
            // Verificar si hay datos en la respuesta
            if (!data) {
                console.error('❌ No hay datos en la respuesta');
                return;
            }
            
            // Actualizar estadísticas con verificación
            if (data.stats) {
                console.log('📊 Stats recibidos:', data.stats);
                
                const validados = data.stats.total_validados || 0;
                const semi = data.stats.total_semi_validados || 0;
                const noValidados = data.stats.total_no_validados || 0;
                const total = data.stats.total_activos || 0;
                
                console.log(`📈 Valores: Validados=${validados}, Semi=${semi}, NoValidados=${noValidados}, Total=${total}`);
                
                // Actualizar las tarjetas
                document.getElementById('stat-validados').textContent = validados;
                document.getElementById('stat-semi').textContent = semi;
                document.getElementById('stat-no-validados').textContent = noValidados;
                document.getElementById('stat-total').textContent = total;
                
                console.log('✅ Tarjetas de validación actualizadas');
            } else {
                console.error('❌ No hay stats en la respuesta');
                // Establecer valores por defecto
                document.getElementById('stat-validados').textContent = '0';
                document.getElementById('stat-semi').textContent = '0';
                document.getElementById('stat-no-validados').textContent = '0';
                document.getElementById('stat-total').textContent = '0';
            }
            
            // ========== NUEVO: ACTUALIZAR DATOS DE VENDORS ==========
            if (data.vendors && Array.isArray(data.vendors)) {
                console.log('🏢 Datos de vendors recibidos:', data.vendors);
                
                // Reiniciar valores primero
                document.getElementById('vendor-ice').textContent = '0';
                document.getElementById('vendor-ice-pct').textContent = '0% de activos';
                document.getElementById('vendor-factset').textContent = '0';
                document.getElementById('vendor-factset-pct').textContent = '0% de activos';
                document.getElementById('vendor-edi').textContent = '0';
                document.getElementById('vendor-edi-pct').textContent = '0% de activos';
                
                data.vendors.forEach(vendor => {
                    const vendorName = vendor.nombreVendor.toLowerCase();
                    const elementId = `vendor-${vendorName}`;
                    const pctElementId = `vendor-${vendorName}-pct`;
                    
                    if (document.getElementById(elementId)) {
                        document.getElementById(elementId).textContent = vendor.total_activos || 0;
                        document.getElementById(pctElementId).textContent = `${vendor.porcentaje || 0}% de activos`;
                        console.log(`✅ Vendor ${vendorName}: ${vendor.total_activos} activos (${vendor.porcentaje}%)`);
                    } else {
                        console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
                    }
                });
                
                console.log('✅ Datos de vendors actualizados');
            } else {
                console.warn('⚠️ No hay datos de vendors en la respuesta');
                
                // Establecer valores por defecto
                document.getElementById('vendor-ice').textContent = '0';
                document.getElementById('vendor-ice-pct').textContent = '0% de activos';
                document.getElementById('vendor-factset').textContent = '0';
                document.getElementById('vendor-factset-pct').textContent = '0% de activos';
                document.getElementById('vendor-edi').textContent = '0';
                document.getElementById('vendor-edi-pct').textContent = '0% de activos';
            }
            // ========== FIN NUEVO ==========
            
            // Actualizar actividad reciente - CON ESTADO (8 COLUMNAS)
            const tbody = document.getElementById('tabla-actividad-reciente');
            if (data.actividad_reciente && data.actividad_reciente.length > 0) {
                console.log('📋 Actividad reciente:', data.actividad_reciente.length, 'registros');
                
                tbody.innerHTML = '';
                
                data.actividad_reciente.slice(0, 10).forEach(item => {
                    const statusBadge = getStatusBadge(item.estado || '');
                    const timestamp = item.timestampRecepcion || '-';
                    
                    tbody.innerHTML += `
                        <tr>
                            <td>${item.idActivo || '-'}</td>
                            <td><strong>${item.tickerUniversal || '-'}</strong></td>
                            <td>${parseFloat(item.precioActivo || 0).toFixed(4)}</td>
                            <td>${item.divisaActivo || '-'}</td>
                            <td>${statusBadge}</td>
                            <td>${item.regionActivo || '-'}</td>
                            <td>${item.fechaNeg || '-'}</td>
                            <td><small>${timestamp}</small></td>
                        </tr>
                    `;
                });
                
                console.log('✅ Tabla de actividad actualizada con 8 columnas (incluyendo estado)');
            } else {
                console.warn('⚠️ No hay actividad reciente');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 20px; color: #7f8c8d;">
                            📭 No hay actividad reciente para mostrar
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('❌ Error cargando resumen:', error);
            
            // Mostrar error en la interfaz
            const tbody = document.getElementById('tabla-actividad-reciente');
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #e74c3c;">
                        ❌ Error al cargar datos: ${error.message}
                    </td>
                </tr>
            `;
            
            // Establecer valores por defecto en caso de error
            document.getElementById('stat-validados').textContent = '0';
            document.getElementById('stat-semi').textContent = '0';
            document.getElementById('stat-no-validados').textContent = '0';
            document.getElementById('stat-total').textContent = '0';
            
            // También establecer valores por defecto para vendors en caso de error
            document.getElementById('vendor-ice').textContent = '0';
            document.getElementById('vendor-ice-pct').textContent = 'Error';
            document.getElementById('vendor-factset').textContent = '0';
            document.getElementById('vendor-factset-pct').textContent = 'Error';
            document.getElementById('vendor-edi').textContent = '0';
            document.getElementById('vendor-edi-pct').textContent = 'Error';
        });
}

function loadValidacionesData() {
    const estado = document.getElementById('filtro-estado')?.value || '';
    const fechaDesde = document.getElementById('filtro-fecha-desde')?.value || '';
    const fechaHasta = document.getElementById('filtro-fecha-hasta')?.value || '';
    
    let url = 'api/get_validaciones.php?';
    if (estado) url += `estado=${encodeURIComponent(estado)}&`;
    if (fechaDesde) url += `fecha_desde=${encodeURIComponent(fechaDesde)}&`;
    if (fechaHasta) url += `fecha_hasta=${encodeURIComponent(fechaHasta)}`;
    
    console.log('🔍 Cargando validaciones desde:', url);
    
    // Limpiar tabla antes de cargar
    const tbody = document.getElementById('tabla-validaciones');
    if (!tbody) {
        console.error('❌ No se encontró el elemento #tabla-validaciones');
        alert('Error: No se encontró la tabla de validaciones en el HTML');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⏳ Cargando datos...</td></tr>';
    
    fetch(url)
        .then(response => {
            console.log('📡 Respuesta recibida, status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log('📄 Respuesta raw:', text.substring(0, 200));
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('❌ Error parseando JSON:', e);
                console.error('Respuesta completa:', text);
                throw new Error('Respuesta no es JSON válido: ' + text.substring(0, 100));
            }
        })
        .then(data => {
            console.log('✅ Datos parseados:', data);
            console.log('📊 Tipo de datos:', typeof data, 'Es array:', Array.isArray(data));
            
            tbody.innerHTML = '';
            
            if (data.error) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red; padding: 20px;">
                    ❌ Error: ${data.message}
                </td></tr>`;
                return;
            }
            
            if (Array.isArray(data) && data.length > 0) {
                console.log(`📊 Mostrando ${data.length} registros`);
                
                data.forEach((item, index) => {
                    console.log(`Procesando item ${index}:`, item);
                    
                    const statusBadge = getStatusBadge(item.estado || '');
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.idResultado || '-'}</td>
                        <td><strong>${item.ticker || '-'}</strong></td>
                        <td>${statusBadge}</td>
                        <td><small>${item.fechaValidacion || '-'}</small></td>
                        <td>${item.observaciones || '-'}</td>
                        <td>
                            <button class="btn btn-edit" onclick="verDetalleValidacion(${item.idResultado}, '${item.ticker}')">
                                👁️ Ver Detalle
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                console.log('✅ Tabla actualizada con', data.length, 'filas');
            } else {
                console.log('⚠️ Array vacío o no es array');
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #7f8c8d;">
                    📭 No hay validaciones registradas en el sistema
                </td></tr>`;
            }
        })
        .catch(error => {
            console.error('❌ Error en loadValidacionesData:', error);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red; padding: 20px;">
                ❌ Error al cargar datos: ${error.message}<br>
                <small>Revisa la consola del navegador (F12) para más detalles</small>
            </td></tr>`;
        });
}

function loadVendorsData() {
    fetch('api/get_vendors.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('tabla-vendors');
            tbody.innerHTML = '';
            
            data.forEach(vendor => {
                tbody.innerHTML += `
                    <tr>
                        <td>${vendor.idVendor}</td>
                        <td>${vendor.nombreVendor}</td>
                        <td>${vendor.emailVendor}</td>
                        <td>${'⭐'.repeat(vendor.importanciaVendor)}</td>
                        <td>${vendor.total_activos || 0}</td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error('Error cargando vendors:', error));
}

// ===== CRUD ACTIVOS =====
function buscarActivos() {
    const ticker = document.getElementById('buscar-ticker')?.value || '';
    const region = document.getElementById('filtro-region')?.value || '';
    const clase = document.getElementById('filtro-clase')?.value || '';
    
    let url = `api/crud_activos/read.php?ticker=${ticker}&region=${region}&clase=${clase}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('tabla-activos');
            tbody.innerHTML = '';
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(activo => {
                    // Asegurarnos de mostrar timestampRecepcion
                    const timestamp = activo.timestampRecepcion || activo.timestamp_recepcion || '-';
                    
                    tbody.innerHTML += `
                        <tr>
                            <td>${activo.idActivo}</td>
                            <td><strong>${activo.tickerUniversal}</strong></td>
                            <td>${parseFloat(activo.precioActivo).toFixed(4)}</td>
                            <td>${activo.divisaActivo}</td>
                            <td>${activo.regionActivo}</td>
                            <td>${activo.claseActivo}</td>
                            <td>${activo.fechaNeg}</td>
                            <td><small>${timestamp}</small></td>
                            <td>
                                <button class="btn btn-edit" onclick="editarActivo(${activo.idActivo})">✏️ Editar</button>
                                <button class="btn btn-delete" onclick="eliminarActivo(${activo.idActivo})">🗑️ Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay activos disponibles</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error cargando activos:', error);
            alert('Error al cargar activos');
        });
}

function abrirModalCrear() {
    document.getElementById('modal-title').textContent = 'Nuevo Activo';
    document.getElementById('formActivo').reset();
    document.getElementById('activo-id').value = '';
    document.getElementById('grupo-timestamp').style.display = 'none';
    document.getElementById('modalActivo').style.display = 'block';
}

function editarActivo(id) {
    fetch(`api/crud_activos/read.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data && data[0]) {
                const activo = data[0];
                document.getElementById('modal-title').textContent = 'Editar Activo';
                document.getElementById('activo-id').value = activo.idActivo;
                document.getElementById('activo-ticker').value = activo.tickerUniversal;
                document.getElementById('activo-precio').value = activo.precioActivo;
                document.getElementById('activo-divisa').value = activo.divisaActivo;
                document.getElementById('activo-region').value = activo.regionActivo;
                document.getElementById('activo-clase').value = activo.claseActivo;
                document.getElementById('activo-fecha').value = activo.fechaNeg;
                
                // Mostrar timestampRecepcion si está disponible
                const timestamp = activo.timestampRecepcion || activo.timestamp_recepcion;
                if (timestamp) {
                    document.getElementById('grupo-timestamp').style.display = 'block';
                    document.getElementById('activo-timestamp-display').value = timestamp;
                } else {
                    document.getElementById('grupo-timestamp').style.display = 'none';
                }
                
                document.getElementById('modalActivo').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
}

function guardarActivo() {
    const id = document.getElementById('activo-id').value;
    const esNuevo = !id;
    
    const data = {
        tickerUniversal: document.getElementById('activo-ticker').value,
        precioActivo: document.getElementById('activo-precio').value,
        divisaActivo: document.getElementById('activo-divisa').value,
        regionActivo: document.getElementById('activo-region').value,
        claseActivo: document.getElementById('activo-clase').value,
        fechaNeg: document.getElementById('activo-fecha').value
    };
    
    if (!esNuevo) {
        data.idActivo = id;
    }
    
    const url = esNuevo ? 'api/crud_activos/create.php' : 'api/crud_activos/update.php';
    
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(esNuevo ? 'Activo creado exitosamente' : 'Activo actualizado exitosamente');
            cerrarModal();
            buscarActivos();
        } else {
            alert('Error: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al guardar el activo');
    });
}

function eliminarActivo(id) {
    if (!confirm('¿Estás seguro de eliminar este activo?')) return;
    
    fetch('api/crud_activos/delete.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idActivo: id})
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Activo eliminado exitosamente');
            buscarActivos();
        } else {
            alert('Error: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar el activo');
    });
}

function cerrarModal() {
    document.getElementById('modalActivo').style.display = 'none';
}

// ===== FILTROS =====
function aplicarFiltros() {
    loadValidacionesData();
}

function limpiarFiltros() {
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    loadValidacionesData();
}

// ===== CARGA DE ARCHIVOS =====
function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor selecciona un archivo primero');
        return;
    }
    
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<div class="alert info"><strong>⏳ Procesando...</strong> Leyendo archivo...</div>';
    
    // Ocultar preview anterior
    document.getElementById('previewSection').style.display = 'none';
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        processExcelFile(file);
    } else if (fileExtension === 'csv' || fileExtension === 'txt') {
        processCSVFile(file);
    } else if (fileExtension === 'prn') {
        processCSVFile(file);
    } else {
        statusDiv.innerHTML = '<div class="alert warning"><strong>❌ Formato no soportado</strong> Solo se aceptan archivos CSV, Excel o TXT</div>';
    }
}

function clearData() {
    parsedData = [];
    document.getElementById('fileInput').value = '';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('uploadStatus').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
}

// ===== PROCESAMIENTO DE ARCHIVOS CSV =====
function processCSVFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        console.log('📄 Contenido del archivo CSV:', content.substring(0, 500));
        
        try {
            // DETECCIÓN MEJORADA DE DELIMITADORES
            const firstLine = content.split('\n')[0];
            let delimiter = ',';
            
            // Verificar diferentes delimitadores
            if (firstLine.includes(';')) {
                delimiter = ';';
                console.log('🔍 Delimitador detectado: PUNTO Y COMA (;)');
            } else if (firstLine.includes('\t')) {
                delimiter = '\t';
                console.log('🔍 Delimitador detectado: TABULADOR');
            } else if (firstLine.includes(',')) {
                delimiter = ',';
                console.log('🔍 Delimitador detectado: COMA');
            } else {
                console.log('⚠️ No se pudo detectar delimitador, usando coma por defecto');
            }
            
            parsedData = parseCSVContent(content, delimiter);
            
            if (parsedData.length > 0) {
                showPreview(parsedData);
                document.getElementById('uploadStatus').innerHTML = 
                    `<div class="alert info"><strong>✅ Archivo procesado</strong> Se encontraron ${parsedData.length} registros</div>`;
            } else {
                document.getElementById('uploadStatus').innerHTML = 
                    `<div class="alert warning"><strong>⚠️ Advertencia</strong> No se pudieron procesar datos del archivo</div>`;
            }
        } catch (error) {
            console.error('❌ Error procesando CSV:', error);
            document.getElementById('uploadStatus').innerHTML = 
                `<div class="alert warning"><strong>❌ Error</strong> ${error.message}</div>`;
        }
    };
    
    reader.onerror = function() {
        document.getElementById('uploadStatus').innerHTML = 
            `<div class="alert warning"><strong>❌ Error</strong> No se pudo leer el archivo</div>`;
    };
    
    reader.readAsText(file);
}

function parseCSVContent(content, delimiter) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
        throw new Error('El archivo no contiene datos suficientes');
    }
    
    // Obtener headers
    const headers = lines[0].split(delimiter).map(header => header.trim().toLowerCase());
    console.log('📋 Headers detectados:', headers);
    
    const data = [];
    
    // Procesar cada línea (empezando desde la 1, no 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Manejar campos que puedan contener comas dentro de comillas
        const values = parseCSVLine(line, delimiter);
        
        if (values.length !== headers.length) {
            console.warn(`⚠️ Línea ${i+1}: Número de columnas no coincide. Esperadas: ${headers.length}, Encontradas: ${values.length}`);
            console.warn('Línea:', line);
            console.warn('Valores:', values);
            continue;
        }
        
        const record = {};
        
        // Mapear valores a headers
        headers.forEach((header, index) => {
            record[header] = values[index] ? values[index].trim() : '';
        });
        
        // Validar que tenga los campos mínimos requeridos
        if (isValidRecord(record)) {
            data.push(record);
        } else {
            console.warn(`⚠️ Registro ${i+1} ignorado por falta de datos esenciales:`, record.ric || 'Sin RIC');
        }
    }
    
    console.log('📊 Datos parseados:', data);
    return data;
}

function parseCSVLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Añadir el último valor
    values.push(current);
    
    // Limpiar comillas de los valores
    return values.map(value => {
        let cleaned = value.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        return cleaned;
    });
}

function isValidRecord(record) {
    // Verificar que tenga al menos algunos campos esenciales
    const hasTicker = record.ric || record.mic;
    const hasPrice = record.golden_close || record.rt_close;
    const hasDate = record.date;
    
    return hasTicker && hasPrice && hasDate;
}

function showPreview(data) {
    const previewBody = document.getElementById('previewBody');
    previewBody.innerHTML = '';
    
    // Mostrar solo los primeros 10 registros para previsualización
    const previewData = data.slice(0, 10);
    
    previewData.forEach(record => {
        const statusBadge = getStatusBadgeCSV(record.status);
        
        const row = `
            <tr>
                <td>${record.ric || '-'}</td>
                <td><strong>${record.mic || '-'}</strong></td>
                <td>${record.rt_close || '-'}</td>
                <td>${record.factset_close || '-'}</td>
                <td>${record.edi_close || '-'}</td>
                <td><strong>${record.golden_close || '-'}</strong></td>
                <td>${statusBadge}</td>
                <td>${record.region || '-'}</td>
                <td>${record.date || '-'}</td>
            </tr>
        `;
        previewBody.innerHTML += row;
    });
    
    document.getElementById('previewSection').style.display = 'block';
    
    // Mostrar resumen
    const summary = document.createElement('div');
    summary.className = 'alert info';
    summary.innerHTML = `
        <strong>📊 Resumen del archivo:</strong>
        <ul style="margin: 10px 0 0 20px;">
            <li>Total registros: ${data.length}</li>
            <li>Registros válidos: ${data.length}</li>
            <li>Mostrando: ${previewData.length} registros en vista previa</li>
        </ul>
    `;
    
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.appendChild(summary);
}

function getStatusBadgeCSV(status) {
    if (!status) return '<span class="badge" style="background: #95a5a6;">N/A</span>';
    
    const statusMap = {
        'VALIDATED': 'validated',
        'SEMI_VALIDATED': 'semi',
        'UNVALIDATED': 'unvalidated',
        'SINGLE_SOURCE': 'validated'
    };
    
    const badgeType = statusMap[status] || 'unvalidated';
    
    const classMap = {
        'validated': 'badge validated',
        'semi': 'badge semi', 
        'unvalidated': 'badge unvalidated'
    };
    
    const textMap = {
        'validated': 'Validated',
        'semi': 'Semi-Validated',
        'unvalidated': 'Unvalidated'
    };
    
    return `<span class="${classMap[badgeType]}">${textMap[badgeType]}</span>`;
}

// ===== INSERTAR DATOS EN BD =====
function insertToDB() {
    if (!parsedData || parsedData.length === 0) {
        alert('❌ No hay datos para insertar');
        return;
    }
    
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.innerHTML = '<div class="alert info"><strong>⏳ Insertando datos...</strong> Esto puede tomar unos segundos.</div>';
    
    // Preparar datos para inserción
    const dataToInsert = parsedData.map(record => ({
        ric: record.ric,
        mic: record.mic,
        rt_close: record.rt_close,
        factset_close: record.factset_close,
        edi_close: record.edi_close,
        golden_close: record.golden_close,
        status: record.status,
        region: record.region,
        date: record.date,
        rt_currency: record.rt_currency
    }));
    
    console.log('📤 Enviando datos a BD:', dataToInsert);
    
    fetch('api/insert_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToInsert)
    })
    .then(response => response.json())
    .then(result => {
        console.log('✅ Respuesta del servidor:', result);
        
        if (result.success) {
            statusDiv.innerHTML = `
                <div class="alert info" style="background: #d4edda; color: #155724; border-left-color: #27ae60;">
                    <strong>✅ ¡Éxito!</strong> ${result.message}<br>
                    <strong>Registros insertados:</strong> ${result.insertados}
                </div>
            `;
            
            // Limpiar datos después de inserción exitosa
            parsedData = [];
            document.getElementById('previewSection').style.display = 'none';
            
            // Recargar el dashboard para mostrar nuevos datos
            setTimeout(() => {
                loadDashboardData();
            }, 2000);
            
        } else {
            statusDiv.innerHTML = `
                <div class="alert warning">
                    <strong>❌ Error al insertar</strong> ${result.error}
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('❌ Error en inserción:', error);
        statusDiv.innerHTML = `
            <div class="alert warning">
                <strong>❌ Error de conexión</strong> No se pudo conectar con el servidor
            </div>
        `;
    });
}

// ===== EXPORTAR CSV =====
function exportarCSV() {
    if (!parsedData || parsedData.length === 0) {
        alert('❌ No hay datos para exportar');
        return;
    }
    
    // Crear contenido CSV
    const headers = ['RIC', 'Ticker', 'ICE Price', 'FactSet Price', 'EDI Price', 'Golden Close', 'Status', 'Region', 'Date'];
    const csvContent = [
        headers.join(','),
        ...parsedData.map(record => [
            record.ric || '',
            record.mic || '',
            record.rt_close || '',
            record.factset_close || '',
            record.edi_close || '',
            record.golden_close || '',
            record.status || '',
            record.region || '',
            record.date || ''
        ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `solactive_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== REPORTES =====
function loadReportesData() {
    console.log('📊 Cargando datos de reportes...');
    
    fetch('api/get_reportes.php')
        .then(response => response.json())
        .then(data => {
            console.log('📈 Datos de reportes recibidos:', data);
            
            if (data.success === false) {
                console.error('❌ Error en reportes:', data.message);
                mostrarErrorReportes('Error al cargar reportes: ' + data.message);
                return;
            }
            
            // 1. Tabla de Validaciones
            const tbodyValidaciones = document.getElementById('tabla-reporte-validaciones');
            tbodyValidaciones.innerHTML = '';
            
            if (data.validaciones && data.validaciones.length > 0) {
                data.validaciones.forEach(item => {
                    const badge = getStatusBadge(item.estado);
                    tbodyValidaciones.innerHTML += `
                        <tr>
                            <td>${badge}</td>
                            <td><strong>${item.cantidad}</strong></td>
                            <td>${item.porcentaje}%</td>
                            <td><small>${item.tickers || 'N/A'}</small></td>
                        </tr>
                    `;
                });
            } else {
                tbodyValidaciones.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay datos de validaciones</td></tr>';
            }
            
            // 2. Tabla de Regiones
            const tbodyRegiones = document.getElementById('tabla-reporte-regiones');
            tbodyRegiones.innerHTML = '';
            
            if (data.regiones && data.regiones.length > 0) {
                data.regiones.forEach(region => {
                    tbodyRegiones.innerHTML += `
                        <tr>
                            <td><strong>${region.region}</strong></td>
                            <td>${region.total}</td>
                            <td>${region.validados}</td>
                            <td>${region.pendientes}</td>
                            <td>
                                <span style="color: ${region.porcentaje_validados >= 80 ? '#27ae60' : region.porcentaje_validados >= 50 ? '#f39c12' : '#e74c3c'}">
                                    ${region.porcentaje_validados}%
                                </span>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbodyRegiones.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay datos por región</td></tr>';
            }
            
            // 3. Tabla de Clases
            const tbodyClases = document.getElementById('tabla-reporte-clases');
            tbodyClases.innerHTML = '';
            
            if (data.clases && data.clases.length > 0) {
                data.clases.forEach(clase => {
                    tbodyClases.innerHTML += `
                        <tr>
                            <td><strong>${clase.clase}</strong></td>
                            <td>${clase.total}</td>
                            <td>${clase.precio_promedio}</td>
                        </tr>
                    `;
                });
            } else {
                tbodyClases.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay datos por clase</td></tr>';
            }
            
            // 4. Tabla de Divisas
            const tbodyDivisas = document.getElementById('tabla-reporte-divisas');
            tbodyDivisas.innerHTML = '';
            
            if (data.divisas && data.divisas.length > 0) {
                data.divisas.forEach(divisa => {
                    tbodyDivisas.innerHTML += `
                        <tr>
                            <td><strong>${divisa.divisa}</strong></td>
                            <td>${divisa.total}</td>
                        </tr>
                    `;
                });
            } else {
                tbodyDivisas.innerHTML = '<tr><td colspan="2" style="text-align:center;">No hay datos por divisa</td></tr>';
            }
            
            console.log('✅ Reportes cargados exitosamente');
            
        })
        .catch(error => {
            console.error('❌ Error cargando reportes:', error);
            mostrarErrorReportes('Error de conexión: ' + error.message);
        });
}

function mostrarErrorReportes(mensaje) {
    const tablas = [
        'tabla-reporte-validaciones',
        'tabla-reporte-regiones', 
        'tabla-reporte-clases',
        'tabla-reporte-divisas'
    ];
    
    tablas.forEach(tablaId => {
        const tbody = document.getElementById(tablaId);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color: red; padding: 20px;">
                ❌ ${mensaje}
            </td></tr>`;
        }
    });
}

// ===== FUNCIONES DE EXPORTACIÓN =====
function exportarExcel() {
    alert('📊 Función de exportación a Excel - Por implementar');
}

function generarPDF() {
    alert('📄 Función de generación de PDF - Por implementar');
}

// ===== UTILIDADES =====
function getStatusBadge(estado) {
    if (estado.includes('Validated') && !estado.includes('Semi')) {
        return '<span class="badge validated">Validated</span>';
    } else if (estado.includes('Semi')) {
        return '<span class="badge semi">Semi-Validated</span>';
    } else if (estado.includes('Unvalidated')) {
        return '<span class="badge unvalidated">Unvalidated</span>';
    } else {
        return '<span class="badge" style="background: #95a5a6; color: white;">' + estado + '</span>';
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function verDetalle(ticker) {
    alert('Detalle de: ' + ticker);
}

function verDetalleValidacion(idResultado, ticker) {
    alert(`📋 Detalle de Validación\n\nID: ${idResultado}\nTicker: ${ticker}\n\n(Función por implementar)`);
}

// ===== FUNCIONES DE EXCEL (placeholder) =====
function processExcelFile(file) {
    alert('📊 Procesamiento de Excel - Por implementar');
    console.log('Procesando archivo Excel:', file.name);
}

function processTXTFile(file) {
    // Para archivos .txt, tratarlos como CSV
    processCSVFile(file);
}

function loadInconsistenciasData() {
    console.log('🔍 Cargando inconsistencias...');
    
    fetch('api/get_inconsistencias.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📊 Datos de inconsistencias:', data);
            
            const tbody = document.getElementById('tabla-inconsistencias');
            tbody.innerHTML = '';
            
            if (data.success && data.data && data.data.length > 0) {
                data.data.forEach(item => {
                    const nivelBadge = getNivelBadge(item.Nivel || item.nivel);
                    
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${item.Ticker || item.ticker || '-'}</strong></td>
                            <td>${item.Estado || item.estado || '-'}</td>
                            <td>${item.Fecha || item.fecha || '-'}</td>
                            <td>${nivelBadge}</td>
                        </tr>
                    `;
                });
                
                console.log(`✅ ${data.data.length} inconsistencias cargadas`);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: #27ae60;">
                            ✅ No hay inconsistencias detectadas en el sistema
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('❌ Error cargando inconsistencias:', error);
            const tbody = document.getElementById('tabla-inconsistencias');
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #e74c3c;">
                        ❌ Error al cargar inconsistencias: ${error.message}
                    </td>
                </tr>
            `;
        });
}

// Función auxiliar para badges de nivel
function getNivelBadge(nivel) {
    const nivelMap = {
        'CRITICO': 'badge unvalidated',
        'ALTO': 'badge semi',
        'MEDIO': 'badge', 
        'BAJO': 'badge validated'
    };
    
    const textoMap = {
        'CRITICO': 'CRÍTICO',
        'ALTO': 'ALTO',
        'MEDIO': 'MEDIO',
        'BAJO': 'BAJO'
    };
    
    const badgeClass = nivelMap[nivel] || 'badge';
    const badgeText = textoMap[nivel] || nivel;
    
    return `<span class="${badgeClass}">${badgeText}</span>`;
}