<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    // 1. Resumen de Validaciones (CORREGIDO)
    $queryValidaciones = "
        SELECT 
            COALESCE(r.estadoValidacion, 'Sin Validar') as estadoValidacion,
            COUNT(DISTINCT a.idActivo) as cantidad,
            GROUP_CONCAT(DISTINCT a.tickerUniversal ORDER BY a.tickerUniversal SEPARATOR ', ') as tickers
        FROM activo a
        LEFT JOIN resultado r ON a.idActivo = r.idActivoFK
        GROUP BY COALESCE(r.estadoValidacion, 'Sin Validar')
        ORDER BY 
            CASE 
                WHEN COALESCE(r.estadoValidacion, 'Sin Validar') LIKE '%Validated%' AND COALESCE(r.estadoValidacion, 'Sin Validar') NOT LIKE '%Semi%' THEN 1
                WHEN COALESCE(r.estadoValidacion, 'Sin Validar') LIKE '%Semi%' THEN 2
                WHEN COALESCE(r.estadoValidacion, 'Sin Validar') = 'Sin Validar' THEN 3
                ELSE 4
            END
    ";
    
    $resultValidaciones = $conn->query($queryValidaciones);
    $validaciones = [];
    $totalActivos = 0;
    
    while ($row = $resultValidaciones->fetch_assoc()) {
        $totalActivos += $row['cantidad'];
        
        // Limitar tickers mostrados
        $tickersList = $row['tickers'];
        if (strlen($tickersList) > 100) {
            $tickers = explode(', ', $tickersList);
            $tickersList = implode(', ', array_slice($tickers, 0, 8)) . '...';
        }
        
        $validaciones[] = [
            'estado' => $row['estadoValidacion'],
            'cantidad' => $row['cantidad'],
            'porcentaje' => 0, // Se calcula después
            'tickers' => $tickersList
        ];
    }
    
    // Calcular porcentajes
    foreach ($validaciones as &$val) {
        $val['porcentaje'] = $totalActivos > 0 ? round(($val['cantidad'] / $totalActivos) * 100, 1) : 0;
    }
    
    // 2. Activos por Región (CORREGIDO)
    $queryRegiones = "
        SELECT 
            a.regionActivo as region,
            COUNT(DISTINCT a.idActivo) as total,
            COUNT(DISTINCT CASE WHEN r.estadoValidacion LIKE '%Validated%' AND r.estadoValidacion NOT LIKE '%Semi%' THEN a.idActivo END) as validados,
            COUNT(DISTINCT CASE WHEN r.estadoValidacion IS NULL OR r.estadoValidacion LIKE '%Semi%' OR r.estadoValidacion LIKE '%Unvalidated%' THEN a.idActivo END) as pendientes
        FROM activo a
        LEFT JOIN resultado r ON a.idActivo = r.idActivoFK
        GROUP BY a.regionActivo
        ORDER BY total DESC
    ";
    
    $resultRegiones = $conn->query($queryRegiones);
    $regiones = [];
    
    while ($row = $resultRegiones->fetch_assoc()) {
        $porcentajeValidados = $row['total'] > 0 ? round(($row['validados'] / $row['total']) * 100, 1) : 0;
        $regiones[] = [
            'region' => $row['region'],
            'total' => $row['total'],
            'validados' => $row['validados'],
            'pendientes' => $row['pendientes'],
            'porcentaje_validados' => $porcentajeValidados
        ];
    }
    
    // 3. Activos por Clase (CORREGIDO)
    $queryClases = "
        SELECT 
            a.claseActivo as clase,
            COUNT(DISTINCT a.idActivo) as total,
            AVG(a.precioActivo) as precio_promedio
        FROM activo a
        GROUP BY a.claseActivo
        ORDER BY total DESC
    ";
    
    $resultClases = $conn->query($queryClases);
    $clases = [];
    
    while ($row = $resultClases->fetch_assoc()) {
        $clases[] = [
            'clase' => $row['clase'],
            'total' => $row['total'],
            'precio_promedio' => round($row['precio_promedio'], 4)
        ];
    }
    
    // 4. Activos por Divisa (CORREGIDO)
    $queryDivisas = "
        SELECT 
            a.divisaActivo as divisa,
            COUNT(DISTINCT a.idActivo) as total
        FROM activo a
        GROUP BY a.divisaActivo
        ORDER BY total DESC
        LIMIT 10
    ";
    
    $resultDivisas = $conn->query($queryDivisas);
    $divisas = [];
    
    while ($row = $resultDivisas->fetch_assoc()) {
        $divisas[] = $row;
    }
    
    $response = [
        'success' => true,
        'validaciones' => $validaciones,
        'regiones' => $regiones,
        'clases' => $clases,
        'divisas' => $divisas,
        'total_activos' => $totalActivos
    ];
    
    echo json_encode($response);
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>