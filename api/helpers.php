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
