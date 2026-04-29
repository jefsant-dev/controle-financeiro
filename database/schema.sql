CREATE DATABASE IF NOT EXISTS controle_financeiro;

USE controle_financeiro;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('receita', 'despesa') NOT NULL DEFAULT 'despesa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_type (name, type)
);

CREATE TABLE IF NOT EXISTS sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_source_name (name)
);

CREATE TABLE IF NOT EXISTS expense_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_expense_type_name (name)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('receita', 'despesa') NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    source_id INT NULL,
    expense_type_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_paid BOOLEAN DEFAULT FALSE,
    due_date DATE NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type ENUM('monthly', 'yearly') DEFAULT 'monthly',
    recurrence_end_date DATE NULL,
    is_fixed_amount BOOLEAN DEFAULT TRUE,
    penalty_formula VARCHAR(255) NULL,
    notes TEXT NULL,
    tags VARCHAR(255) NULL,
    calculated_amount DECIMAL(10, 2) NULL,
    CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaction_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
    CONSTRAINT fk_transaction_expense_type FOREIGN KEY (expense_type_id) REFERENCES expense_types(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_is_paid ON transactions(is_paid);
CREATE INDEX idx_transactions_recurrence_end_date ON transactions(recurrence_end_date);

CREATE TABLE IF NOT EXISTS transaction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_amount DECIMAL(10, 2) NULL,
    new_amount DECIMAL(10, 2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_history FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recurring_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recurring_template FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

INSERT IGNORE INTO categories (name, type) VALUES
    ('Salário', 'receita'),
    ('Freelance', 'receita'),
    ('Investimentos', 'receita'),
    ('Reembolso', 'receita'),
    ('Outros', 'receita'),
    ('Alimentação', 'despesa'),
    ('Transporte', 'despesa'),
    ('Moradia', 'despesa'),
    ('Saúde', 'despesa'),
    ('Lazer', 'despesa'),
    ('Educação', 'despesa'),
    ('Contas', 'despesa'),
    ('Compras', 'despesa'),
    ('Assinaturas', 'despesa'),
    ('Outros', 'despesa');

INSERT IGNORE INTO sources (name) VALUES
    ('Jefe'),
    ('Djully');

INSERT IGNORE INTO expense_types (name) VALUES
    ('Fixa'),
    ('Variável'),
    ('Eventual');
