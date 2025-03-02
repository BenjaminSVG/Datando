let fields = [];
let clients = [];
let currentSort = { field: null, direction: 'asc' };
let showRowNumbers = true; // Para mostrar números de fila

// Agregar campo
function addField() {
    const fieldName = document.getElementById('newFieldName').value;
    const fieldType = document.getElementById('newFieldType').value;
    const isRequired = document.getElementById('fieldRequired').checked;
    
    if (fieldName) {
        fields.push({ 
            name: fieldName, 
            type: fieldType, 
            totalFunction: getTotalFunctionForType(fieldType),
            required: isRequired
        });
        updateActiveFields();
        updateClientForm();
        updateSearchFields();
        updateTable();
    }
}

// Determinar la función de total predeterminada según el tipo de campo
function getTotalFunctionForType(fieldType) {
    switch(fieldType) {
        case 'number': return 'sum';
        case 'text': return 'count';
        case 'date': return 'none';
        case 'image': return 'none';
        case 'status': return 'countTrue';
        default: return 'none';
    }
}

// Actualizar campos activos
function updateActiveFields() {
    const activeFields = document.getElementById('activeFields');
    activeFields.innerHTML = '';
    
    fields.forEach((field, index) => {
        const fieldTag = document.createElement('div');
        fieldTag.className = 'field-tag';
        
        // Crear el nombre del campo
        const fieldName = document.createElement('span');
        fieldName.className = 'field-name';
        fieldName.textContent = field.name;
        
        // Crear el indicador de requerido (asterisco)
        const requiredIndicator = document.createElement('span');
        requiredIndicator.className = 'required-indicator';
        requiredIndicator.textContent = field.required ? '*' : '';
        requiredIndicator.style.color = field.required ? 'var(--danger-color)' : 'transparent';
        
        // Crear el botón de opciones (tres puntos)
        const optionsButton = document.createElement('span');
        optionsButton.className = 'material-icons options-button';
        optionsButton.textContent = 'more_vert';
        optionsButton.style.cursor = 'pointer';
        optionsButton.style.fontSize = '16px';
        optionsButton.style.marginLeft = '5px';
        optionsButton.style.marginRight = '5px';
        optionsButton.style.opacity = '0.7';
        
        // Crear el menú desplegable (inicialmente oculto)
        const dropdown = document.createElement('div');
        dropdown.className = 'field-options-dropdown';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = 'var(--surface-color)';
        dropdown.style.boxShadow = 'var(--shadow-md)';
        dropdown.style.borderRadius = 'var(--border-radius-md)';
        dropdown.style.padding = '8px 0';
        dropdown.style.zIndex = '100';
        dropdown.style.minWidth = '150px';
        dropdown.style.display = 'none';
        
        // Opción para cambiar si es requerido
        const requiredOption = document.createElement('div');
        requiredOption.className = 'dropdown-option';
        requiredOption.style.padding = '8px 16px';
        requiredOption.style.cursor = 'pointer';
        requiredOption.style.display = 'flex';
        requiredOption.style.alignItems = 'center';
        requiredOption.style.color = 'var(--text-color)';
        requiredOption.style.gap = '8px';
        
        const requiredIcon = document.createElement('i');
        requiredIcon.className = field.required ? 'fas fa-toggle-on' : 'fas fa-toggle-off';
        requiredIcon.style.color = field.required ? 'var(--primary-color)' : 'var(--text-secondary)';
        
        requiredOption.appendChild(requiredIcon);
        requiredOption.appendChild(document.createTextNode(field.required ? 'Hacer opcional' : 'Hacer requerido'));
        
        requiredOption.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });
        
        requiredOption.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        requiredOption.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Cambiar el estado de requerido
            fields[index].required = !fields[index].required;
            
            // Cerrar el dropdown
            dropdown.style.display = 'none';
            
            // Actualizar la interfaz
            updateActiveFields();
            updateClientForm();
            updateTable();
        });
        
        dropdown.appendChild(requiredOption);
        
        // Evento para mostrar/ocultar el dropdown
        optionsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Cerrar todos los otros dropdowns primero
            document.querySelectorAll('.field-options-dropdown').forEach(d => {
                if (d !== dropdown) d.style.display = 'none';
            });
            
            // Alternar la visibilidad del dropdown actual
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            
            // Posicionar el dropdown debajo del botón
            const rect = this.getBoundingClientRect();
            dropdown.style.top = '100%';
            dropdown.style.right = '0';
        });
        
        // Cerrar el dropdown al hacer clic en cualquier parte del documento
        document.addEventListener('click', function() {
            dropdown.style.display = 'none';
        });
        
        // Botón para eliminar el campo
        const removeButton = document.createElement('span');
        removeButton.className = 'material-icons';
        removeButton.textContent = 'close';
        removeButton.onclick = function(e) {
            e.stopPropagation();
            removeField(index);
        };
        
        // Agregar todos los elementos al fieldTag
        fieldTag.appendChild(fieldName);
        fieldTag.appendChild(requiredIndicator);
        fieldTag.appendChild(optionsButton);
        fieldTag.appendChild(dropdown);
        fieldTag.appendChild(removeButton);
        
        // Asegurar que el fieldTag tenga posición relativa para el dropdown
        fieldTag.style.position = 'relative';
        
        activeFields.appendChild(fieldTag);
    });
    
    // Hacer que los campos sean arrastrables
    makeFieldsDraggable();
}



// Eliminar campo
function removeField(index) {
    fields.splice(index, 1);
    updateActiveFields();
    updateClientForm();
    updateSearchFields();
    updateTable();
}

// Formulario de cliente
function updateClientForm() {
    const form = document.getElementById('clientForm');
    form.innerHTML = '';
    
    fields.forEach(field => {
        const div = document.createElement('div');
        
        if (field.type === 'image') {
            div.innerHTML = `
                <label>${field.name}${field.required ? ' *' : ''}:</label>
                <div class="image-upload-container">
                    <label for="image-${field.name}" class="custom-file-upload">
                        <i class="fas fa-cloud-upload-alt"></i> Seleccionar imagen
                    </label>
                    <input id="image-${field.name}" type="file" name="${field.name}" accept="image/*" onchange="previewImage(this)" style="display:none;" ${field.required ? 'required' : ''}>
                    <img class="image-preview" id="preview-${field.name}" style="display: none;">
                </div>
            `;
        } else if (field.type === 'status') {
            div.innerHTML = `
                <label>${field.name}${field.required ? ' *' : ''}:</label>
                <button type="button" class="status-button inactive" onclick="toggleStatus(this)" data-status="inactive">
                    <i class="fas fa-times-circle"></i> Inactivo
                </button>
                <input type="hidden" name="${field.name}" value="false">
            `;
        } else {
            div.innerHTML = `
                <label>${field.name}${field.required ? ' *' : ''}:</label>
                <input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>
            `;
        }
        form.appendChild(div);
    });
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Cliente';
    form.appendChild(submitButton);
    
    form.onsubmit = handleFormSubmit;
}

