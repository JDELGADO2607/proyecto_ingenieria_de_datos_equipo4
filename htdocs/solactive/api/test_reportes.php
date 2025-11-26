<?php
header('Content-Type: application/json');
require_once '../config.php';

$conn = getDBConnection();

// Contar datos en cada tabla
$queries = [
    'activos' => "SELECT COUNT(*) as total FROM activo",
    'resultados' => "SELECT COUNT(*) as total FROM resultado",
    'validaciones_distintas' => "SELECT COUNT(DISTINCT estadoValidacion) as total FROM resultado",
    'regiones_distintas' => "SELECT COUNT(DISTINCT regionActivo) as total FROM activo"
];

$resultados = [];
foreach ($queries as $key => $query) {
    $result = $conn->query($query);
    $resultados[$key] = $result->fetch_assoc()['total'];
}

echo json_encode([
    'success' => true,
    'datos' => $resultados,
    'timestamp' => date('Y-m-d H:i:s')
]);

$conn->close();
?>