<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    // Consulta usando los nombres correctos de columnas
    $query = "
        SELECT 
            v.idVendor,
            v.nombreVendor,
            v.emailSoporte as emailVendor,
            v.importanciaVendor,
            COUNT(DISTINCT dr.idActivoFK) as total_activos
        FROM vendor v
        LEFT JOIN detalleRecepcion dr ON v.idVendor = dr.idVendorFK
        GROUP BY v.idVendor, v.nombreVendor, v.emailSoporte, v.importanciaVendor
        ORDER BY v.importanciaVendor ASC
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }
    
    $vendors = [];
    
    while ($row = $result->fetch_assoc()) {
        $vendors[] = $row;
    }
    
    echo json_encode($vendors);
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
