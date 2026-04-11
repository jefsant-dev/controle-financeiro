<?php
require_once '../config.php';

parse_str(file_get_contents("php://input"), $putData);
$id = $_GET['id'] ?? null;

if (!$id || !$putData) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$type = $putData['type'];
$description = $putData['description'];
$amount = $putData['amount'];
$category_id = $putData['category_id'];
$date = $putData['date'] ?? date('Y-m-d');

if (!in_array($type, ['receita', 'despesa']) || empty($description) || !is_numeric($amount) || empty($category_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$stmt = $pdo->prepare("UPDATE transactions SET type = ?, description = ?, amount = ?, category_id = ?, created_at = ? WHERE id = ?");
$stmt->execute([$type, $description, $amount, $category_id, $date . ' 00:00:00', $id]);

echo json_encode(['success' => true]);
?>