<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    if (!$conn) {
        throw new Exception("Error de conexión a la base de datos");
    }

    // Obtener estadísticas generales (EXISTENTE)
    $query = "
        SELECT 
            COUNT(CASE WHEN estadoValidacion LIKE '%Validated%' AND estadoValidacion NOT LIKE '%Semi%' THEN 1 END) AS total_validados,
            COUNT(CASE WHEN estadoValidacion LIKE '%Semi%' THEN 1 END) AS total_semi_validados,
            COUNT(CASE WHEN estadoValidacion LIKE '%Unvalidated%' OR estadoValidacion IS NULL OR estadoValidacion = '' THEN 1 END) AS total_no_validados,
            COUNT(*) AS total_activos
        FROM resultado
    ";

    $result = $conn->query($query);
    if (!$result) {
        throw new Exception("Error en consulta de estadísticas: " . $conn->error);
    }
    $stats = $result->fetch_assoc();

    // ========== NUEVO: DATOS DE VENDORS ==========
    $query_vendors = "
        SELECT 
            v.nombreVendor,
            COUNT(DISTINCT dr.idActivoFK) as total_activos,
            ROUND((COUNT(DISTINCT dr.idActivoFK) / (SELECT COUNT(*) FROM activo)) * 100, 1) as porcentaje,
            v.importanciaVendor
        FROM vendor v
        LEFT JOIN detalleRecepcion dr ON v.idVendor = dr.idVendorFK
        GROUP BY v.idVendor, v.nombreVendor, v.importanciaVendor
        ORDER BY v.importanciaVendor ASC
    ";

    $result_vendors = $conn->query($query_vendors);
    $vendors_data = [];
    if ($result_vendors) {
        while ($row = $result_vendors->fetch_assoc()) {
            $vendors_data[] = $row;
        }
    }
    // ========== FIN NUEVO ==========

    // Obtener actividad reciente (EXISTENTE)
    $query_recent = "
        SELECT 
            a.idActivo,
            a.tickerUniversal,
            a.precioActivo,
            a.divisaActivo,
            a.regionActivo,
            a.claseActivo,
            a.fechaNeg,
            a.timestampRecepcion,
            COALESCE(r.estadoValidacion, 'Sin validar') AS estado
        FROM activo a
        LEFT JOIN resultado r ON a.tickerUniversal = r.tickerResultado
        ORDER BY a.timestampRecepcion DESC
        LIMIT 20
    ";

    $result_recent = $conn->query($query_recent);
    if (!$result_recent) {
        throw new Exception("Error en consulta de actividad reciente: " . $conn->error);
    }
    
    $actividad = [];
    while ($row = $result_recent->fetch_assoc()) {
        $actividad[] = $row;
    }

    $response = [
        'success' => true,
        'stats' => $stats,
        'vendors' => $vendors_data,  // NUEVO DATO
        'actividad_reciente' => $actividad,
        'total_registros' => count($actividad)
    ];

    echo json_encode($response);

} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => $e->getMessage(),
        'stats' => [
            'total_validados' => 0,
            'total_semi_validados' => 0,
            'total_no_validados' => 0,
            'total_activos' => 0
        ],
        'vendors' => [],  // NUEVO: vendors vacío en caso de error
        'actividad_reciente' => []
    ];
    echo json_encode($response);
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>