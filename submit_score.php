<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Haal de gegevens op uit het POST-verzoek
    $playerName = isset($_POST['playerName']) ? htmlspecialchars($_POST['playerName']) : '';
    $score      = isset($_POST['score']) ? htmlspecialchars($_POST['score']) : '';
    $time       = isset($_POST['time']) ? htmlspecialchars($_POST['time']) : '';
    $matchId    = isset($_POST['matchId']) ? htmlspecialchars($_POST['matchId']) : '';

    // Basisvalidatie
    if (!empty($playerName) && !empty($score)) {

        // Bouw een array met de ingevoerde gegevens
        $formData = array(
            'playerName'   => $playerName,
            'score'        => $score,
            'time'         => $time,
            'matchId'      => $matchId,
            'submitted_at' => date('Y-m-d H:i:s')
        );

        // JSON-bestand
        $filePath = 'scores.json';

        // Lees bestaande gegevens uit JSON-bestand
        if (file_exists($filePath)) {
            $jsonData = file_get_contents($filePath);
            $dataArray = json_decode($jsonData, true);
        } else {
            $dataArray = array();
        }

        // Voeg nieuwe gegevens toe
        $dataArray[] = $formData;

        // Converteer array naar JSON
        $jsonData = json_encode($dataArray, JSON_PRETTY_PRINT);

        // Sla op
        if (file_put_contents($filePath, $jsonData)) {
            echo "Score succesvol opgeslagen!";
        } else {
            echo "Fout bij opslaan.";
        }

    } else {
        echo "Ongeldige invoer, zorg dat alle velden correct zijn.";
    }

} else {
    echo "Verkeerde verzoeksmethode.";
}
?>
