<?php
header('Content-Type: application/json');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    // Contar activos
    $result = $conn->query("SELECT COUNT(*) as total FROM activo");
    $activos = $result->fetch_assoc();
    
    // Contar resultados
    $result = $conn->query("SELECT COUNT(*) as total FROM resultado");
    $resultados = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa',
        'activos_en_bd' => $activos['total'],
        'resultados_en_bd' => $resultados['total'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
