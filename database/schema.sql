CREATE DATABASE IF NOT EXISTS controle_financeiro;

USE controle_financeiro;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('receita', 'despesa') NOT NULL DEFAULT 'despesa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_type (name, type)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('receita', 'despesa') NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

INSERT INTO categories (name, type) VALUES
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
