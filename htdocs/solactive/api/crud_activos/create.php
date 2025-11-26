<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../../config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$conn = getDBConnection();

try {
    $timestamp = date('Y-m-d H:i:s');
    
    $stmt = $conn->prepare("
        INSERT INTO activo 
        (precioActivo, timestampRecepcion, divisaActivo, tickerUniversal, regionActivo, claseActivo, fechaNeg) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->bind_param(
        "dssssss",
        $data['precioActivo'],
        $timestamp,
        $data['divisaActivo'],
        $data['tickerUniversal'],
        $data['regionActivo'],
        $data['claseActivo'],
        $data['fechaNeg']
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'idActivo' => $conn->insert_id,
            'message' => 'Activo creado exitosamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al crear el activo: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Excepción: ' . $e->getMessage()
    ]);
}

$conn->close();
?>