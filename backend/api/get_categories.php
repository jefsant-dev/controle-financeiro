<?php
require_once '../config.php';

$stmt = $pdo->query("SELECT id, name, type FROM categories ORDER BY type, name");
$categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($categories);
?>