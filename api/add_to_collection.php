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

    // SQL statement to update status of a task to completed
    $count = 0;
    foreach ($_POST['pack'] as $this_card) {
        $sql = "
            INSERT INTO card_collection_map (profile_id, card)
            VALUES (:profile_id, :card)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':profile_id', $_POST['name']);
        $stmt->bindValue(':card', $this_card['img']);

        // execute the update statement
        if ($stmt->execute()) {
            $count++;
        }
    }

    $out = [
        'status' => 'success',
        'status_message' => "{$count} cards added the collection of {$_POST['name']}"
    ];
    exit(json_encode($out));
