<?php
require_once __DIR__ . "/../config.php";

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;

    if (!$id || !isset($data['is_paid'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID e is_paid obrigatórios']);
        exit;
    }

    $is_paid = (bool)$data['is_paid'];
    
    $stmt = $pdo->prepare("UPDATE transactions SET is_paid = ? WHERE id = ?");
    $stmt->execute([$is_paid, $id]);

    // Registrar no histórico
    $action = $is_paid ? 'marked_paid' : 'marked_unpaid';
    $stmt_hist = $pdo->prepare("INSERT INTO transaction_history (transaction_id, action) VALUES (?, ?)");
    $stmt_hist->execute([$id, $action]);

    echo json_encode(['success' => true]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>
