<?php
    require_once "PokemonDB.class.php";

    $out = [];

    $sql = "
        SELECT message_from, type, data
        FROM game_message_queue
        WHERE message_to = :message_to
        AND game_id = :game_id
        ORDER BY timestamp_value ASC
    ";

    $db = new PokemonDB();
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':message_to', $_GET['recipient']);
    $stmt->bindValue(':game_id', $_GET['gameId']);

    $ret = $stmt->execute();
    while ($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $out[] = [
            'message_from' => $row['message_from'],
            'type' => $row['type'],
            'data' => json_decode($row['data'], TRUE),
        ];
    }

    exit(json_encode($out));
