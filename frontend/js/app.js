document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();

    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', addTransaction);
});

async function addTransaction(event) {
    event.preventDefault();
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    const response = await fetch('backend/api/add_transaction.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, description, amount, category })
    });

    if (response.ok) {
        loadTransactions();
        form.reset();
    } else {
        alert('Erro ao adicionar transação');
    }
}

async function loadTransactions() {
    const response = await fetch('backend/api/get_transactions.php');
    const transactions = await response.json();
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.type}: ${transaction.description} - R$ ${transaction.amount} (${transaction.category})`;
        list.appendChild(li);
    });
}