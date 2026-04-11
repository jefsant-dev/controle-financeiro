<?php
// Carregar variáveis de ambiente do arquivo .env
if (file_exists(__DIR__ . '/.env')) {
    $env = parse_ini_file(__DIR__ . '/.env');
    foreach ($env as $key => $value) {
        putenv("$key=$value");
    }
}

$dbname = getenv('DB_NAME');
$username = getenv('DB_USER');
$password = getenv('DB_SENHA');
$host_primary = getenv('DB_HOST01');
$host_secondary = getenv('DB_HOST02');

if (!$dbname || !$username || !$password || !$host_primary) {
    die("Erro: Variáveis de ambiente não configuradas. Configure o arquivo .env");
}

$pdo = null;

// Tenta conectar ao host primário, se falhar tenta o secundário
try {
    $pdo = new PDO("mysql:host=$host_primary;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    if ($host_secondary) {
        try {
            $pdo = new PDO("mysql:host=$host_secondary;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Erro na conexão: " . $e->getMessage());
        }
    } else {
        die("Erro na conexão: " . $e->getMessage());
    }
}
?>