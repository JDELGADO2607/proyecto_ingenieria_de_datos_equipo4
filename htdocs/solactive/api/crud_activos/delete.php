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

$conn = getDBConnection();
$conn->begin_transaction();

try {
    $idActivo = intval($data['idActivo']);
    
    // 1. Eliminar registros en RESULTADO que referencian este activo
    $stmt1 = $conn->prepare("DELETE FROM resultado WHERE idActivoFK = ?");
    $stmt1->bind_param("i", $idActivo);
    $stmt1->execute();
    $stmt1->close();
    
    // 2. Eliminar registros en DETALLERECEPCION
    $stmt2 = $conn->prepare("DELETE FROM detalleRecepcion WHERE idActivoFK = ?");
    $stmt2->bind_param("i", $idActivo);
    $stmt2->execute();
    $stmt2->close();
    
    // 3. Finalmente eliminar el ACTIVO
    $stmt3 = $conn->prepare("DELETE FROM activo WHERE idActivo = ?");
    $stmt3->bind_param("i", $idActivo);
    
    if ($stmt3->execute()) {
        if ($stmt3->affected_rows > 0) {
            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Activo y sus relaciones eliminados exitosamente'
            ]);
        } else {
            $conn->rollback();
            echo json_encode([
                'success' => false,
                'error' => 'No se encontró el activo con ID: ' . $idActivo
            ]);
        }
    } else {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'error' => 'Error al eliminar activo: ' . $stmt3->error
        ]);
    }
    
    $stmt3->close();
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'error' => 'Excepción al eliminar: ' . $e->getMessage()
    ]);
}

$conn->close();
?>