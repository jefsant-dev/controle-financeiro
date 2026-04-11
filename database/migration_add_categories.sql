USE controle_financeiro;

-- Cria tabela de categorias caso ainda não exista
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('receita', 'despesa') NOT NULL DEFAULT 'despesa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_category_type (name, type)
);

-- Insere categorias padrão comuns
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

-- Adiciona coluna category_id na tabela de transações
ALTER TABLE transactions
    ADD COLUMN category_id INT NULL AFTER amount;

-- Mapeia categorias existentes para a nova tabela de categorias
UPDATE transactions t
JOIN categories c ON LOWER(TRIM(t.category)) = LOWER(TRIM(c.name)) AND t.type = c.type
SET t.category_id = c.id;

-- Usa categoria Outros caso a correspondência original não exista
UPDATE transactions t
JOIN categories c ON c.name = 'Outros' AND c.type = t.type
SET t.category_id = c.id
WHERE t.category_id IS NULL;

-- Torna category_id obrigatório e remove coluna antiga
ALTER TABLE transactions
    MODIFY category_id INT NOT NULL,
    DROP COLUMN category;

-- Adiciona chave estrangeira para categoria
ALTER TABLE transactions
    ADD CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
