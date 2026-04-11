<?php
require_once '../config.php';

$stmt = $pdo->query("SELECT * FROM transactions ORDER BY created_at DESC");
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($transactions);
?>