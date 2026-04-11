<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $months = $_GET['months'] ?? 6;
    $months = min((int)$months, 12);
    
    $today = new DateTime();
    $today->setDate($today->format('Y'), $today->format('m'), 1);
    
    $cashflow = [];
    
    for ($i = 0; $i < $months; $i++) {
        $period = clone $today;
        $period->modify("+{$i} month");
        $month_key = $period->format('Y-m');
        
        $start = $period->format('Y-m-01');
        $end = $period->format('Y-m-t');
        
        $stmt = $pdo->prepare(
            "SELECT type, SUM(COALESCE(calculated_amount, amount)) as total FROM transactions "
            . "WHERE DATE(created_at) BETWEEN ? AND ? "
            . "AND (is_paid = 0 OR is_paid = 1) GROUP BY type"
        );
        $stmt->execute([$start, $end]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $receita = 0;
        $despesa = 0;
        
        foreach ($results as $row) {
            if ($row['type'] === 'receita') {
                $receita = (float)$row['total'];
            } else {
                $despesa = (float)$row['total'];
            }
        }
        
        $cashflow[$month_key] = [
            'month' => $period->format('M/Y'),
            'receita' => round($receita, 2),
            'despesa' => round($despesa, 2),
            'saldo' => round($receita - $despesa, 2)
        ];
    }
    
    echo json_encode($cashflow);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>