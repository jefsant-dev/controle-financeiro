let transactions = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setDefaultDate();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function openAddModal(type) {
    document.getElementById('transaction-id').value = '';
    document.getElementById('type').value = type;
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    setDefaultDate();
    document.getElementById('modal-title').textContent = `Adicionar ${type === 'receita' ? 'Receita' : 'Despesa'}`;
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id == id);
    if (transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('type').value = transaction.type;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('category').value = transaction.category;
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
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !category || !date) {
        alert('Preencha todos os campos!');
        return;
    }

    const data = { type, description, amount, category, date };

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
        renderTables();
        updateCards();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

function renderTables() {
    const receitasTable = document.querySelector('#receitas-table tbody');
    const despesasTable = document.querySelector('#despesas-table tbody');

    receitasTable.innerHTML = '';
    despesasTable.innerHTML = '';

    transactions.forEach(transaction => {
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