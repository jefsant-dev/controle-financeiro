let transactions = [];
let filteredTransactions = [];
let categories = [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await loadCategories();
    await loadTransactions();
    setDefaultDate();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function openAddModal(type) {
    document.getElementById('transaction-id').value = '';
    document.getElementById('type').value = type;
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    setDefaultDate();
    document.getElementById('modal-title').textContent = `Adicionar ${type === 'receita' ? 'Receita' : 'Despesa'}`;
    populateCategorySelect(type);
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id == id);
    if (transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('type').value = transaction.type;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        populateCategorySelect(transaction.type, transaction.category_id);
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
    const date = document.getElementById('date').value;

    if (!description || !amount || !category_id || !date) {
        alert('Preencha todos os campos!');
        return;
    }

    const data = { type, description, amount, category_id, date };

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
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function openCategoryModal() {
    document.getElementById('category-name').value = '';
    document.getElementById('category-type').value = 'despesa';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

async function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const type = document.getElementById('category-type').value;

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
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            await loadCategories();
            if (document.getElementById('transactionModal').classList.contains('show')) {
                populateCategorySelect(document.getElementById('type').value);
            }
        } else {
            alert('Erro ao salvar categoria');
        }
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        alert('Erro ao salvar categoria');
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

    row.innerHTML = `
        <td>${date}</td>
        <td>${transaction.description}</td>
        <td>${transaction.category}</td>
        <td>R$ ${parseFloat(transaction.amount).toFixed(2)}</td>
        <td>
            <button class="btn btn-sm btn-warning btn-action" onclick="editTransaction(${transaction.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="deleteTransaction(${transaction.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

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

function populateCategorySelect(type, selectedCategoryId = '') {
    const categorySelect = document.getElementById('category');
    const relevantCategories = categories.filter(c => c.type === type);
    categorySelect.innerHTML = relevantCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (selectedCategoryId) {
        categorySelect.value = selectedCategoryId;
    }
}

function applyFilters() {
    const query = document.getElementById('search-filter').value.trim().toLowerCase();
    const category = document.getElementById('category-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    filteredTransactions = transactions.filter(transaction => {
        const matchesQuery = query === '' || transaction.description.toLowerCase().includes(query) || transaction.category.toLowerCase().includes(query);
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
        ['Tipo', 'Data', 'Descrição', 'Categoria', 'Valor']
    ];

    filteredTransactions.forEach(transaction => {
        const date = transaction.created_at.split(' ')[0];
        rows.push([
            transaction.type,
            date,
            transaction.description,
            transaction.category,
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

function showConfiguracoes() {
    alert('Funcionalidade de Configurações em desenvolvimento');
}