<?php
$dbname = 'u986889441_financeiro';
$username = 'u986889441_master';
$password = 'J3f*784512';
$host_primary = 'localhost';
$host_secondary = 'srv886.hstgr.io';

$pdo = null;

// Tenta conectar ao host primário, se falhar tenta o secundário
try {
    $pdo = new PDO("mysql:host=$host_primary;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    try {
        $pdo = new PDO("mysql:host=$host_secondary;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        die("Erro na conexão: " . $e->getMessage());
    }
}
?>