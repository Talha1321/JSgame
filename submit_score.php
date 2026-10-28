<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ontvang de gegevens uit het spel
    $playerName = trim($_POST['playerName'] ?? '');
    $score      = filter_input(INPUT_POST, 'score', FILTER_VALIDATE_INT);
    $time       = trim($_POST['time'] ?? '');
    $matchId    = trim($_POST['matchId'] ?? '');

    // Controleer of de naam en score geldig zijn
    if ($playerName !== '' && $score !== false && $score !== null) {
        $formData = array(
            'playerName'   => $playerName,
            'score'        => $score,
            'time'         => $time,
            'matchId'      => $matchId,
            'submitted_at' => date('Y-m-d H:i:s')
        );

        // Bestand waarin de scores worden opgeslagen
        $filePath = 'scores.json';

        // Lees bestaande scores
        if (file_exists($filePath)) {
            $jsonData = file_get_contents($filePath);
            $dataArray = json_decode($jsonData, true);

            if (!is_array($dataArray)) {
                $dataArray = array();
            }
        } else {
            $dataArray = array();
        }

        // Voeg de nieuwe score toe
        $dataArray[] = $formData;

        // Zet de gegevens om naar JSON
        $jsonData = json_encode($dataArray, JSON_PRETTY_PRINT);

        // Sla de scores op
        if (file_put_contents($filePath, $jsonData) !== false) {
            echo "Score succesvol opgeslagen!";
        } else {
            http_response_code(500);
            echo "Fout bij opslaan.";
        }
    } else {
        http_response_code(400);
        echo "Ongeldige invoer.";
    }
} else {
    http_response_code(405);
    echo "Verkeerde verzoeksmethode.";
}
?>

