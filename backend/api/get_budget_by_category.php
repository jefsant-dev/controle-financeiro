<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $type = $_GET['type'] ?? 'despesa';
    $month = $_GET['month'] ?? date('Y-m');
    
    $start = $month . '-01';
    $end = date('Y-m-t', strtotime($start));
    
    $stmt = $pdo->prepare(
        "SELECT c.name, c.id, COUNT(*) as count, "
        . "SUM(COALESCE(t.calculated_amount, t.amount)) as total "
        . "FROM transactions t "
        . "LEFT JOIN categories c ON t.category_id = c.id "
        . "WHERE t.type = ? AND DATE(t.created_at) BETWEEN ? AND ? "
        . "GROUP BY c.id, c.name ORDER BY total DESC"
    );
    $stmt->execute([$type, $start, $end]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $total = 0;
    foreach ($results as $row) {
        $total += (float)$row['total'];
    }
    
    $budget = [];
    foreach ($results as $row) {
        $percentage = $total > 0 ? (float)$row['total'] / $total * 100 : 0;
        $budget[] = [
            'category' => $row['name'],
            'id' => $row['id'],
            'amount' => round((float)$row['total'], 2),
            'transactions' => (int)$row['count'],
            'percentage' => round($percentage, 2)
        ];
    }
    
    echo json_encode([
        'period' => $month,
        'type' => $type,
        'total' => round($total, 2),
        'by_category' => $budget
    ]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>