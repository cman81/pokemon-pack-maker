<?php
    require_once "PokemonDB.class.php";

    $sql = "
        SELECT *
        FROM cards
        WHERE type != :energy
    ";

    $db = new PokemonDB();
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':energy', 'energy');

    $ret = $stmt->execute();
    while ($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $out[] = [
            'expansionSet' => $row['expansion_set'],
            'imgSrc' => $row['img_src'],
            'cardName' => $row['card_name'],
        ];
    }

    shuffle($out);

    exit(json_encode(
        array_slice($out, 0, 10)
    ));
