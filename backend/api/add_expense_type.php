<?php
require_once __DIR__ . "/../config.php";

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$name = trim($data['name'] ?? '');

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO expense_types (name) VALUES (?)");
$stmt->execute([$name]);

echo json_encode(['success' => true, 'expense_type_id' => $pdo->lastInsertId()]);
?>