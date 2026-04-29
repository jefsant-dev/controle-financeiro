let transactions = [];
let filteredTransactions = [];
let categories = [];
let sources = [];
let expenseTypes = [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await loadCategories();
    await loadSources();
    await loadExpenseTypes();
    await loadTransactions();
    setDefaultDate();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function toggleTransactionFields(type) {
    const sourceGroup = document.getElementById('source-group');
    const expenseTypeGroup = document.getElementById('expense-type-group');
    const sourceSelect = document.getElementById('source');
    const expenseTypeSelect = document.getElementById('expense-type');

    if (type === 'receita') {
        sourceGroup.classList.remove('d-none');
        expenseTypeGroup.classList.add('d-none');
        sourceSelect.required = true;
        expenseTypeSelect.required = false;
    } else {
        sourceGroup.classList.add('d-none');
        expenseTypeGroup.classList.remove('d-none');
        sourceSelect.required = false;
        expenseTypeSelect.required = true;
    }
}

function openAddModal(type) {
    document.getElementById('transaction-id').value = '';
    document.getElementById('type').value = type;
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('source').value = '';
    document.getElementById('expense-type').value = '';
    document.getElementById('due-date').value = '';
    document.getElementById('is-recurring').checked = false;
    document.getElementById('recurrence-type').value = 'monthly';
    document.getElementById('recurrence-end-date').value = '';
    document.getElementById('is-fixed-amount').checked = true;
    document.getElementById('penalty-formula').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('tags').value = '';
    setDefaultDate();
    document.getElementById('modal-title').textContent = `Adicionar ${type === 'receita' ? 'Receita' : 'Despesa'}`;
    populateCategorySelect(type);
    toggleTransactionFields(type);
    document.getElementById('recurrence-fields').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id == id);
    if (transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('type').value = transaction.type;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('source').value = transaction.source_id || '';
        document.getElementById('expense-type').value = transaction.expense_type_id || '';
        populateCategorySelect(transaction.type, transaction.category_id);
        toggleTransactionFields(transaction.type);
        document.getElementById('date').value = transaction.created_at.split(' ')[0];
        document.getElementById('modal-title').textContent = 'Editar Transação';
        new bootstrap.Modal(document.getElementById('transactionModal')).show();
    }
}

async function saveTransaction() {
    const id = document.getElementById('transaction-id').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category_id = document.getElementById('category').value;
    const source_id = document.getElementById('source').value;
    const expense_type_id = document.getElementById('expense-type').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !category_id || !date) {
        alert('Preencha todos os campos!');
        return;
    }

    if (type === 'receita' && !source_id) {
        alert('Selecione a fonte da receita.');
        return;
    }

    if (type === 'despesa' && !expense_type_id) {
        alert('Selecione o tipo de despesa.');
        return;
    }

    const data = { type, description, amount, category_id, source_id, expense_type_id, date };

    try {
        let response;
        if (id) {
            // Editar
            response = await fetch(`backend/api/edit_transaction.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Adicionar
            response = await fetch('backend/api/add_transaction.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
            loadTransactions();
        } else {
            alert('Erro ao salvar transação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar transação');
    }
}

async function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        try {
            const response = await fetch(`backend/api/delete_transaction.php?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadTransactions();
            } else {
                alert('Erro ao excluir transação');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir transação');
        }
    }
}

