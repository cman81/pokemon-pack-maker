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

    $out = [
        'status' => 'success',
        'status_message' => 'profile updated'
    ];
    exit(json_encode($out));
