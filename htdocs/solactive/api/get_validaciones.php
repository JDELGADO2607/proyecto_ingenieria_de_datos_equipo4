<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config.php';

try {
    $conn = getDBConnection();
    
    $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
    $fecha_desde = isset($_GET['fecha_desde']) ? $_GET['fecha_desde'] : null;
    $fecha_hasta = isset($_GET['fecha_hasta']) ? $_GET['fecha_hasta'] : null;
    
    // Usar timestampRecepcion del activo como fecha de validación
    $query = "
        SELECT 
            r.idResultado,
            r.tickerResultado AS ticker,
            r.estadoValidacion AS estado,
            a.timestampRecepcion AS fechaValidacion,
            r.observacionResultado AS observaciones,
            a.precioActivo AS precio,
            a.divisaActivo AS divisa
        FROM resultado r
        LEFT JOIN activo a ON r.idActivoFK = a.idActivo
        WHERE 1=1
    ";
    
    if ($estado && $estado != 'todos' && $estado != '') {
        $query .= " AND r.estadoValidacion LIKE '%" . $conn->real_escape_string($estado) . "%'";
    }
    
    if ($fecha_desde) {
        $query .= " AND DATE(a.timestampRecepcion) >= '" . $conn->real_escape_string($fecha_desde) . "'";
    }
    
    if ($fecha_hasta) {
        $query .= " AND DATE(a.timestampRecepcion) <= '" . $conn->real_escape_string($fecha_hasta) . "'";
    }
    
    $query .= " ORDER BY a.timestampRecepcion DESC LIMIT 100";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }
    
    $validaciones = [];
    
    while ($row = $result->fetch_assoc()) {
        $validaciones[] = $row;
    }
    
    // Devolver array vacío si no hay datos (NO es un error)
    echo json_encode($validaciones);
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'sql_state' => $conn->sqlstate ?? 'unknown'
    ]);
}
?>