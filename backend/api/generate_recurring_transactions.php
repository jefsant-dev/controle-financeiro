<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $months = $_GET['months'] ?? 3;
    $months = min((int)$months, 12);
    
    $stmt = $pdo->prepare(
        "SELECT * FROM transactions WHERE is_recurring = 1 AND "
        . "(recurrence_end_date IS NULL OR recurrence_end_date > CURDATE()) "
        . "ORDER BY created_at ASC"
    );
    $stmt->execute();
    $recurring = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $generated = 0;
    $today = new DateTime();
    
    foreach ($recurring as $t) {
        for ($i = 1; $i <= $months; $i++) {
            $next_date = clone $today;
            if ($t['recurrence_type'] === 'monthly') {
                $next_date->modify("+{$i} month");
            } else {
                $next_date->modify("+{$i} year");
            }
            
            // Verificar se já existe transação para esse período
            $check = $pdo->prepare(
                "SELECT id FROM transactions WHERE "
                . "category_id = ? AND type = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ? "
                . "AND is_recurring = 1 LIMIT 1"
            );
            $check->execute([$t['category_id'], $t['type'], $next_date->format('m'), $next_date->format('Y')]);
            
            if (!$check->fetch()) {
                // Criar nova transação recorrente
                $new_amount = $t['is_fixed_amount'] ? $t['amount'] : null;
                $insert = $pdo->prepare(
                    "INSERT INTO transactions (type, description, amount, category_id, source_id, "
                    . "expense_type_id, due_date, created_at, is_recurring, recurrence_type, "
                    . "recurrence_end_date, is_fixed_amount, penalty_formula, is_paid) "
                    . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $insert->execute([
                    $t['type'], $t['description'], $new_amount, $t['category_id'], 
                    $t['source_id'], $t['expense_type_id'], $next_date->format('Y-m-d'),
                    $next_date->format('Y-m-d 00:00:00'), 1, $t['recurrence_type'],
                    $t['recurrence_end_date'], $t['is_fixed_amount'], 
                    $t['penalty_formula'], 0
                ]);
                $generated++;
            }
        }
    }
    
    echo json_encode(['success' => true, 'transactions_generated' => $generated]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>