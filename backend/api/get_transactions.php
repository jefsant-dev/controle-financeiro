<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $stmt = $pdo->query(
        "SELECT t.id, t.type, t.description, t.amount, t.created_at, t.category_id, t.source_id, t.expense_type_id, "
        . "t.is_paid, t.due_date, t.is_recurring, t.recurrence_type, t.recurrence_end_date, t.is_fixed_amount, "
        . "t.penalty_formula, t.calculated_amount, t.notes, t.tags, "
        . "c.name AS category, s.name AS source, et.name AS expense_type "
        . "FROM transactions t "
        . "LEFT JOIN categories c ON t.category_id = c.id "
        . "LEFT JOIN sources s ON t.source_id = s.id "
        . "LEFT JOIN expense_types et ON t.expense_type_id = et.id "
        . "ORDER BY t.created_at DESC"
    );
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($transactions);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>