async function loadTransactions() {
    try {
        const response = await fetch('backend/api/get_transactions.php');
        transactions = await response.json();
        filteredTransactions = [...transactions];
        renderCategoryFilterOptions();
        renderTables();
        updateCards();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('backend/api/get_categories.php');
        categories = await response.json();
        renderCategoryFilterOptions();
        renderCategoryList();
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function loadSources() {
    try {
        const response = await fetch('backend/api/get_sources.php');
        sources = await response.json();
        renderSourceList();
        populateSourceSelect();
    } catch (error) {
        console.error('Erro ao carregar fontes:', error);
    }
}

async function loadExpenseTypes() {
    try {
        const response = await fetch('backend/api/get_expense_types.php');
        expenseTypes = await response.json();
        renderExpenseTypeList();
        populateExpenseTypeSelect();
    } catch (error) {
        console.error('Erro ao carregar tipos de despesa:', error);
    }
}

function showConfiguracoes() {
    document.getElementById('mainContent').classList.add('d-none');
    document.getElementById('configSection').classList.remove('d-none');
}

function showDashboard() {
    document.getElementById('configSection').classList.add('d-none');
    document.getElementById('mainContent').classList.remove('d-none');
}

async function saveCategory() {
    const name = document.getElementById('new-category-name').value.trim();
    const type = document.getElementById('new-category-type').value;

    if (!name) {
        alert('Digite o nome da categoria');
        return;
    }

    try {
        const response = await fetch('backend/api/add_category.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type })
        });

        if (response.ok) {
            await loadCategories();
            if (!document.getElementById('configSection').classList.contains('d-none')) {
                renderCategoryList();
            }
            if (document.querySelector('#transactionModal.show')) {
                populateCategorySelect(document.getElementById('type').value);
            }
            document.getElementById('new-category-name').value = '';
        } else {
            alert('Erro ao salvar categoria');
        }
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        alert('Erro ao salvar categoria');
    }
}

function populateSourceSelect(selectedSourceId = '') {
    const sourceSelect = document.getElementById('source');
    sourceSelect.innerHTML = sources.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (selectedSourceId) {
        sourceSelect.value = selectedSourceId;
    }
}

function populateExpenseTypeSelect(selectedExpenseTypeId = '') {
    const expenseTypeSelect = document.getElementById('expense-type');
    expenseTypeSelect.innerHTML = expenseTypes.map(et => `<option value="${et.id}">${et.name}</option>`).join('');
    if (selectedExpenseTypeId) {
        expenseTypeSelect.value = selectedExpenseTypeId;
    }
}

async function saveSource() {
    const name = document.getElementById('new-source-name').value.trim();

    if (!name) {
        alert('Digite o nome da fonte');
        return;
    }

    try {
        const response = await fetch('backend/api/add_source.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            document.getElementById('new-source-name').value = '';
            await loadSources();
            populateSourceSelect();
        } else {
            alert('Erro ao salvar fonte');
        }
    } catch (error) {
        console.error('Erro ao salvar fonte:', error);
        alert('Erro ao salvar fonte');
    }
}

async function saveExpenseType() {
    const name = document.getElementById('new-expense-type-name').value.trim();

    if (!name) {
        alert('Digite o nome do tipo de despesa');
        return;
    }

    try {
        const response = await fetch('backend/api/add_expense_type.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            document.getElementById('new-expense-type-name').value = '';
            await loadExpenseTypes();
            populateExpenseTypeSelect();
        } else {
            alert('Erro ao salvar tipo de despesa');
        }
    } catch (error) {
        console.error('Erro ao salvar tipo de despesa:', error);
        alert('Erro ao salvar tipo de despesa');
    }
}

function renderTables() {
    const receitasTable = document.querySelector('#receitas-table tbody');
    const despesasTable = document.querySelector('#despesas-table tbody');

    receitasTable.innerHTML = '';
    despesasTable.innerHTML = '';

    filteredTransactions.forEach(transaction => {
        const row = createTableRow(transaction);
        if (transaction.type === 'receita') {
            receitasTable.appendChild(row);
        } else {
            despesasTable.appendChild(row);
        }
    });
}

function createTableRow(transaction) {
    const row = document.createElement('tr');
    const date = new Date(transaction.created_at).toLocaleDateString('pt-BR');
    const paidBadge = transaction.is_paid ? '<span class="badge bg-success">Pago</span>' : '<span class="badge bg-warning">Aberto</span>';
    const recurringBadge = transaction.is_recurring ? '<span class="badge bg-info">Recorrente</span>' : '';
    const displayAmount = transaction.calculated_amount || transaction.amount;

    if (transaction.type === 'receita') {
        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.notes || '-'}</td>
            <td>${transaction.tags || '-'}</td>
            <td>${transaction.category}</td>
            <td>${transaction.source || '-'}</td>
            <td>R$ ${parseFloat(displayAmount).toFixed(2)}</td>
            <td>
                <div class="d-flex flex-column gap-1">
                    <span>${paidBadge} ${recurringBadge}</span>
                    <div>
                        <button class="btn btn-sm btn-info btn-action" title="Marcar como ${transaction.is_paid ? 'não ' : ''}pago" onclick="togglePaymentStatus(${transaction.id}, ${transaction.is_paid ? 1 : 0})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-primary btn-action" title="Duplicar" onclick="duplicateTransaction(${transaction.id})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-warning btn-action" onclick="editTransaction(${transaction.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-action" onclick="deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </td>
        `;
    } else {
        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.notes || '-'}</td>
            <td>${transaction.tags || '-'}</td>
            <td>${transaction.category}</td>
            <td>${transaction.expense_type || '-'}</td>
            <td>R$ ${parseFloat(displayAmount).toFixed(2)}</td>
            <td>
                <div class="d-flex flex-column gap-1">
                    <span>${paidBadge} ${recurringBadge}</span>
                    <div>
                        <button class="btn btn-sm btn-info btn-action" title="Marcar como ${transaction.is_paid ? 'não ' : ''}pago" onclick="togglePaymentStatus(${transaction.id}, ${transaction.is_paid ? 1 : 0})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-primary btn-action" title="Duplicar" onclick="duplicateTransaction(${transaction.id})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-warning btn-action" onclick="editTransaction(${transaction.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-action" onclick="deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </td>
        `;
    }

    return row;
}

