<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../../config.php';

$conn = getDBConnection();

$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$ticker = isset($_GET['ticker']) ? $_GET['ticker'] : '';
$region = isset($_GET['region']) ? $_GET['region'] : '';
$clase = isset($_GET['clase']) ? $_GET['clase'] : '';

if ($id) {
    // Consulta específica por ID
    $stmt = $conn->prepare("SELECT * FROM activo WHERE idActivo = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $activos = [];
    while ($row = $result->fetch_assoc()) {
        $activos[] = $row;
    }
    
    echo json_encode($activos);
    $stmt->close();
} else {
    // Consulta con filtros
    $query = "SELECT * FROM activo WHERE 1=1";
    
    if (!empty($ticker)) {
        $query .= " AND tickerUniversal LIKE '%" . $conn->real_escape_string($ticker) . "%'";
    }
    
    if (!empty($region)) {
        $query .= " AND regionActivo = '" . $conn->real_escape_string($region) . "'";
    }
    
    if (!empty($clase)) {
        $query .= " AND claseActivo = '" . $conn->real_escape_string($clase) . "'";
    }
    
    $query .= " ORDER BY timestampRecepcion DESC LIMIT 100";
    
    $result = $conn->query($query);
    $activos = [];
    
    while ($row = $result->fetch_assoc()) {
        $activos[] = $row;
    }
    
    echo json_encode($activos);
}

$conn->close();
?>