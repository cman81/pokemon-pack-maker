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

    $sql = "
        DELETE FROM card_collection_map
        WHERE ownership_id IN (
            SELECT ownership_id
            FROM card_collection_map
            WHERE profile_id = :profile_id
            AND card = :card
            LIMIT :quantity
        );
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':profile_id', $_GET['name']);
    $stmt->bindValue(':card', $_GET['cardId']);
    $stmt->bindValue(':quantity', $_GET['sellQty']);

    // execute the update statement
    $stmt->execute();

    $out = [
        'status' => 'success',
        'status_message' => "{$_GET['sellQty']} cards sold from the collection of {$_GET['name']}"
    ];
    exit(json_encode($out));
