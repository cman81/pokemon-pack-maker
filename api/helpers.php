<?php

function delete_cards_from_collection($collection_id, $db) {
    $sql = "
        DELETE FROM card_collection_map
        WHERE collection_id = :collection_id
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':collection_id', $collection_id);

    // execute the update statement
    if (!$stmt->execute()) {
        return [
            'status' => 'error',
            'status_message' => 'unable to delete cards from collection'
        ];   
    }

    return true;
}

function create_collection($collection_id, $profile_id, $box_art) {
    $db = $GLOBALS['db'];

    $sql = "
        INSERT INTO collections
        (profile_id, collection_name, collection_type, box_art)
        VALUES
        (:profile_id, :collection_name, :collection_type, :box_art)
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':profile_id', $profile_id);
    $stmt->bindValue(':collection_name', $collection_id);
    $stmt->bindValue(':collection_type', 'deck');
    $stmt->bindValue(':box_art', $box_art);

    // execute the update statement
    if (!$stmt->execute()) {
        return [
            'status' => 'error',
            'status_message' => 'unable to create collection'
        ];   
    }

    return true;
}

function load_collection($collection_id) {
    $collection = [];
    $sql = "
        SELECT ccm.collection_id, ccm.card, c.rarity, c.market_value
        FROM card_collection_map ccm
        INNER JOIN cards c ON c.card_id = ccm.card
        WHERE ccm.collection_id = :collection_id
    ";

    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':collection_id', $collection_id);

    $ret = $stmt->execute();

    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
        $key = $row['card'];

        if (isset($collection[$key])) {
            // this card is a duplicate
            $collection[$key]['quantity']++;
            continue;
        }

        // this card is a unique
        $collection[$key] = [
            'img' => $row['card'],
            'rarity' => get_friendly_rarity_name($row['rarity']),
            'quantity' => 1,
            'marketValue' => $row['market_value'],
        ];
    }

    return array_values($collection);
}