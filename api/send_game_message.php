<?php

    require_once "PokemonDB.class.php";
    include_once "helpers.php";

    extract($_GET); // $gameId, $from, $to, $type, $data

    switch ($type) {
        case 'load_game': exit(json_encode(load_game_state($gameId, true)));
        case 'shuffle': exit(json_encode(shuffle_card_group($gameId, $from, $data)));
    }

    function load_game_state($game_id, $is_silent = false) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "SELECT game_id, game_state FROM games WHERE game_id = :game_id";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);

        $ret = $stmt->execute();
        $result = $ret->fetchArray(SQLITE3_ASSOC);
        $db->close();
        unset($db);

        if (empty($result)) {
            $result['game_state'] = create_new_game_state($game_id);
        }

        if ($is_silent) {
            return $game_id;
        }

        return json_decode($result['game_state'], TRUE);
    }

    function create_new_game_state($game_id) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "
            INSERT INTO games
            (game_id, game_name, game_state)
            VALUES
            (:game_id, :game_name, :game_state)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);

        $game_state = initialize_game_state();
        $stmt->bindValue(':game_state', json_encode($game_state));
        
        $stmt->execute();
        $db->close();
        unset($db);

        game_log($game_id, "Game started at " . date("d/m/Y"));

        return $game_state;
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

        $log_message = trim(preg_replace('/\n\s*/', "\n", $log_message));
        $stmt->bindValue(':message', $log_message);

        $stmt->execute();
        $db->close();
        unset($db);
    }

    function shuffle_card_group($game_id, $player_id, $card_group) {
        $game_state = load_game_state($game_id);

        $old = $new = $game_state[$player_id][$card_group]['cards'];
        shuffle($new);
        $game_state[$player_id][$card_group]['cards'] = $new;

        save_game_state($game_id, $game_state);

        game_log(
            $game_id,
            "
                {$player_id} suffled their
                {$card_group} from
                " . json_encode($old) . "
                to
                " . json_encode($new) . "
            "
        );

        return true;
    }

    function save_game_state($game_id, $game_state) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "
            UPDATE games
            SET game_state = :game_state
            WHERE game_id = :game_id
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);
        $stmt->bindValue(':game_state', json_encode($game_state));
        
        $stmt->execute();
        $db->close();
        unset($db);
    }