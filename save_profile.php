<?php
    class MyDB extends SQLite3 {
        function __construct() {
            $this->open('db/pokemon.db');
        }
    }

    $db = new MyDB();
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
        DELETE FROM owned_cards
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
        $sql = "
            INSERT INTO owned_cards (profile_id, card, rarity, quantity)
            VALUES (:profile_id, :card, :rarity, :quantity)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':profile_id', $_POST['name']);
        $stmt->bindValue(':card', $this_card['img']);
        $stmt->bindValue(':rarity', $this_card['rarity']);
        $stmt->bindValue(':quantity', $this_card['quantity']);

        // execute the update statement
        $is_success = $stmt->execute();
    }

    $out = [
        'status' => 'success',
        'status_message' => 'profile updated with ' . count($_POST['collection']) . ' cards'
    ];
    exit(json_encode($out));