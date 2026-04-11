USE controle_financeiro;

-- Adiciona campos de status de pagamento e recorrência na tabela transactions
ALTER TABLE transactions
    ADD COLUMN is_paid BOOLEAN DEFAULT FALSE AFTER created_at,
    ADD COLUMN due_date DATE NULL AFTER is_paid,
    ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE AFTER due_date,
    ADD COLUMN recurrence_type ENUM('monthly', 'yearly') DEFAULT 'monthly' AFTER is_recurring,
    ADD COLUMN recurrence_end_date DATE NULL AFTER recurrence_type,
    ADD COLUMN is_fixed_amount BOOLEAN DEFAULT TRUE AFTER recurrence_end_date,
    ADD COLUMN penalty_formula VARCHAR(255) NULL AFTER is_fixed_amount,
    ADD COLUMN calculated_amount DECIMAL(10, 2) NULL AFTER penalty_formula;

-- Exemplo de formulas de multa/juros:
-- "0.02" = 2% sobre valor original
-- "0.01 + 10" = 1% sobre valor original + R$10 fixo
-- "0.005 * dias_atraso" = 0.5% ao dia de atraso

-- Cria índices para melhor performance nas consultas de recorrência
CREATE INDEX idx_is_recurring ON transactions(is_recurring);
CREATE INDEX idx_due_date ON transactions(due_date);
CREATE INDEX idx_is_paid ON transactions(is_paid);
CREATE INDEX idx_recurrence_end_date ON transactions(recurrence_end_date);

-- Tabela para rastrear histórico de mudanças de status de pagamento e recálculos
CREATE TABLE IF NOT EXISTS transaction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'marked_paid', 'marked_unpaid', 'penalty_applied', 'recurrence_generated'
    old_amount DECIMAL(10, 2) NULL,
    new_amount DECIMAL(10, 2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_history FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Tabela para armazenar templates de transações recorrentes para referência
CREATE TABLE IF NOT EXISTS recurring_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recurring_template FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
