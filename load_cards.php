<?php
    class MyDB extends SQLite3 {
        function __construct() {
            $this->open('db/pokemon.db');
        }
    }

    $out = [
        'energyCards' => [],
        'commonCards' => [],
        'uncommonCards' => [],
        'rareCards' => [],
        'rareHoloCards' => [],
        'rareUltraCards' => [],
        'rareSecretCards' => [],
    ];

    $json_field_map = [
        '00 energy' => 'energyCards',
        '01 common' => 'commonCards',
        '02 uncommon' => 'uncommonCards',
        '03 rare' => 'rareCards',
        '04 rare holo' => 'rareHoloCards',
        '05 rare ultra' => 'rareUltraCards',
        '06 rare secret' => 'rareSecretCards',
    ];

    $sql = "SELECT * FROM cards WHERE expansion_set = :expansion_set";

    $db = new MyDB();
    $stmt = $db->prepare($sql);

    // passing values to the parameters
    $stmt->bindValue(':expansion_set', $_GET['expansion_set']);

    $ret = $stmt->execute();
    while ($row = $ret->fetchArray(SQLITE3_ASSOC)) {
        $rarity = $row['rarity'];
        $key = $json_field_map[$rarity];
        $out[$key][] = $row['card_id'];
    }

    exit(json_encode($out));