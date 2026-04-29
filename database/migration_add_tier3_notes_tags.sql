USE controle_financeiro;

ALTER TABLE transactions
    ADD COLUMN notes TEXT NULL AFTER penalty_formula,
    ADD COLUMN tags VARCHAR(255) NULL AFTER notes;