// Manejar el cambio de estado en los botones de estado
function toggleStatus(button) {
    const currentStatus = button.getAttribute('data-status');
    const hiddenInput = button.nextElementSibling;
    
    if (currentStatus === 'active') {
        button.className = 'status-button inactive';
        button.innerHTML = '<i class="fas fa-times-circle"></i> Inactivo';
        button.setAttribute('data-status', 'inactive');
        hiddenInput.value = 'false';
    } else {
        button.className = 'status-button active';
        button.innerHTML = '<i class="fas fa-check-circle"></i> Activo';
        button.setAttribute('data-status', 'active');
        hiddenInput.value = 'true';
    }
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const client = {};
    
    fields.forEach(field => {
        if (field.type === 'image') {
            const preview = document.getElementById(`preview-${field.name}`);
            client[field.name] = preview.src;
            
            // Limpiar la imagen después de agregar el cliente
            preview.src = '';
            preview.style.display = 'none';
        } else if (field.type === 'status') {
            client[field.name] = formData.get(field.name) === 'true';
        } else {
            client[field.name] = formData.get(field.name);
        }
    });
    
    clients.push(client);
    updateTable();
    e.target.reset();
}


// Actualizar campos de búsqueda
function updateSearchFields() {
    const searchField = document.getElementById('searchField');
    const searchOperator = document.getElementById('searchOperator');
    
    searchField.innerHTML = '';
    fields.forEach(field => {
        const option = document.createElement('option');
        option.value = field.name;
        option.textContent = field.name;
        searchField.appendChild(option);
    });

    // Actualizar operadores disponibles según el tipo de campo seleccionado
    searchField.addEventListener('change', () => {
        const selectedField = fields.find(f => f.name === searchField.value);
        updateSearchOperators(selectedField.type);
    });

    // Inicializar operadores para el primer campo
    if (fields.length > 0) {
        updateSearchOperators(fields[0].type);
    }
}

function updateSearchOperators(fieldType) {
    const searchOperator = document.getElementById('searchOperator');
    searchOperator.innerHTML = '';
    
    const operators = {
        text: [
            { value: 'contains', text: 'Contiene' },
            { value: 'equals', text: 'Igual a' },
            { value: 'notEquals', text: 'Distinto a' },
            { value: 'startsWith', text: 'Empieza con' },
            { value: 'endsWith', text: 'Termina con' }
        ],
        number: [
            { value: 'equals', text: 'Igual a' },
            { value: 'notEquals', text: 'Distinto a' },
            { value: 'greater', text: 'Mayor que' },
            { value: 'less', text: 'Menor que' },
            { value: 'greaterEqual', text: 'Mayor o igual que' },
            { value: 'lessEqual', text: 'Menor o igual que' }
        ],
        date: [
            { value: 'equals', text: 'Igual a' },
            { value: 'notEquals', text: 'Distinto a' },
            { value: 'greater', text: 'Posterior a' },
            { value: 'less', text: 'Anterior a' },
            { value: 'greaterEqual', text: 'En o posterior a' },
            { value: 'lessEqual', text: 'En o anterior a' }
        ]
    };

    const availableOperators = operators[fieldType] || operators.text;
    
    availableOperators.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        searchOperator.appendChild(option);
    });
}


// Buscar clientes
function searchClients() {
    const searchField = document.getElementById('searchField').value;
    const searchOperator = document.getElementById('searchOperator').value;
    const searchValue = document.getElementById('searchValue').value;
    const field = fields.find(f => f.name === searchField);
    
    const filteredClients = clients.filter(client => {
        const clientValue = client[searchField];
        const compareValue = field.type === 'number' ? Number(searchValue) : searchValue;

        switch (searchOperator) {
            case 'contains':
                return String(clientValue).toLowerCase()
                    .includes(String(compareValue).toLowerCase());
            
            case 'equals':
                return field.type === 'number' 
                    ? clientValue === compareValue
                    : String(clientValue).toLowerCase() === String(compareValue).toLowerCase();
            
            case 'notEquals':
                return field.type === 'number'
                    ? clientValue !== compareValue
                    : String(clientValue).toLowerCase() !== String(compareValue).toLowerCase();
            
            case 'startsWith':
                return String(clientValue).toLowerCase()
                    .startsWith(String(compareValue).toLowerCase());
            
            case 'endsWith':
                return String(clientValue).toLowerCase()
                    .endsWith(String(compareValue).toLowerCase());
            
            case 'greater':
                return field.type === 'number'
                    ? clientValue > compareValue
                    : String(clientValue).toLowerCase() > String(compareValue).toLowerCase();
            
            case 'less':
                return field.type === 'number'
                    ? clientValue < compareValue
                    : String(clientValue).toLowerCase() < String(compareValue).toLowerCase();
            
            case 'greaterEqual':
                return field.type === 'number'
                    ? clientValue >= compareValue
                    : String(clientValue).toLowerCase() >= String(compareValue).toLowerCase();
            
            case 'lessEqual':
                return field.type === 'number'
                    ? clientValue <= compareValue
                    : String(clientValue).toLowerCase() <= String(compareValue).toLowerCase();
            
            default:
                return true;
        }
    });
    
    updateTable(filteredClients);
}

