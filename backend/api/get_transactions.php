<?php
require_once '../config.php';

$stmt = $pdo->query("SELECT * FROM transactions ORDER BY id DESC");
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($transactions);
?>