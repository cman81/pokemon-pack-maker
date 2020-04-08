<?php
    require_once "PokemonDB.class.php";

    $db = new PokemonDB();
    if(!$db) {
        $out = [
            'status' => 'error',
            'status_message' => 'cannot connect to database'
        ];
        exit(json_encode($out));
    }

    $out = [];

    $sql = "SELECT * FROM profiles WHERE profile_id = '" . $_GET['name'] . "'";
    $ret = $db->query($sql);
    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
        $out['profileId'] = $row['profile_id'];
        $out['cashAdded'] = $row['cash_added'];
        $out['wallet'] = $row['wallet'];
        $out['packsOpened'] = $row['packs_opened'];
        break;
    }

    if (empty($out['profileId'])) {
        $out = [
            'status' => 'error',
            'status_message' => 'cannot find user: ' . $_GET['name']
        ];
        exit(json_encode($out));
    }

    $out['collection'] = [];
    $sql = "
        SELECT ccm.collection_id, ccm.card, c.rarity, c.market_value
        FROM card_collection_map ccm
        INNER JOIN cards c ON c.card_id = ccm.card
        WHERE ccm.collection_id = :collection_id
    ";

    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':collection_id', $_GET['name']);

    $ret = $stmt->execute();

    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
        $key = $row['card'];

        if (isset($out['collection'][$key])) {
            // this card is a duplicate
            $out['collection'][$key]['quantity']++;
            continue;
        }

        // this card is a unique
        $out['collection'][$key] = [
            'img' => $row['card'],
            'rarity' => get_friendly_rarity_name($row['rarity']),
            'quantity' => 1,
            'marketValue' => $row['market_value'],
        ];
    }

    $out['collection'] = array_values($out['collection']);

    exit(json_encode($out));

    function get_friendly_rarity_name($rarity_id) {
        return substr($rarity_id, 3);
    }
