<?php
require_once __DIR__ . "/../config.php";

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;

    if (!$id || !$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }

    $type = $data['type'];
    $description = $data['description'];
    $amount = $data['amount'];
    $category_id = $data['category_id'];
    $source_id = $data['source_id'] ?? null;
    $expense_type_id = $data['expense_type_id'] ?? null;
    $date = $data['date'] ?? date('Y-m-d');

    if ($source_id === '') {
        $source_id = null;
    }
    if ($expense_type_id === '') {
        $expense_type_id = null;
    }

    if (!in_array($type, ['receita', 'despesa']) || empty($description) || !is_numeric($amount) || empty($category_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        exit;
    }

    if ($type === 'receita' && empty($source_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Fonte é obrigatória para receita']);
        exit;
    }

    if ($type === 'despesa' && empty($expense_type_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de despesa é obrigatório']);
        exit;
    }

    $due_date = $data['due_date'] ?? null;
    $is_recurring = $data['is_recurring'] ?? false;
    $recurrence_type = $data['recurrence_type'] ?? 'monthly';
    $recurrence_end_date = $data['recurrence_end_date'] ?? null;
    $is_fixed_amount = $data['is_fixed_amount'] ?? true;
    $penalty_formula = $data['penalty_formula'] ?? null;
    $notes = trim($data['notes'] ?? '');
    $tags = trim($data['tags'] ?? '');

    $stmt = $pdo->prepare(
        "UPDATE transactions SET type = ?, description = ?, amount = ?, category_id = ?, source_id = ?, "
        . "expense_type_id = ?, created_at = ?, due_date = ?, is_recurring = ?, recurrence_type = ?, "
        . "recurrence_end_date = ?, is_fixed_amount = ?, penalty_formula = ?, notes = ?, tags = ? WHERE id = ?"
    );
    $stmt->execute([
        $type, $description, $amount, $category_id, $source_id, $expense_type_id, 
        $date . ' 00:00:00', $due_date, $is_recurring ? 1 : 0, $recurrence_type,
        $recurrence_end_date, $is_fixed_amount ? 1 : 0, $penalty_formula, $notes, $tags, $id
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>