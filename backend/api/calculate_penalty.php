<?php
require_once __DIR__ . "/../config.php";
header('Content-Type: application/json');

function tokenizeExpression($expression) {
    preg_match_all('/\d+(?:\.\d+)?|[()+*]/', $expression, $matches);
    return $matches[0];
}

function evaluatePenaltyExpression($expression) {
    $tokens = tokenizeExpression($expression);
    if (!$tokens) {
        throw new InvalidArgumentException('Fórmula inválida');
    }

    $output = [];
    $operators = [];
    $precedence = ['+' => 1, '*' => 2];

    foreach ($tokens as $token) {
        if (is_numeric($token)) {
            $output[] = (float)$token;
            continue;
        }

        if ($token === '(') {
            $operators[] = $token;
            continue;
        }

        if ($token === ')') {
            while ($operators && end($operators) !== '(') {
                $output[] = array_pop($operators);
            }

            if (!$operators || array_pop($operators) !== '(') {
                throw new InvalidArgumentException('Parênteses inválidos na fórmula');
            }
            continue;
        }

        while (
            $operators &&
            end($operators) !== '(' &&
            $precedence[end($operators)] >= $precedence[$token]
        ) {
            $output[] = array_pop($operators);
        }

        $operators[] = $token;
    }

    while ($operators) {
        $operator = array_pop($operators);
        if ($operator === '(' || $operator === ')') {
            throw new InvalidArgumentException('Parênteses inválidos na fórmula');
        }
        $output[] = $operator;
    }

    $stack = [];
    foreach ($output as $token) {
        if (is_float($token) || is_int($token)) {
            $stack[] = (float)$token;
            continue;
        }

        if (count($stack) < 2) {
            throw new InvalidArgumentException('Fórmula inválida');
        }

        $right = array_pop($stack);
        $left = array_pop($stack);

        if ($token === '+') {
            $stack[] = $left + $right;
        } elseif ($token === '*') {
            $stack[] = $left * $right;
        } else {
            throw new InvalidArgumentException('Operador inválido na fórmula');
        }
    }

    if (count($stack) !== 1) {
        throw new InvalidArgumentException('Fórmula inválida');
    }

    return (float)$stack[0];
}

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
    $dias_atraso = $today > $due ? (int)$due->diff($today)->days : 0;
    
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
    } elseif (preg_match('/^[0-9.+*() ]+$/', $formula)) {
        // Fórmula composta, avaliada sem executar código.
        $calculated_amount = $original_amount * evaluatePenaltyExpression($formula);
    } else {
        throw new InvalidArgumentException('Fórmula de multa inválida');
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
