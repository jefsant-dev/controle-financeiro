<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$type = $data['type'];
$description = $data['description'];
$amount = $data['amount'];
$category = $data['category'];
$date = $data['date'] ?? date('Y-m-d');

if (!in_array($type, ['receita', 'despesa']) || empty($description) || !is_numeric($amount) || empty($category)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO transactions (type, description, amount, category, created_at) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$type, $description, $amount, $category, $date . ' 00:00:00']);

echo json_encode(['success' => true]);
?>