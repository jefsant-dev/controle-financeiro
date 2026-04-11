<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID da transação obrigatório']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    $trans = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$trans) {
        http_response_code(404);
        echo json_encode(['error' => 'Transação não encontrada']);
        exit;
    }
    
    $insert = $pdo->prepare(
        "INSERT INTO transactions (type, description, amount, category_id, source_id, "
        . "expense_type_id, due_date, created_at, is_recurring, recurrence_type, "
        . "recurrence_end_date, is_fixed_amount, penalty_formula, is_paid) "
        . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $insert->execute([
        $trans['type'], $trans['description'], $trans['amount'], $trans['category_id'],
        $trans['source_id'], $trans['expense_type_id'], $trans['due_date'],
        date('Y-m-d H:i:s'), $trans['is_recurring'], $trans['recurrence_type'],
        $trans['recurrence_end_date'], $trans['is_fixed_amount'], 
        $trans['penalty_formula'], 0
    ]);
    
    $new_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'new_transaction_id' => $new_id,
        'original_id' => $id
    ]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>