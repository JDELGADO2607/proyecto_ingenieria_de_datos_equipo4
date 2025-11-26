<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    // Verificar si la vista existe
    $checkView = $conn->query("SHOW TABLES LIKE 'vistaMonitoreoInconsistencias'");
    if ($checkView->num_rows == 0) {
        // Si la vista no existe, crear una consulta alternativa
        $query = "
            SELECT 
                a.tickerUniversal as Ticker,
                COALESCE(r.estadoValidacion, 'Sin validar') as Estado,
                a.fechaNeg as Fecha,
                CASE 
                    WHEN r.estadoValidacion IS NULL THEN 'CRITICO'
                    WHEN r.estadoValidacion LIKE '%Semi%' THEN 'MEDIO' 
                    WHEN r.estadoValidacion LIKE '%Unvalidated%' THEN 'ALTO'
                    ELSE 'BAJO'
                END as Nivel,
                CONCAT('Activo ', a.tickerUniversal, ' requiere atención') as Descripcion
            FROM activo a
            LEFT JOIN resultado r ON a.idActivo = r.idActivoFK
            WHERE r.estadoValidacion IS NULL 
               OR r.estadoValidacion LIKE '%Semi%'
               OR r.estadoValidacion LIKE '%Unvalidated%'
            ORDER BY a.timestampRecepcion DESC
            LIMIT 20
        ";
    } else {
        // Usar la vista si existe
        $query = "SELECT * FROM vistaMonitoreoInconsistencias LIMIT 20";
    }
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }
    
    $inconsistencias = [];
    while ($row = $result->fetch_assoc()) {
        $inconsistencias[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $inconsistencias,
        'total' => count($inconsistencias),
        'query_used' => $query
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => true,
        'message' => $e->getMessage(),
        'data' => []
    ]);
}
?>