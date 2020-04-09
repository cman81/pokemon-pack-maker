<?php

function deleteCardsFromCollection($collection_id, $db) {
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

function createCollection($collection_id, $profile_id, $card_id) {
    $db = $GLOBALS['db'];

    $sql = "
        INSERT INTO collections
        (profile_id, collection_name, collection_type)
        VALUES
        (:profile_id, :collection_name, :collection_type)
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':profile_id', $collection_id);
    $stmt->bindValue(':collection_name', $profile_id);
    $stmt->bindValue(':collection_type', 'deck');

    // execute the update statement
    if (!$stmt->execute()) {
        return [
            'status' => 'error',
            'status_message' => 'unable to create collection'
        ];   
    }

    return true;
}