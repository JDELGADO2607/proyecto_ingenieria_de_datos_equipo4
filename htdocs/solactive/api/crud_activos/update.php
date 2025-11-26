<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../../config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['idActivo'])) {
    echo json_encode(['success' => false, 'error' => 'ID de activo requerido']);
    exit;
}

// Validar campos requeridos
$required = ['precioActivo', 'divisaActivo', 'tickerUniversal', 'regionActivo', 'claseActivo', 'fechaNeg'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        echo json_encode(['success' => false, 'error' => "Campo requerido: $field"]);
        exit;
    }
}

$conn = getDBConnection();

try {
    // Verificar que el activo existe
    $check = $conn->prepare("SELECT idActivo FROM activo WHERE idActivo = ?");
    $check->bind_param("i", $data['idActivo']);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'El activo no existe']);
        $check->close();
        $conn->close();
        exit;
    }
    $check->close();
    
    // Actualizar el activo
    $stmt = $conn->prepare("
        UPDATE activo SET
            precioActivo = ?,
            divisaActivo = ?,
            tickerUniversal = ?,
            regionActivo = ?,
            claseActivo = ?,
            fechaNeg = ?
        WHERE idActivo = ?
    ");
    
    $stmt->bind_param(
        "dsssssi",
        $data['precioActivo'],
        $data['divisaActivo'],
        $data['tickerUniversal'],
        $data['regionActivo'],
        $data['claseActivo'],
        $data['fechaNeg'],
        $data['idActivo']
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Activo actualizado exitosamente',
            'affected_rows' => $stmt->affected_rows
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Error al actualizar: ' . $stmt->error
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