// Actualizar tabla
function updateTable(data = clients) {
    const header = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    
    // Actualizar encabezado
    header.innerHTML = '';
    
    // Agregar columna de numeración si está activada
    if (showRowNumbers) {
        const numHeader = document.createElement('th');
        numHeader.textContent = '#';
        numHeader.className = 'row-number-header';
        header.appendChild(numHeader);
    }
    
    fields.forEach(field => {
        const th = document.createElement('th');
        
        // Crear contenedor para el encabezado y los iconos de ordenación
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';
        headerContent.style.display = 'flex';
        headerContent.style.justifyContent = 'space-between';
        headerContent.style.alignItems = 'center';
        
        // Texto del encabezado
        const headerText = document.createElement('span');
        headerText.textContent = field.name;
        headerContent.appendChild(headerText);
        
        // Iconos de ordenación
        const sortIcons = document.createElement('div');
        sortIcons.className = 'sort-icons';
        sortIcons.style.display = 'flex';
        sortIcons.style.flexDirection = 'column';
        
        // Determinar qué icono debe estar activo
        let ascActiveClass = '';
        let descActiveClass = '';
        if (currentSort.field === field.name) {
            if (currentSort.direction === 'asc') {
                ascActiveClass = 'active';
            } else {
                descActiveClass = 'active';
            }
        }
        
        sortIcons.innerHTML = `
            <i class="fas fa-sort-up sort-icon ${ascActiveClass}" 
               onclick="sortTable('${field.name}')" style="cursor:pointer; color:${ascActiveClass ? 'white' : 'rgba(255,255,255,0.5)'}"></i>
            <i class="fas fa-sort-down sort-icon ${descActiveClass}" 
               onclick="sortTable('${field.name}')" style="cursor:pointer; color:${descActiveClass ? 'white' : 'rgba(255,255,255,0.5)'}"></i>
        `;
        headerContent.appendChild(sortIcons);
        
        // Selector de función de total
        const totalSelector = document.createElement('select');
        totalSelector.className = 'total-function-selector';
        totalSelector.style.marginTop = '5px';
        totalSelector.style.fontSize = '0.8rem';
        totalSelector.style.width = '100%';
        totalSelector.innerHTML = `
            <option value="none" ${field.totalFunction === 'none' ? 'selected' : ''}>-</option>
            <option value="sum" ${field.totalFunction === 'sum' ? 'selected' : ''}>Suma</option>
            <option value="avg" ${field.totalFunction === 'avg' ? 'selected' : ''}>Promedio</option>
            <option value="min" ${field.totalFunction === 'min' ? 'selected' : ''}>Mínimo</option>
            <option value="max" ${field.totalFunction === 'max' ? 'selected' : ''}>Máximo</option>
            <option value="count" ${field.totalFunction === 'count' ? 'selected' : ''}>Contar</option>
            ${field.type === 'status' ? 
                `<option value="countTrue" ${field.totalFunction === 'countTrue' ? 'selected' : ''}>Contar Activos</option>` : ''}
        `;
        
        // Actualizar la función de total cuando cambie
        totalSelector.addEventListener('change', (e) => {
            field.totalFunction = e.target.value;
            updateTable(data);
        });
        
        th.appendChild(headerContent);
        th.appendChild(totalSelector);
        header.appendChild(th);
    });
    
    // Agregar columna para acciones
    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Acciones';
    header.appendChild(actionsHeader);
    
    // Actualizar cuerpo
    body.innerHTML = '';
    data.forEach((client, index) => {
        const row = document.createElement('tr');
        
        // Agregar celda de numeración si está activada
        if (showRowNumbers) {
            const numCell = document.createElement('td');
            numCell.textContent = index + 1;
            numCell.className = 'row-number';
            row.appendChild(numCell);
        }
        
        // Agregar celdas de datos
        fields.forEach(field => {
            const td = document.createElement('td');
            if (field.type === 'image') {
                td.innerHTML = `<img src="${client[field.name]}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">`;
            } else // Cuando se crea la celda para un campo de tipo status
            if (field.type === 'status') {
                // Usar solo el badge de estado sin el botón de edición
                td.innerHTML = client[field.name] 
                    ? `<span class="status-badge active"><i class="fas fa-check-circle"></i> Activo</span>` 
                    : `<span class="status-badge inactive"><i class="fas fa-times-circle"></i> Inactivo</span>`;
            } else {
                td.innerHTML = `
                    <div class="editable-cell">
                        <span class="cell-value">${client[field.name]}</span>
                        <button class="edit-btn" onclick="editCell(this, ${index}, '${field.name}', '${field.type}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
            }
            row.appendChild(td);
        });

        // Agregar celda de acciones
        const actionsTd = document.createElement('td');
        actionsTd.innerHTML = `
            <div class="action-buttons">
                <button class="action-btn edit" onclick="editRow(${index})" title="Editar fila">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteRow(${index})" title="Eliminar fila">
                    <i class="fas fa-trash"></i>
                </button>
                ${hasStatusField(fields) ? 
                    `<button class="action-btn status" onclick="toggleStatusInTable(${index})" title="Cambiar estado">
                        <i class="fas fa-toggle-on"></i>
                    </button>` : ''}
            </div>
        `;
        row.appendChild(actionsTd);
        
        body.appendChild(row);
    });
    
    // Agregar fila de totales si hay datos
    if (data.length > 0) {
        const totals = calculateTotals(data);
        const totalRow = document.createElement('tr');
        totalRow.className = 'totals-row';
        totalRow.style.backgroundColor = '#e8f0fe';
        totalRow.style.fontWeight = 'bold';
        
        // Celda para la etiqueta "Total" en la columna de numeración
        if (showRowNumbers) {
            const totalLabelCell = document.createElement('td');
            totalLabelCell.textContent = 'Total';
            totalLabelCell.className = 'total-label';
            totalRow.appendChild(totalLabelCell);
        }
        
        // Agregar celdas de totales
        fields.forEach(field => {
            const td = document.createElement('td');
            
            if (field.totalFunction !== 'none') {
                td.textContent = totals[field.name];
                td.className = 'total-value';
            } else {
                td.textContent = '-';
                td.className = 'total-none';
            }
            
            totalRow.appendChild(td);
        });
        
        // Celda vacía para la columna de acciones
        const emptyActionCell = document.createElement('td');
        totalRow.appendChild(emptyActionCell);
        
        body.appendChild(totalRow);
    }
}

/**
 * Verifica si hay algún campo de tipo status
 */
function hasStatusField(fields) {
    return fields.some(field => field.type === 'status');
}

/**
 * Edita el estado directamente desde la celda
 */
function editStatus(clientIndex, fieldName, currentValue) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);
    
    // Crear diálogo
    const dialog = document.createElement('div');
    dialog.className = 'status-dialog';
    dialog.innerHTML = `
        <h3>Cambiar Estado</h3>
        <div class="status-options">
            <button type="button" class="status-button active" 
                    onclick="selectStatus(this, true)" 
                    ${currentValue ? 'style="opacity: 1"' : 'style="opacity: 0.5"'}>
                <i class="fas fa-check-circle"></i> Activo
            </button>
            <button type="button" class="status-button inactive" 
                    onclick="selectStatus(this, false)" 
                    ${!currentValue ? 'style="opacity: 1"' : 'style="opacity: 0.5"'}>
                <i class="fas fa-times-circle"></i> Inactivo
            </button>
        </div>
        <div class="status-dialog-buttons">
            <button onclick="closeStatusDialog()">Cancelar</button>
            <button onclick="saveStatus(${clientIndex}, '${fieldName}')">
                Guardar
            </button>
        </div>
    `;
    document.body.appendChild(dialog);
    
    // Guardar referencias para uso posterior
    window.currentStatusDialog = {
        overlay: overlay,
        dialog: dialog,
        newValue: currentValue
    };
}

/**
 * Cambia el estado desde el botón de acciones
 */
function toggleStatusInTable(clientIndex) {
    // Encontrar el primer campo de tipo status
    const statusField = fields.find(field => field.type === 'status');
    
    if (statusField) {
        const fieldName = statusField.name;
        const currentValue = clients[clientIndex][fieldName];
        clients[clientIndex][fieldName] = !currentValue;
        
        // Actualizar la tabla
        updateTable();
    }
}


// Exportar a CSV (Excel)
function exportToCSV(customData) {
    // Usar los datos filtrados/ordenados actuales si no se proporcionan datos personalizados
    const data = customData || document.getElementById('tableBody').childElementCount > 0 
        ? Array.from(document.getElementById('tableBody').children)
            .filter(row => !row.classList.contains('totals-row'))
            .map((row, index) => {
                const client = {};
                let cellIndex = 0;
                
                // Si hay numeración, saltarse la primera celda
                if (showRowNumbers) {
                    cellIndex = 1;
                }
                
                fields.forEach(field => {
                    const cell = row.children[cellIndex];
                    if (field.type === 'status') {
                        client[field.name] = cell.querySelector('.status-badge').classList.contains('active');
                    } else if (field.type === 'image') {
                        const img = cell.querySelector('img');
                        client[field.name] = img ? img.src : '';
                    } else {
                        client[field.name] = cell.textContent.trim();
                    }
                    cellIndex++;
                });
                return client;
            })
        : clients;
    
    if (data.length === 0) return;
    
    // Obtener el título de la base de datos
    const dbTitle = document.getElementById('databaseTitle').value || 'Base de Datos';
    const timestamp = new Date().toLocaleString();
    
    // Crear el contenido HTML con estilos
    let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                    font-family: Arial, sans-serif;
                }
                .header {
                    background-color: #1a73e8;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                    padding: 10px;
                }
                .subheader {
                    background-color: #4285f4;
                    color: white;
                    font-weight: bold;
                }
                th {
                    background-color: #e8f0fe;
                    color: #1a73e8;
                    font-weight: bold;
                    text-align: center;
                    padding: 8px;
                    border: 1px solid #dadce0;
                }
                td {
                    padding: 8px;
                    border: 1px solid #dadce0;
                    text-align: left;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1a73e8;
                    text-align: center;
                    padding: 20px;
                }
                .timestamp {
                    font-size: 12px;
                    color: #70757a;
                    text-align: right;
                    padding: 5px;
                }
                .totals-row {
                    background-color: #e8f0fe;
                    font-weight: bold;
                }
                .row-number {
                    text-align: center;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="title">${dbTitle}</div>
            <div class="timestamp">Exportado el: ${timestamp}</div>
            <table>
                <thead>
                    <tr>
    `;
    
    // Agregar columna de numeración si está activada
    if (showRowNumbers) {
        html += `<th>#</th>`;
    }
    
    // Agregar encabezados
    fields.forEach(field => {
        html += `<th>${field.name}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // Agregar filas de datos
    data.forEach((client, index) => {
        html += '<tr>';
        
        // Agregar número de fila
        if (showRowNumbers) {
            html += `<td class="row-number">${index + 1}</td>`;
        }
        
        fields.forEach(field => {
            let value = client[field.name];
            
            // Formatear valores especiales
            if (field.type === 'status') {
                value = value ? 'Activo' : 'Inactivo';
            } else if (field.type === 'date') {
                value = new Date(value).toLocaleDateString();
            } else if (field.type === 'image') {
                value = '[Imagen]';
            }
            
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    
    // Agregar fila de totales
    if (data.length > 0) {
        const totals = calculateTotals(data);
        html += '<tr class="totals-row">';
        
        // Etiqueta "Total" en la columna de numeración
        if (showRowNumbers) {
            html += `<td>Total</td>`;
        }
        
        fields.forEach(field => {
            if (field.totalFunction !== 'none') {
                html += `<td>${totals[field.name]}</td>`;
            } else {
                html += `<td>-</td>`;
            }
        });
        
        html += '</tr>';
    }
    
    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    // Crear el blob y descargar
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp_filename = new Date().toISOString().replace(/[:.]/g, '-');
    a.setAttribute('href', url);
    a.setAttribute('download', `${dbTitle}_${timestamp_filename}.xls`);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Modo oscuro
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

// Título personalizado
const databaseTitle = document.getElementById('databaseTitle');
databaseTitle.addEventListener('input', (e) => {
    document.title = e.target.value || 'Administrador de Base de Datos';
});

// Función para previsualizar imágenes
function previewImage(input) {
    const preview = document.getElementById(`preview-${input.name}`);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Función para importar base de datos
function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.fields && Array.isArray(data.fields) && 
                    data.clients && Array.isArray(data.clients)) {
                    fields = data.fields;
                    clients = data.clients;
                    updateActiveFields();
                    updateClientForm();
                    updateSearchFields();
                    updateTable();
                    
                    // Actualizar el título si existe
                    const dbTitle = document.getElementById('databaseTitle');
                    if (data.title) {
                        dbTitle.value = data.title;
                        document.title = data.title;
                    }
                    
                    alert('Base de datos importada exitosamente');
                } else {
                    throw new Error('Formato de archivo inválido');
                }
            } catch (error) {
                alert('Error al importar el archivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Función para exportar a JSON
function exportToJSON() {
    if (clients.length === 0 && fields.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const data = {
        title: document.getElementById('databaseTitle').value || 'Base de Datos',
        fields: fields,
        clients: clients
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbTitle = document.getElementById('databaseTitle').value || 'Base de Datos';
    a.setAttribute('href', url);
    a.setAttribute('download', `${dbTitle}_${timestamp}.json`);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Exportar a formato Access (ACCDB)
function exportToAccess() {
    if (clients.length === 0) return;
    
    // Obtener el título de la base de datos
    const dbTitle = document.getElementById('databaseTitle').value || 'Base de Datos';
    
    // Crear un objeto con la estructura de datos para Access
    const accessData = {
        database: dbTitle,
        tables: [
            {
                name: "Clientes",
                columns: fields.map(field => ({
                    name: field.name,
                    type: mapTypeToAccessType(field.type)
                })),
                rows: clients.map(client => {
                    const row = {};
                    fields.forEach(field => {
                        // Formatear valores según el tipo
                        if (field.type === 'status') {
                            row[field.name] = client[field.name] ? 'Activo' : 'Inactivo';
                        } else if (field.type === 'image') {
                            row[field.name] = '[Imagen]'; // No se pueden incluir imágenes directamente
                        } else {
                            row[field.name] = client[field.name];
                        }
                    });
                    return row;
                })
            }
        ]
    };
    
    // Convertir a XML (formato que Access puede importar)
    const xml = convertToAccessXML(accessData);
    
    // Crear un archivo de texto con instrucciones
    const instructions = `
    INSTRUCCIONES PARA IMPORTAR A ACCESS:
    
    1. Abra Microsoft Access
    2. Cree una nueva base de datos o abra una existente
    3. En la pestaña "Datos externos", seleccione "XML File"
    4. Seleccione "Importar"
    5. Busque y seleccione este archivo XML
    6. Siga las instrucciones del asistente de importación
    
    Nota: Este archivo XML contiene los datos exportados de su base de datos "${dbTitle}".
    `;
    
    // Combinar instrucciones y XML
    const fullContent = instructions + "\n\n" + xml;
    
    // Crear el blob y descargar
    const blob = new Blob([fullContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.setAttribute('href', url);
    a.setAttribute('download', `${dbTitle}_${timestamp}.accdb.xml`);
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Mostrar instrucciones adicionales
    alert('Se ha generado un archivo XML compatible con Access.\nSiga las instrucciones incluidas en el archivo para importarlo a Microsoft Access.');
}

// Mapear tipos de campo a tipos de Access
function mapTypeToAccessType(fieldType) {
    switch(fieldType) {
        case 'text': return 'Text';
        case 'number': return 'Number';
        case 'date': return 'Date/Time';
        case 'image': return 'OLE Object';
        case 'status': return 'Yes/No';
        default: return 'Text';
    }
}

// Convertir datos a formato XML para Access
function convertToAccessXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<dataroot xmlns:od="urn:schemas-microsoft-com:officedata">\n';
    
    // Para cada fila de datos
    data.tables[0].rows.forEach(row => {
        xml += `  <${data.tables[0].name}>\n`;
        
        // Para cada columna en la fila
        data.tables[0].columns.forEach(column => {
            const value = row[column.name] !== undefined && row[column.name] !== null 
                ? row[column.name] 
                : '';
            
            xml += `    <${column.name}>${escapeXML(value)}</${column.name}>\n`;
        });
        
        xml += `  </${data.tables[0].name}>\n`;
    });
    
    xml += '</dataroot>';
    return xml;
}

// Escapar caracteres especiales para XML
function escapeXML(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Scroll to top functionality
const scrollToTopButton = document.getElementById('scrollToTop');

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopButton.style.display = 'flex';
    } else {
        scrollToTopButton.style.display = 'none';
    }
};

scrollToTopButton.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Función para editar una celda individual
function editCell(button, clientIndex, fieldName, fieldType) {
    const cellDiv = button.parentElement;
    const span = cellDiv.querySelector('.cell-value');
    const currentValue = span.textContent;
    
    let input;
    if (fieldType === 'date') {
        input = document.createElement('input');
        input.type = 'date';
        input.value = currentValue;
    } else if (fieldType === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = currentValue;
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
    }
    
    input.className = 'edit-input';
    cellDiv.replaceChild(input, span);
    button.innerHTML = '<i class="fas fa-save"></i>';
    button.onclick = () => saveCell(button, clientIndex, fieldName, fieldType);
    input.focus();
}

// Función para guardar el valor editado
function saveCell(button, clientIndex, fieldName, fieldType) {
    const cellDiv = button.parentElement;
    const input = cellDiv.querySelector('.edit-input');
    const newValue = fieldType === 'number' ? Number(input.value) : input.value;
    
    clients[clientIndex][fieldName] = newValue;
    
    const span = document.createElement('span');
    span.className = 'cell-value';
    span.textContent = newValue;
    cellDiv.replaceChild(span, input);
    button.innerHTML = '<i class="fas fa-edit"></i>';
    button.onclick = () => editCell(button, clientIndex, fieldName, fieldType);
}

// Función para eliminar una fila
function deleteRow(index) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        clients.splice(index, 1);
        updateTable();
    }
}

// Función para editar una fila completa
function editRow(index) {
    const client = clients[index];
    // Desplazarse al formulario
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
    
    // Rellenar el formulario con los datos del cliente
    fields.forEach(field => {
        if (field.type === 'image') {
            const preview = document.getElementById(`preview-${field.name}`);
            if (client[field.name]) {
                preview.src = client[field.name];
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        } else if (field.type === 'status') {
            const statusButton = document.querySelector(`[name="${field.name}"]`).previousElementSibling;
            const hiddenInput = document.querySelector(`[name="${field.name}"]`);
            
            if (client[field.name]) {
                statusButton.className = 'status-button active';
                statusButton.innerHTML = '<i class="fas fa-check-circle"></i> Activo';
                statusButton.setAttribute('data-status', 'active');
                hiddenInput.value = 'true';
            } else {
                statusButton.className = 'status-button inactive';
                statusButton.innerHTML = '<i class="fas fa-times-circle"></i> Inactivo';
                statusButton.setAttribute('data-status', 'inactive');
                hiddenInput.value = 'false';
            }
        } else {
            const input = document.querySelector(`[name="${field.name}"]`);
            if (input) {
                input.value = client[field.name] || '';
            }
        }
    });
    
    // Cambiar el botón de submit para actualizar en lugar de crear
    const form = document.getElementById('clientForm');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
    
    // Guardar el índice del cliente en un atributo de datos
    form.setAttribute('data-editing-index', index);
    
    // Cambiar el manejador del formulario
    form.onsubmit = function(e) {
        e.preventDefault();
        const editingIndex = parseInt(this.getAttribute('data-editing-index'));
        updateClient(editingIndex);
    };
}

/**
 * Edita el estado con un diálogo modal
 */
function editStatus(clientIndex, fieldName, currentValue) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);
    
    // Crear diálogo
    const dialog = document.createElement('div');
    dialog.className = 'status-dialog';
    dialog.innerHTML = `
        <h3>Cambiar Estado</h3>
        <div class="status-options">
            <button type="button" class="status-button ${currentValue ? 'active' : 'inactive'}" 
                    onclick="selectStatus(this, ${clientIndex}, '${fieldName}', ${!currentValue})">
                <i class="fas fa-${currentValue ? 'check' : 'times'}-circle"></i> 
                ${currentValue ? 'Activo' : 'Inactivo'}
            </button>
        </div>
        <div class="status-dialog-buttons">
            <button onclick="closeStatusDialog()">Cancelar</button>
            <button onclick="saveStatus(${clientIndex}, '${fieldName}', ${!currentValue})">
                Guardar
            </button>
        </div>
    `;
    document.body.appendChild(dialog);
    
    // Guardar referencias para uso posterior
    window.currentStatusDialog = {
        overlay: overlay,
        dialog: dialog,
        newValue: currentValue
    };
}

/**
 * Selecciona un estado en el diálogo
 */
function selectStatus(button, isActive) {
    // Actualizar el valor seleccionado
    window.currentStatusDialog.newValue = isActive;
    
    // Actualizar la apariencia de los botones
    if (button.classList.contains('active')) {
        button.classList.remove('inactive');
        button.classList.add('active');
    } else {
        button.classList.remove('active');
        button.classList.add('inactive');
    }
    
    // Actualizar la opacidad
    const buttons = button.parentElement.querySelectorAll('.status-button');
    buttons.forEach(btn => {
        btn.style.opacity = '0.5';
    });
    button.style.opacity = '1';
}

/**
 * Guarda el estado seleccionado
 */
function saveStatus(clientIndex, fieldName) {
    if (window.currentStatusDialog) {
        const newValue = window.currentStatusDialog.newValue;
        clients[clientIndex][fieldName] = newValue;
        updateTable();
        closeStatusDialog();
    }
}

/**
 * Cierra el diálogo de estado
 */
function closeStatusDialog() {
    if (window.currentStatusDialog) {
        document.body.removeChild(window.currentStatusDialog.overlay);
        document.body.removeChild(window.currentStatusDialog.dialog);
        window.currentStatusDialog = null;
    }
}

// Exportar datos filtrados
function exportFilteredData() {
    // Obtener los datos actualmente mostrados en la tabla
    const tableBody = document.getElementById('tableBody');
    const visibleRows = Array.from(tableBody.children)
        .filter(row => !row.classList.contains('totals-row'));
    
    if (visibleRows.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Extraer los datos de las filas visibles
    const filteredData = visibleRows.map((row, index) => {
        const client = {};
        let cellIndex = 0;
        
        // Si hay numeración, saltarse la primera celda
        if (showRowNumbers) {
            cellIndex = 1;
        }
        
        fields.forEach(field => {
            const cell = row.children[cellIndex];
            if (field.type === 'status') {
                client[field.name] = cell.querySelector('.status-badge').classList.contains('active');
            } else if (field.type === 'image') {
                const img = cell.querySelector('img');
                client[field.name] = img ? img.src : '';
            } else {
                const valueSpan = cell.querySelector('.cell-value');
                client[field.name] = valueSpan ? valueSpan.textContent : cell.textContent.trim();
            }
            cellIndex++;
        });
        return client;
    });
    
    // Mostrar un diálogo para elegir el formato de exportación
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    document.body.appendChild(overlay);
    
    const dialog = document.createElement('div');
    dialog.className = 'status-dialog';
    dialog.innerHTML = `
        <h3>Exportar Resultados</h3>
        <div class="export-options">
            <button onclick="exportToCSV(${JSON.stringify(filteredData)}); closeExportDialog()">
                <i class="fas fa-file-excel"></i> Excel
            </button>
            <button onclick="exportFilteredToJSON(${JSON.stringify(filteredData)}); closeExportDialog()">
                <i class="fas fa-file-code"></i> JSON
            </button>
            <button onclick="exportFilteredToAccess(${JSON.stringify(filteredData)}); closeExportDialog()">
                <i class="fas fa-database"></i> Access
            </button>
        </div>
        <div class="status-dialog-buttons">
            <button onclick="closeExportDialog()">Cancelar</button>
        </div>
    `;
    document.body.appendChild(dialog);
    
    // Guardar referencias para uso posterior
    window.exportDialog = {
        overlay: overlay,
        dialog: dialog
    };
}

// Cerrar diálogo de exportación
function closeExportDialog() {
    if (window.exportDialog) {
        document.body.removeChild(window.exportDialog.overlay);
        document.body.removeChild(window.exportDialog.dialog);
        window.exportDialog = null;
    }
}

// Exportar datos filtrados a JSON
function exportFilteredToJSON(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const data = {
        title: document.getElementById('databaseTitle').value || 'Base de Datos',
        fields: fields,
        clients: filteredData
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.setAttribute('href', url);
    a.setAttribute('download', `filtered_database_${timestamp}.json`);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Exportar a formato SQL
function exportToSQL() {
    if (clients.length === 0) return;
    
    // Obtener el título de la base de datos
    const dbTitle = document.getElementById('databaseTitle').value || 'Base de Datos';
    const tableName = dbTitle.replace(/\s+/g, '_').toLowerCase();
    
    // Crear el contenido SQL
    let sql = `-- Base de datos: ${dbTitle}\n`;
    sql += `-- Fecha de exportación: ${new Date().toLocaleString()}\n\n`;
    
    // Crear instrucciones para diferentes motores SQL
    
    // SQLite
    sql += `-- SQLite\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    sql += `    id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
    
    // Definir columnas
    fields.forEach((field, index) => {
        const sqlType = getSQLiteType(field.type);
        sql += `    ${field.name.replace(/\s+/g, '_').toLowerCase()} ${sqlType}`;
        if (index < fields.length - 1) sql += ',';
        sql += '\n';
    });
    
    sql += `);\n\n`;
    
    // MySQL
    sql += `-- MySQL\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;
    sql += `    \`id\` INT AUTO_INCREMENT PRIMARY KEY,\n`;
    
    // Definir columnas para MySQL
    fields.forEach((field, index) => {
        const sqlType = getMySQLType(field.type);
        sql += `    \`${field.name.replace(/\s+/g, '_').toLowerCase()}\` ${sqlType}`;
        if (index < fields.length - 1) sql += ',';
        sql += '\n';
    });
    
    sql += `);\n\n`;
    
    // PostgreSQL
    sql += `-- PostgreSQL\n`;
    sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
    sql += `    "id" SERIAL PRIMARY KEY,\n`;
    
    // Definir columnas para PostgreSQL
    fields.forEach((field, index) => {
        const sqlType = getPostgreSQLType(field.type);
        sql += `    "${field.name.replace(/\s+/g, '_').toLowerCase()}" ${sqlType}`;
        if (index < fields.length - 1) sql += ',';
        sql += '\n';
    });
    
    sql += `);\n\n`;
    
    // Insertar datos
    sql += `-- Insertar datos\n`;
    
    // SQLite inserts
    sql += `-- SQLite inserts\n`;
    clients.forEach(client => {
        const columns = fields.map(field => field.name.replace(/\s+/g, '_').toLowerCase()).join(', ');
        const values = fields.map(field => {
            if (field.type === 'text' || field.type === 'date') {
                return `'${escapeSQL(String(client[field.name]))}'`;
            } else if (field.type === 'status') {
                return client[field.name] ? '1' : '0';
            } else if (field.type === 'image') {
                return "'[BLOB DATA]'";
            } else {
                return client[field.name] || 'NULL';
            }
        }).join(', ');
        
        sql += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
    });
    
    sql += '\n';
    
    // MySQL inserts
    sql += `-- MySQL inserts\n`;
    clients.forEach(client => {
        const columns = fields.map(field => `\`${field.name.replace(/\s+/g, '_').toLowerCase()}\``).join(', ');
        const values = fields.map(field => {
            if (field.type === 'text' || field.type === 'date') {
                return `'${escapeSQL(String(client[field.name]))}'`;
            } else if (field.type === 'status') {
                return client[field.name] ? '1' : '0';
            } else if (field.type === 'image') {
                return "'[BLOB DATA]'";
            } else {
                return client[field.name] || 'NULL';
            }
        }).join(', ');
        
        sql += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
    });
    
    sql += '\n';
    
    // PostgreSQL inserts
    sql += `-- PostgreSQL inserts\n`;
    clients.forEach(client => {
        const columns = fields.map(field => `"${field.name.replace(/\s+/g, '_').toLowerCase()}"`).join(', ');
        const values = fields.map(field => {
            if (field.type === 'text' || field.type === 'date') {
                return `'${escapeSQL(String(client[field.name]))}'`;
            } else if (field.type === 'status') {
                return client[field.name] ? 'TRUE' : 'FALSE';
            } else if (field.type === 'image') {
                return "'[BLOB DATA]'";
            } else {
                return client[field.name] || 'NULL';
            }
        }).join(', ');
        
        sql += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
    });
    
    // Crear el blob y descargar
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.setAttribute('href', url);
    a.setAttribute('download', `${dbTitle}_${timestamp}.sql`);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Funciones auxiliares para determinar tipos SQL
function getSQLiteType(fieldType) {
    switch(fieldType) {
        case 'text': return 'TEXT';
        case 'number': return 'NUMERIC';
        case 'date': return 'TEXT';
        case 'image': return 'BLOB';
        case 'status': return 'INTEGER'; // 0 o 1
        default: return 'TEXT';
    }
}

function getMySQLType(fieldType) {
    switch(fieldType) {
        case 'text': return 'VARCHAR(255)';
        case 'number': return 'DECIMAL(10,2)';
        case 'date': return 'DATE';
        case 'image': return 'LONGBLOB';
        case 'status': return 'TINYINT(1)'; // 0 o 1
        default: return 'VARCHAR(255)';
    }
}

function getPostgreSQLType(fieldType) {
    switch(fieldType) {
        case 'text': return 'VARCHAR(255)';
        case 'number': return 'NUMERIC(10,2)';
        case 'date': return 'DATE';
        case 'image': return 'BYTEA';
        case 'status': return 'BOOLEAN';
        default: return 'VARCHAR(255)';
    }
}

// Escapar caracteres especiales para SQL
function escapeSQL(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return value
        .replace(/'/g, "''") // Escapar comillas simples
        .replace(/\\/g, "\\\\"); // Escapar barras invertidas
}

// Exportar datos filtrados a Access
function exportFilteredToAccess(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Obtener el título de la base de datos
    const dbTitle = document.getElementById('databaseTitle').value || 'Base de Datos';
    
    // Crear un objeto con la estructura de datos para Access
    const accessData = {
        database: dbTitle,
        tables: [
            {
                name: "Clientes",
                columns: fields.map(field => ({
                    name: field.name,
                    type: mapTypeToAccessType(field.type)
                })),
                rows: filteredData.map(client => {
                    const row = {};
                    fields.forEach(field => {
                        // Formatear valores según el tipo
                        if (field.type === 'status') {
                            row[field.name] = client[field.name] ? 'Activo' : 'Inactivo';
                        } else if (field.type === 'image') {
                            row[field.name] = '[Imagen]'; // No se pueden incluir imágenes directamente
                        } else {
                            row[field.name] = client[field.name];
                        }
                    });
                    return row;
                })
            }
        ]
    };
    
    // Convertir a XML (formato que Access puede importar)
    const xml = convertToAccessXML(accessData);
    
    // Crear el blob y descargar
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.setAttribute('href', url);
    a.setAttribute('download', `filtered_${dbTitle}_${timestamp}.xml`);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Función para ordenar los datos de la tabla
function sortTable(fieldName) {
    // Si hacemos clic en el mismo campo, invertimos la dirección
    if (currentSort.field === fieldName) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = fieldName;
        currentSort.direction = 'asc';
    }
    
    const field = fields.find(f => f.name === fieldName);
    
    clients.sort((a, b) => {
        let valueA = a[fieldName];
        let valueB = b[fieldName];
        
        // Convertir a número si es un campo numérico
        if (field.type === 'number') {
            valueA = Number(valueA);
            valueB = Number(valueB);
        } else if (field.type === 'date') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else if (field.type === 'status') {
            // Para estados, true viene antes que false en orden ascendente
            return currentSort.direction === 'asc' 
                ? (valueA === valueB ? 0 : valueA ? -1 : 1)
                : (valueA === valueB ? 0 : valueA ? 1 : -1);
        } else {
            // Para texto, convertir a minúsculas para comparación insensible a mayúsculas
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
        }
        
        // Comparar valores
        if (valueA < valueB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateTable();
}

// Calcular totales para la fila de resumen
function calculateTotals(data) {
    const totals = {};
    
    fields.forEach(field => {
        const values = data.map(client => client[field.name]);
        
        switch (field.totalFunction) {
            case 'sum':
                totals[field.name] = values.reduce((sum, val) => sum + Number(val || 0), 0);
                break;
            case 'avg':
                const sum = values.reduce((sum, val) => sum + Number(val || 0), 0);
                totals[field.name] = values.length ? (sum / values.length).toFixed(2) : 0;
                break;
            case 'min':
                totals[field.name] = values.length ? Math.min(...values.map(v => Number(v || 0))) : 0;
                break;
            case 'max':
                totals[field.name] = values.length ? Math.max(...values.map(v => Number(v || 0))) : 0;
                break;
            case 'count':
                totals[field.name] = values.filter(v => v && v.trim() !== '').length;
                break;
            case 'countTrue':
                totals[field.name] = values.filter(v => v === true).length;
                break;
            default:
                totals[field.name] = '';
        }
    });
    
    return totals;
}

// Alternar la visualización de números de fila
function toggleRowNumbers() {
    showRowNumbers = !showRowNumbers;
    updateTable();
}

// Función para mostrar mensaje sobre importación
function showImportInfo() {
    alert('Por favor selecciona un archivo JSON compatible.\n\nEl archivo debe contener la estructura correcta con campos y clientes.');
    document.getElementById('fileInput').click();
}

// Función para actualizar un cliente existente
function updateClient(index) {
    const form = document.getElementById('clientForm');
    const formData = new FormData(form);
    const updatedClient = {};
    
    fields.forEach(field => {
        if (field.type === 'image') {
            const preview = document.getElementById(`preview-${field.name}`);
            updatedClient[field.name] = preview.style.display !== 'none' ? preview.src : '';
            
            // Limpiar la imagen después de actualizar
            preview.src = '';
            preview.style.display = 'none';
        } else if (field.type === 'status') {
            updatedClient[field.name] = formData.get(field.name) === 'true';
        } else if (field.type === 'number') {
            updatedClient[field.name] = formData.get(field.name) ? Number(formData.get(field.name)) : 0;
        } else {
            updatedClient[field.name] = formData.get(field.name) || '';
        }
    });
    
    clients[index] = updatedClient;
    
    // Actualizar la tabla
    updateTable();
    
    // Resetear el formulario
    form.reset();
    form.removeAttribute('data-editing-index');
    
    // Resetear las previsualizaciones de imágenes
    document.querySelectorAll('.image-preview').forEach(img => {
        img.style.display = 'none';
        img.src = '';
    });
    
    // Resetear los botones de estado
    document.querySelectorAll('.status-button').forEach(btn => {
        btn.className = 'status-button inactive';
        btn.innerHTML = '<i class="fas fa-times-circle"></i> Inactivo';
        btn.setAttribute('data-status', 'inactive');
        btn.nextElementSibling.value = 'false';
    });
    
    // Restaurar el botón de submit
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Cliente';
    
    // Restaurar el manejador del formulario
    form.onsubmit = handleFormSubmit;
}

// Confirmación al cerrar o recargar la página
window.addEventListener('beforeunload', function(e) {
    // Cancelar el evento
    e.preventDefault();
    // Chrome requiere returnValue
    e.returnValue = '¿Estás seguro de que deseas salir? Los datos no guardados se perderán.';
    // Mensaje para mostrar al usuario
    return '¿Estás seguro de que deseas salir? Los datos no guardados se perderán.';
});

// Scroll to bottom functionality
const scrollToBottomButton = document.createElement('button');
scrollToBottomButton.id = 'scrollToBottom';
scrollToBottomButton.className = 'scroll-to-bottom';
scrollToBottomButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
document.body.appendChild(scrollToBottomButton);

window.onscroll = function() {
    // Lógica para el botón de scroll to top
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopButton.style.display = 'flex';
    } else {
        scrollToTopButton.style.display = 'none';
    }
    
    // Lógica para el botón de scroll to bottom
    const scrollPosition = window.scrollY;
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    
    if (totalHeight - scrollPosition > 20) {
        scrollToBottomButton.style.display = 'flex';
    } else {
        scrollToBottomButton.style.display = 'none';
    }
};

scrollToBottomButton.onclick = function() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};

// Detectar si es un dispositivo móvil
function isMobileDevice() {
    return (window.innerWidth <= 768);
  }
  
  // Ajustar la tabla para dispositivos móviles
  function optimizeTableForMobile() {
    if (isMobileDevice()) {
      // Añadir indicador de scroll horizontal si es necesario
      const tableContainer = document.querySelector('.table-container');
      const table = document.getElementById('clientsTable');
      
      if (table.offsetWidth > tableContainer.offsetWidth) {
        tableContainer.classList.add('scrollable');
      } else {
        tableContainer.classList.remove('scrollable');
      }
      
      // Simplificar los encabezados en móvil
      document.querySelectorAll('.total-function-selector').forEach(selector => {
        selector.style.display = 'none';
      });
    }
  }
  
  // Evento para detectar cambios en el tamaño de la ventana
  window.addEventListener('resize', function() {
    optimizeTableForMobile();
  });
  
  // Llamar a la función al cargar la página
  document.addEventListener('DOMContentLoaded', function() {
    optimizeTableForMobile();
  });
  
  // Mejorar la experiencia táctil para la tabla en dispositivos móviles
  if (isMobileDevice()) {
    const tableContainer = document.querySelector('.table-container');
    
    // Añadir indicación visual de scroll horizontal
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '<i class="fas fa-arrows-alt-h"></i>';
    tableContainer.appendChild(scrollIndicator);
    
    // Ocultar el indicador después de un tiempo
    setTimeout(() => {
      scrollIndicator.style.opacity = '0';
      setTimeout(() => {
        scrollIndicator.remove();
      }, 500);
    }, 3000);
};

// Menú responsivo
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    // Activar enlaces del navbar
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinkElements.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Cerrar el menú móvil si está abierto
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('show');
            }
        });
    });
});

// Toggle para el menú desplegable de exportación
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('exportDropdownBtn');
    const exportContent = document.getElementById('exportDropdownContent');
    
    if (exportBtn && exportContent) {
        exportBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamiento predeterminado
            e.stopPropagation(); // Detener propagación del evento
            exportContent.classList.toggle('show');
        });
        
        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', function(e) {
            if (exportContent.classList.contains('show') && 
                !exportBtn.contains(e.target) && 
                !exportContent.contains(e.target)) {
                exportContent.classList.remove('show');
            }
        });
        
        // Evitar que el menú se cierre al hacer clic dentro de él
        exportContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// Función para hacer que los campos sean arrastrables
