<?php
header('Content-Type: application/json');
require_once '../config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$conn = getDBConnection();
$conn->begin_transaction();

try {
    $insertados = 0;

    foreach ($data as $record) {
        // Preparar valores
        $precio = floatval($record['golden_close']);
        $ticker = $record['mic'];
        $divisa = $record['rt_currency'];
        $region = $record['region'];
        $fechaNeg = date('Y-m-d', strtotime($record['date']));
        $timestamp = date('Y-m-d H:i:s');

        // ========== INSERTAR ACTIVO ==========
        $stmt = $conn->prepare("
            INSERT INTO activo 
            (precioActivo, timestampRecepcion, divisaActivo, tickerUniversal, regionActivo, claseActivo, fechaNeg)
            VALUES (?, ?, ?, ?, ?, 'SHARE', ?)
        ");

        $stmt->bind_param("dsssss", 
            $precio, $timestamp, $divisa, $ticker, $region, $fechaNeg
        );
        $stmt->execute();
        $idActivo = $conn->insert_id;

        // ========== INSERTAR RESULTADO (CORREGIDO) ==========
        $estadoMap = [
            'VALIDATED' => 'Validated',
            'SEMI_VALIDATED' => 'Semi-Validated',
            'UNVALIDATED' => 'Unvalidated',
            'SINGLE_SOURCE' => 'User-Validation'
        ];

        $estadoFinal = $estadoMap[$record['status']] ?? 'Unvalidated';
        $obs = "Golden Close: " . $record['golden_close'];

        // QUERY CORREGIDA - SIN fechaValidacion
        $stmt2 = $conn->prepare("
            INSERT INTO resultado 
            (idActivoFK, tickerResultado, estadoValidacion, observacionResultado)
            VALUES (?, ?, ?, ?)
        ");

        $stmt2->bind_param("isss", 
            $idActivo, $ticker, $estadoFinal, $obs
        );

        $stmt2->execute();
        $insertados++;
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => "Datos insertados correctamente.",
        'insertados' => $insertados
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>