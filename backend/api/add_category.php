<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$name = trim($data['name'] ?? '');
$type = $data['type'] ?? '';

if (empty($name) || !in_array($type, ['receita', 'despesa'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
$stmt->execute([$name, $type]);

echo json_encode(['success' => true, 'category_id' => $pdo->lastInsertId()]);
?>