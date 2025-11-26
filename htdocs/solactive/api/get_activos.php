<?php
header('Content-Type: application/json');
require_once '../config.php';

$conn = getDBConnection();

$ticker = isset($_GET['ticker']) ? $_GET['ticker'] : null;
$region = isset($_GET['region']) ? $_GET['region'] : null;
$clase = isset($_GET['clase']) ? $_GET['clase'] : null;

$query = "SELECT * FROM activo WHERE 1=1";

if ($ticker) {
    $query .= " AND tickerUniversal LIKE '%" . $conn->real_escape_string($ticker) . "%'";
}

if ($region && $region != 'todas') {
    $query .= " AND regionActivo = '" . $conn->real_escape_string($region) . "'";
}

if ($clase && $clase != 'todas') {
    $query .= " AND claseActivo = '" . $conn->real_escape_string($clase) . "'";
}

$query .= " ORDER BY timestampRecepcion DESC LIMIT 50";

$result = $conn->query($query);
$activos = [];

while ($row = $result->fetch_assoc()) {
    $activos[] = $row;
}

echo json_encode($activos);
$conn->close();
?>