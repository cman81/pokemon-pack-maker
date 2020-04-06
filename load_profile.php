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
    $sql = "SELECT * FROM card_collection_map WHERE profile_id = '" . $_GET['name'] . "'";
    $ret = $db->query($sql);
    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
        $out['collection'][] = [
            'img' => $row['card'],
            'rarity' => $row['rarity'],
            'quantity' => $row['quantity']
        ];
    }

    exit(json_encode($out));