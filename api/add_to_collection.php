<?php
    require_once "PokemonDB.class.php";
    include_once "helpers.php";

    $db = new PokemonDB();
    if(!$db) {
        $out = [
            'status' => 'error',
            'status_message' => 'cannot connect to database'
        ];
        exit(json_encode($out));
    }

    if ($_POST['isNew']) {
        $status = createCollection($_POST['collectionId'], $_POST['profileId'], $_POST['cardId']);
        if ($status != true) {
            exit(json_encode($status));
        }
    }
    if ($_POST['isReplace']) {
        $status = deleteCardsFromCollection($_POST['collectionId'], $db);
        if ($status != true) {
            exit(json_encode($status));
        }
    }

    // SQL statement to update status of a task to completed
    $count = 0;
    foreach ($_POST['cards'] as $this_card) {
        $sql = "
            INSERT INTO card_collection_map (collection_id, card)
            VALUES (:collection_id, :card)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':collection_id', $_POST['collectionId']);
        $stmt->bindValue(':card', $this_card['img']);

        // execute the update statement
        if ($stmt->execute()) {
            $count++;
        }
    }

    $out = [
        'status' => 'success',
        'status_message' => "{$count} cards added to the collection called: {$_POST['collectionId']}"
    ];
    exit(json_encode($out));
