// ============================================
// EXTENSÃO DO APP: Recorrência, Penalidades e Análises
// ============================================

// Mostrar/esconder campos de recorrência no modal
document.addEventListener('DOMContentLoaded', () => {
    const isRecurringCheckbox = document.getElementById('is-recurring');
    const recurrenceFields = document.getElementById('recurrence-fields');
    
    if (isRecurringCheckbox) {
        isRecurringCheckbox.addEventListener('change', function() {
            if (this.checked) {
                recurrenceFields.classList.remove('d-none');
            } else {
                recurrenceFields.classList.add('d-none');
            }
        });
    }
});

// ============================================
// Extensão: SALVAR TRANSAÇÃO (com novos campos)
// ============================================
async function saveTransactionExtended() {
    const id = document.getElementById('transaction-id').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category_id = document.getElementById('category').value;
    const source_id = document.getElementById('source').value;
    const expense_type_id = document.getElementById('expense-type').value;
    const date = document.getElementById('date').value;
    const due_date = document.getElementById('due-date').value || null;
    const is_recurring = document.getElementById('is-recurring').checked;
    const recurrence_type = document.getElementById('recurrence-type').value;
    const recurrence_end_date = document.getElementById('recurrence-end-date').value || null;
    const is_fixed_amount = document.getElementById('is-fixed-amount').checked;
    const penalty_formula = document.getElementById('penalty-formula').value || null;
    const notes = document.getElementById('notes').value.trim();
    const tags = document.getElementById('tags').value.trim();

    if (!description || !amount || !category_id || !date) {
        alert('Preencha todos os campos obrigatórios!');
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

    const data = {
        type, description, amount, category_id, source_id, expense_type_id, date,
        due_date, is_recurring, recurrence_type, recurrence_end_date, is_fixed_amount, penalty_formula,
        notes, tags
    };

    try {
        let response;
        if (id) {
            response = await fetch(`backend/api/edit_transaction.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
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
            const error = await response.json();
            alert('Erro ao salvar: ' + (error.error || 'Desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar transação');
    }
}

// ============================================
// Extensão: EDITAR TRANSAÇÃO (com novos campos)
// ============================================
function editTransactionExtended(id) {
    const transaction = transactions.find(t => t.id == id);
    if (transaction) {
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('type').value = transaction.type;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('source').value = transaction.source_id || '';
        document.getElementById('expense-type').value = transaction.expense_type_id || '';
        document.getElementById('date').value = transaction.created_at.split(' ')[0];
        document.getElementById('due-date').value = transaction.due_date || '';
        document.getElementById('is-recurring').checked = !!transaction.is_recurring;
        document.getElementById('recurrence-type').value = transaction.recurrence_type || 'monthly';
        document.getElementById('recurrence-end-date').value = transaction.recurrence_end_date || '';
        document.getElementById('is-fixed-amount').checked = !!transaction.is_fixed_amount;
        document.getElementById('penalty-formula').value = transaction.penalty_formula || '';
        document.getElementById('notes').value = transaction.notes || '';
        document.getElementById('tags').value = transaction.tags || '';
        
        // Mostrar campos de recorrência se ativado
        const recurrenceFields = document.getElementById('recurrence-fields');
        if (transaction.is_recurring) {
            recurrenceFields.classList.remove('d-none');
        } else {
            recurrenceFields.classList.add('d-none');
        }
        
        populateCategorySelect(transaction.type, transaction.category_id);
        toggleTransactionFields(transaction.type);
        document.getElementById('modal-title').textContent = 'Editar Transação';
        new bootstrap.Modal(document.getElementById('transactionModal')).show();
    }
}

// ============================================
// MARCAR COMO PAGO/NÃO PAGO
// ============================================
async function togglePaymentStatus(transactionId, currentStatus) {
    try {
        const response = await fetch(`backend/api/update_transaction_status.php?id=${transactionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_paid: !currentStatus })
        });

        if (response.ok) {
            loadTransactions();
        } else {
            alert('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status');
    }
}

// ============================================
// DUPLICAR TRANSAÇÃO
// ============================================
async function duplicateTransaction(transactionId) {
    try {
        const response = await fetch(`backend/api/duplicate_transaction.php?id=${transactionId}`, {
            method: 'POST'
        });

        if (response.ok) {
            loadTransactions();
            alert('Transação duplicada com sucesso!');
        } else {
            alert('Erro ao duplicar transação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao duplicar transação');
    }
}

// ============================================
// CARREGAR FLUXO DE CAIXA PROJETADO
// ============================================
async function loadProjectedCashflow() {
    try {
        const response = await fetch('backend/api/get_projected_cashflow.php?months=6');
        const cashflow = await response.json();
        renderProjectedCashflow(cashflow);
    } catch (error) {
        console.error('Erro ao carregar fluxo de caixa:', error);
    }
}

function renderProjectedCashflow(cashflow) {
    const container = document.getElementById('projected-cashflow-container');
    if (!container) return;

    let html = '<div class="row">';
    for (const [month, data] of Object.entries(cashflow)) {
        const saldoClass = data.saldo >= 0 ? 'text-success' : 'text-danger';
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header bg-light">
                        <strong>${data.month}</strong>
                    </div>
                    <div class="card-body">
                        <div>Receitas: <span class="text-success">R$ ${data.receita.toFixed(2)}</span></div>
                        <div>Despesas: <span class="text-danger">R$ ${data.despesa.toFixed(2)}</span></div>
                        <hr>
                        <div class="fw-bold ${saldoClass}">Saldo: R$ ${data.saldo.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// CARREGAR ORÇAMENTO POR CATEGORIA
// ============================================
async function loadBudgetByCategory(type = 'despesa', month = null) {
    if (!month) {
        const today = new Date();
        month = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    }

    try {
        const response = await fetch(`backend/api/get_budget_by_category.php?type=${type}&month=${month}`);
        const budget = await response.json();
        renderBudgetByCategory(budget);
    } catch (error) {
        console.error('Erro ao carregar orçamento:', error);
    }
}

function renderBudgetByCategory(budget) {
    const container = document.getElementById('budget-by-category-container');
    if (!container) return;

    let html = `
        <div class="card">
            <div class="card-header bg-light">
                <strong>${budget.type === 'despesa' ? 'Despesas' : 'Receitas'} por Categoria - ${budget.period}</strong>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Transações</th>
                                <th>Valor</th>
                                <th>% do Total</th>
                                <th>Gráfico</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    for (const cat of budget.by_category) {
        html += `
            <tr>
                <td>${cat.category || 'Sem categoria'}</td>
                <td>${cat.transactions}</td>
                <td>R$ ${cat.amount.toFixed(2)}</td>
                <td>${cat.percentage.toFixed(1)}%</td>
                <td>
                    <div class="progress" style="width: 150px;">
                        <div class="progress-bar" style="width: ${cat.percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    }

    html += `
                        </tbody>
                    </table>
                </div>
                <hr>
                <div class="fw-bold">Total: R$ ${budget.total.toFixed(2)}</div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// ============================================
// GERAR TRANSAÇÕES RECORRENTES
// ============================================
async function generateRecurringTransactions() {
    try {
        const response = await fetch('backend/api/generate_recurring_transactions.php?months=6', {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.json();
            alert(`${result.transactions_generated} transações recorrentes geradas!`);
            loadTransactions();
        } else {
            alert('Erro ao gerar transações recorrentes');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao gerar transações recorrentes');
    }
}

// ============================================
// SOBRESCREVER saveTransaction ORIGINAL
// ============================================
// Renomeia a função original
const saveTransactionOriginal = saveTransaction;
// Substitui pela versão estendida
saveTransaction = saveTransactionExtended;

// Sobrescrever editTransaction original
const editTransactionOriginal = editTransaction;
editTransaction = editTransactionExtended;