function updateCards() {
    const receitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const despesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const saldo = receitas - despesas;

    // Este mês (simplificado - apenas soma total por enquanto)
    const mesAtual = saldo;

    document.getElementById('total-receitas').textContent = `R$ ${receitas.toFixed(2)}`;
    document.getElementById('total-despesas').textContent = `R$ ${despesas.toFixed(2)}`;
    document.getElementById('saldo').textContent = `R$ ${saldo.toFixed(2)}`;
    document.getElementById('mes-atual').textContent = `R$ ${mesAtual.toFixed(2)}`;
}

function renderCategoryFilterOptions() {
    const categorySelect = document.getElementById('category-filter');
    categorySelect.innerHTML = '<option value="">Todas</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderCategoryList() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = categories.map(c => `<li class="list-group-item">${c.name} <span class="badge bg-secondary">${c.type}</span></li>`).join('');
}

function renderSourceList() {
    const sourceList = document.getElementById('source-list');
    sourceList.innerHTML = sources.map(s => `<li class="list-group-item">${s.name}</li>`).join('');
}

function renderExpenseTypeList() {
    const expenseTypeList = document.getElementById('expense-type-list');
    expenseTypeList.innerHTML = expenseTypes.map(et => `<li class="list-group-item">${et.name}</li>`).join('');
}

function populateCategorySelect(type, selectedCategoryId = '') {
    const categorySelect = document.getElementById('category');
    const relevantCategories = categories.filter(c => c.type === type);
    categorySelect.innerHTML = relevantCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (selectedCategoryId) {
        categorySelect.value = selectedCategoryId;
    }
    toggleTransactionFields(type);
}

function applyFilters() {
    const query = document.getElementById('search-filter').value.trim().toLowerCase();
    const category = document.getElementById('category-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    filteredTransactions = transactions.filter(transaction => {
        const matchesQuery = query === '' || transaction.description.toLowerCase().includes(query) || transaction.category.toLowerCase().includes(query) || (transaction.source || '').toLowerCase().includes(query) || (transaction.expense_type || '').toLowerCase().includes(query) || (transaction.tags || '').toLowerCase().includes(query) || (transaction.notes || '').toLowerCase().includes(query);
        const matchesCategory = !category || String(transaction.category_id) === category;

        const transactionDate = transaction.created_at.split(' ')[0];
        const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
        const matchesDateTo = !dateTo || transactionDate <= dateTo;

        return matchesQuery && matchesCategory && matchesDateFrom && matchesDateTo;
    });

    renderTables();
}

function clearFilters() {
    document.getElementById('search-filter').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    filteredTransactions = [...transactions];
    renderTables();
}

function exportCsv() {
    const rows = [
        ['Tipo', 'Data', 'Descrição', 'Categoria', 'Fonte/Tipo de Despesa', 'Valor']
    ];

    filteredTransactions.forEach(transaction => {
        const date = transaction.created_at.split(' ')[0];
        const extra = transaction.type === 'receita' ? (transaction.source || '') : (transaction.expense_type || '');
        rows.push([
            transaction.type,
            date,
            transaction.description,
            transaction.category,
            extra,
            parseFloat(transaction.amount).toFixed(2)
        ]);
    });

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'controle_financeiro.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Funções do menu (placeholders)
function showRelatorios() {
    alert('Funcionalidade de Relatórios em desenvolvimento');
}

function showGraficos() {
    alert('Funcionalidade de Gráficos em desenvolvimento');
}
