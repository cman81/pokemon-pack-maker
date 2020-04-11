<?php

    require_once "PokemonDB.class.php";
    include_once "helpers.php";

    extract($_GET); // $gameId, $from, $to, $type, $data

    if ($type == 'load_game') {
        exit(json_encode(load_game_process($gameId)));
    }

    function load_game_process($game_id) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "SELECT game_id FROM games WHERE game_id = :game_id";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);

        $ret = $stmt->execute();

        $result = $ret->fetchArray(SQLITE3_ASSOC);
        $db->close();
        unset($db);

        if (empty($result)) {
            create_new_game_process($game_id);
        }

        return [
            'gameId' => $game_id
        ];
    }

    function create_new_game_process($game_id) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "
            INSERT INTO games
            (game_id, game_name)
            VALUES
            (:game_id, :game_name)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);
        $stmt->bindValue(':game_name', "Game started at " . date("d/m/Y"));
        $stmt->execute();
        $db->close();
        unset($db);

        game_log($game_id, "Game started at " . date("d/m/Y"));
    }

    function game_log($game_id, $log_message) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "
            INSERT INTO game_log
            (game_id, timestamp, message)
            VALUES
            (:game_id, :timestamp, :message)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);
        $stmt->bindValue(':timestamp', time());
        $stmt->bindValue(':message', $log_message);

        $stmt->execute();
        $db->close();
        unset($db);
    }