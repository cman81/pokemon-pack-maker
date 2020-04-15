<?php

    require_once "PokemonDB.class.php";
    include_once "helpers.php";

    extract($_POST); // $gameId, $from, $to, $type, $data

    switch ($type) {
        case 'load_game': exit(json_encode(load_game_state($gameId, $from)));
        case 'shuffle': exit(json_encode(shuffle_card_group($gameId, $from, $data)));
        case 'moveTop': exit(json_encode(move_top_card($gameId, $from, $data)));
        case 'moveSpecific': exit(json_encode(move_specific_card($gameId, $from, $data)));
        case 'moveAll': exit(json_encode(move_all($gameId, $from, $data)));
        case 'tuck': exit(json_encode(tuck_card($gameId, $from, $data)));
        case 'showPokemon': exit(json_encode(show_pokemon($gameId, $from)));
    }

    function load_game_state($game_id, $player_id = false) {
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
            $result['game_state'] = json_encode(create_new_game_state($game_id));
        }

        if ($player_id) {
            $game_state = json_decode($result['game_state'], TRUE);

            $partial_game_state = [
                'player1' => [
                    'is_pokemon_hidden' => $game_state['player1']['is_pokemon_hidden'],
                ],
                'player2' => [
                    'is_pokemon_hidden' => $game_state['player2']['is_pokemon_hidden'],
                ],
            ];

            $card_groups = [
                'deck',
                'hand',
                'discard',
                'active-pokemon',
                'bench-pokemon-1',
                'bench-pokemon-2',
                'bench-pokemon-3',
                'bench-pokemon-4',
                'bench-pokemon-5',
                'prize-cards',
                'stadium',
                'lost-zone',
            ];
            $opponent_id = get_opponent_player_id($player_id);
            foreach ($card_groups as $group) {
                if (!empty($game_state[$player_id][$group])) {
                    $partial_game_state[$player_id][$group] =
                        render_card_group($game_state, $player_id, $group);
                }

                if (!empty($game_state[$opponent_id][$group])) {
                    $partial_game_state[$opponent_id][$group] =
                        render_card_group($game_state, $opponent_id, $group, TRUE);
                }
            }

            return $partial_game_state;
        }

        return json_decode($result['game_state'], TRUE);
    }

    function get_opponent_player_id($my_player_id) {
        if ($my_player_id == 'player1') {
            return 'player2';
        }

        return 'player1';
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

    function move_top_card($game_id, $player_id, $data) {
        $game_state = load_game_state($game_id);
        $from = $data['from'];
        $to = $data['to'];

        $this_card = array_pop($game_state[$player_id][$from]['cards']);
        $game_state[$player_id][$to]['cards'][] = $this_card;

        game_log(
            $game_id,
            "
                {$player_id} moved
                {$this_card} from 
                {$from}
                to
                {$to}
            "
        );
        
        save_game_state($game_id, $game_state);

        return [
            $from => render_card_group($game_state, $player_id, $from),
            $to => render_card_group($game_state, $player_id, $to),
        ];
    }

    /**
     * If a card group is revealed (most card groups), return an array of cards. Otherwise, return
     * the number of cards in the group
     */
    function render_card_group($game_state, $player_id, $group_name, $is_opponent = FALSE) {
        $data = $game_state[$player_id][$group_name] ?? [
            'count' => 0,
            'cards' => [],
        ];

        if ($group_name == 'deck') {
            return [
                'count' => count($data['cards'])
            ];
        }

        if ($group_name == 'prize-cards') {
            return [
                'count' => count($data['cards'])
            ];
        }

        if (!$is_opponent) {
            return $data;
        }

        if (empty($game_state[$player_id]['is_pokemon_hidden'])) {
            return $data;
        }

        if (strpos($group_name, 'pokemon') === FALSE) {
            return $data;
        }

        return [
            'count' => count($data['cards'])
        ];
    }

    function move_specific_card($game_id, $player_id, $data) {
        $game_state = load_game_state($game_id);
        $from = $data['from'];
        $card_position = $data['position'];
        $to = $data['to'];

        $card_pick = $game_state[$player_id][$from]['cards'][$card_position];
        unset($game_state[$player_id][$from]['cards'][$card_position]);
        $game_state[$player_id][$from]['cards'] = array_values($game_state[$player_id][$from]['cards']);

        $game_state[$player_id][$to]['cards'][] = $card_pick;

        save_game_state($game_id, $game_state);

        return [
            $from => render_card_group($game_state, $player_id, $from),
            $to => render_card_group($game_state, $player_id, $to),
        ];
    }

    function move_all($game_id, $player_id, $data) {
        $game_state = load_game_state($game_id);
        $from = $data['from'];
        $to = $data['to'];

        $cards = $game_state[$player_id][$from]['cards'];
        $game_state[$player_id][$from]['cards'] = [];
        $game_state[$player_id][$to]['cards'] = array_merge($game_state[$player_id][$to]['cards'], $cards);
        
        save_game_state($game_id, $game_state);

        return [
            $from => render_card_group($game_state, $player_id, $from),
            $to => render_card_group($game_state, $player_id, $to),
        ];
    }

    function tuck_card($game_id, $player_id, $card_group) {
        $game_state = load_game_state($game_id);

        $card_pick = array_pop($game_state[$player_id][$card_group]['cards']);
        array_unshift($game_state[$player_id][$card_group]['cards'], $card_pick);

        save_game_state($game_id, $game_state);

        return $game_state[$player_id][$card_group];
    }

    function show_pokemon($game_id, $player_id) {
        $game_state = load_game_state($game_id);

        $game_state[$player_id]['is_pokemon_hidden'] = FALSE;

        save_game_state($game_id, $game_state);

        foreach ($game_state[$player_id] as $group_name => $card_group) {
            if (strpos($group_name, 'pokemon') === FALSE) {
                continue;
            }

            if (empty($card_group['cards'])) {
                continue;
            }

            enqueue_game_message(
                $game_id,
                'judge',
                get_opponent_player_id($player_id),
                'renderCardGroup',
                [
                    $group_name => $card_group
                ]
            );
        }
        
        return TRUE;
    }

    function enqueue_game_message($game_id, $from, $to, $type, $data) {
        $db = new PokemonDB();
        $db->busyTimeout(250);

        $sql = "
            INSERT INTO game_message_queue
            (game_id, timestamp_value, message_from, message_to, type, data)
            VALUES
            (:game_id, :timestamp_value, :message_from, :message_to, :type, :data)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':game_id', $game_id);
        $stmt->bindValue(':timestamp_value', time());
        $stmt->bindValue(':message_from', $from);
        $stmt->bindValue(':message_to', $to);
        $stmt->bindValue(':type', $type);
        $stmt->bindValue(':data', json_encode($data));
        
        $stmt->execute();
        $db->close();
        unset($db);
    }
