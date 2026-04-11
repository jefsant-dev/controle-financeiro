USE controle_financeiro;

-- Cria tabela de fontes para receitas
CREATE TABLE IF NOT EXISTS sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_source_name (name)
);

-- Cria tabela de tipos de despesa
CREATE TABLE IF NOT EXISTS expense_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_expense_type_name (name)
);

-- Adiciona colunas source_id e expense_type_id em transações
ALTER TABLE transactions
    ADD COLUMN source_id INT NULL AFTER category_id,
    ADD COLUMN expense_type_id INT NULL AFTER source_id;

-- Cria fontes padrão
INSERT IGNORE INTO sources (name) VALUES
    ('Jefe'),
    ('Djully');

-- Cria tipos de despesa padrão
INSERT IGNORE INTO expense_types (name) VALUES
    ('Fixa'),
    ('Variável'),
    ('Eventual');

-- Adiciona restrições de chave estrangeira
ALTER TABLE transactions
    ADD CONSTRAINT fk_transaction_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_transaction_expense_type FOREIGN KEY (expense_type_id) REFERENCES expense_types(id) ON DELETE SET NULL;
