<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, name FROM expense_types ORDER BY name");
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($types);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>