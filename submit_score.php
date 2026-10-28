<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Gegevens ontvangen vanuit JavaScript
    $name = trim($_POST['playerName'] ?? 'Onbekend');
    $score = (int)($_POST['score'] ?? 0);

    // Score klaarmaken om op te slaan
    $gameData = [
        'name' => $name,
        'score' => $score
    ];

    // Bestand met scores
    $filePath = 'scores.json';

    // Bestaande scores ophalen
    if (file_exists($filePath)) {
        $dataArray = json_decode(file_get_contents($filePath), true);
        if (!is_array($dataArray)) {
            $dataArray = [];
        }
    } else {
        $dataArray = [];
    }

    // Nieuwe score toevoegen
    $dataArray[] = $gameData;

    // Scores opslaan
    if (file_put_contents($filePath, json_encode($dataArray, JSON_PRETTY_PRINT)) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Score opgeslagen!'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Score opslaan mislukt.'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Ongeldige aanvraag'
    ]);
}
?>