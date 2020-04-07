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
    $sql = "
        UPDATE profiles
        SET cash_added = :cash_added,
            wallet = :wallet,
            packs_opened = :packs_opened
        WHERE profile_id = :profile_id
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':cash_added', $_POST['cashAdded']);
    $stmt->bindValue(':wallet', $_POST['wallet']);
    $stmt->bindValue(':packs_opened', $_POST['packsOpened']);
    $stmt->bindValue(':profile_id', $_POST['name']);

    // execute the update statement
    $is_success = $stmt->execute();

    if (empty($is_success)) {
        $out = [
            'status' => 'error',
            'status_message' => 'unable to update profile'
        ];
        exit(json_encode($out));
    }

    $sql = "
        DELETE FROM card_collection_map
        WHERE profile_id = :profile_id
    ";
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':profile_id', $_POST['name']);

    // execute the update statement
    $is_success = $stmt->execute();

    if (empty($is_success)) {
        $out = [
            'status' => 'error',
            'status_message' => 'unable to delete owned cards'
        ];
        exit(json_encode($out));
    }

    foreach ($_POST['collection'] as $this_card) {
        if (empty($this_card['quantity'])) {
            $this_card['quantity'] = 1;
        }

        for ($i = 0; $i < $this_card['quantity']; $i++) {
            $sql = "
                INSERT INTO card_collection_map (profile_id, card)
                VALUES (:profile_id, :card)
            ";
            $stmt = $db->prepare($sql);

            // passing values to the parameters
            $stmt->bindValue(':profile_id', $_POST['name']);
            $stmt->bindValue(':card', $this_card['img']);

            // execute the update statement
            $is_success = $stmt->execute();
        }
    }

    $out = [
        'status' => 'success',
        'status_message' => 'profile updated with ' . count($_POST['collection']) . ' cards'
    ];
    exit(json_encode($out));
