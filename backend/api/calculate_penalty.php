<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['transaction_id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'transaction_id obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT amount, due_date, penalty_formula, created_at FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    $trans = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$trans) {
        http_response_code(404);
        echo json_encode(['error' => 'Transação não encontrada']);
        exit;
    }

    if (!$trans['penalty_formula'] || !$trans['due_date']) {
        http_response_code(400);
        echo json_encode(['error' => 'Transação sem fórmula de multa ou data de vencimento']);
        exit;
    }

    $today = new DateTime();
    $due = new DateTime($trans['due_date']);
    $dias_atraso = max(0, $today->diff($due)->days);
    
    $original_amount = (float)$trans['amount'];
    $formula = trim($trans['penalty_formula']);
    $calculated_amount = $original_amount;

    // Avaliar fórmulas simples
    if (strpos($formula, 'dias_atraso') !== false) {
        $formula = str_replace('dias_atraso', $dias_atraso, $formula);
    }
    
    // Calcular: "0.02" (2%), "0.01 + 10" (1% + R$10), etc
    if (preg_match('/^([0-9.]+)$/', $formula, $m)) {
        // Percentual puro
        $calculated_amount = $original_amount * (1 + floatval($m[1]));
    } elseif (preg_match('/^([0-9.]+)\s*\+\s*([0-9.]+)$/', $formula, $m)) {
        // Percentual + valor fixo
        $calculated_amount = $original_amount * (1 + floatval($m[1])) + floatval($m[2]);
    } elseif (strpos($formula, '*') !== false || strpos($formula, '+') !== false) {
        // Fórmula complexa: evaluar com segurança
        $formula = preg_replace('/[^0-9.+*() ]/', '', $formula);
        @eval('$calculated_amount = $original_amount * (' . $formula . ');');
    }

    // Atualizar no banco
    $stmt_upd = $pdo->prepare("UPDATE transactions SET calculated_amount = ? WHERE id = ?");
    $stmt_upd->execute([$calculated_amount, $id]);

    echo json_encode([
        'original_amount' => $original_amount,
        'calculated_amount' => round($calculated_amount, 2),
        'dias_atraso' => $dias_atraso,
        'penalty_added' => round($calculated_amount - $original_amount, 2)
    ]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no servidor', 'details' => $ex->getMessage()]);
}
?>