function makeFieldsDraggable() {
    const activeFields = document.getElementById('activeFields');
    
    // Habilitar Sortable.js si está disponible, de lo contrario usar HTML5 Drag and Drop API
    if (typeof Sortable !== 'undefined') {
        new Sortable(activeFields, {
            animation: 150,
            ghostClass: 'field-tag-ghost',
            onEnd: function() {
                // Actualizar el orden de los campos en el array
                updateFieldsOrder();
            }
        });
    } else {
        // Implementación con HTML5 Drag and Drop API
        const fieldTags = activeFields.querySelectorAll('.field-tag');
        
        fieldTags.forEach(tag => {
            tag.setAttribute('draggable', 'true');
            
            // Agregar eventos de arrastrar
            tag.addEventListener('dragstart', handleDragStart);
            tag.addEventListener('dragover', handleDragOver);
            tag.addEventListener('dragenter', handleDragEnter);
            tag.addEventListener('dragleave', handleDragLeave);
            tag.addEventListener('drop', handleDrop);
            tag.addEventListener('dragend', handleDragEnd);
        });
    }
}

// Variables para el arrastre
let dragSrcEl = null;

// Manejadores de eventos para HTML5 Drag and Drop
function handleDragStart(e) {
    this.style.opacity = '0.4';
    
    dragSrcEl = this;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Agregar clase para estilo visual
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // No hacer nada si se suelta sobre sí mismo
    if (dragSrcEl !== this) {
        // Obtener índices para reordenar el array de campos
        const allFields = Array.from(document.querySelectorAll('.field-tag'));
        const fromIndex = allFields.indexOf(dragSrcEl);
        const toIndex = allFields.indexOf(this);
        
        // Reordenar el array de campos
        const movedField = fields.splice(fromIndex, 1)[0];
        fields.splice(toIndex, 0, movedField);
        
        // Actualizar la interfaz
        updateActiveFields();
        updateClientForm();
        updateSearchFields();
        updateTable();
    }
    
    return false;
}

function handleDragEnd(e) {
    // Eliminar clases de estilo visual
    const fieldTags = document.querySelectorAll('.field-tag');
    fieldTags.forEach(tag => {
        tag.classList.remove('over', 'dragging');
        tag.style.opacity = '1';
    });
}

// Actualizar el orden de los campos basado en el DOM
function updateFieldsOrder() {
    const fieldTags = Array.from(document.querySelectorAll('.field-tag'));
    const newFields = [];
    
    fieldTags.forEach(tag => {
        // Extraer el nombre del campo del contenido del tag
        const fieldName = tag.textContent.trim().replace(' *', '').replace('close', '').trim();
        const field = fields.find(f => f.name === fieldName);
        if (field) {
            newFields.push(field);
        }
    });
    
    // Actualizar el array de campos con el nuevo orden
    fields = newFields;
    
    // Actualizar la interfaz
    updateClientForm();
    updateSearchFields();
    updateTable();
}


// Event listener para importar archivo
document.getElementById('fileInput').addEventListener('change', handleFileImport);

// Inicialización
updateSearchFields();
updateTable();
