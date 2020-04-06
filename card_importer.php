<?php

    $cards_to_import = [
        'en-US-SWSH1-203-lapras-vmax.jpg',
        'en-US-SWSH1-204-morpeko-vmax.jpg',
        'en-US-SWSH1-205-stonjourner-vmax.jpg',
        'en-US-SWSH1-206-snorlax-vmax.jpg',
        'en-US-SWSH1-207-bede.jpg',
        'en-US-SWSH1-208-marnie.jpg',
        'en-US-SWSH1-209-professors-research.jpg',
        'en-US-SWSH1-210-team-yell-grunt.jpg',
        'en-US-SWSH1-211-zacian-v-1.jpg',
        'en-US-SWSH1-212-zamazenta-v.jpg',
        'en-US-SWSH1-213-air-balloon.jpg',
        'en-US-SWSH1-214-metal-saucer.jpg',
        'en-US-SWSH1-215-ordinary-rod.jpg',
        'en-US-SWSH1-216-quick-ball.jpg'
    ];

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
    $import_count = 0;
    foreach ($cards_to_import as $this_card) {
        $sql = "
            INSERT INTO cards (card_id, rarity, expansion_set)
            VALUES (:card_id, :rarity, :expansion_set)
        ";
        $stmt = $db->prepare($sql);

        // passing values to the parameters
        $stmt->bindValue(':card_id', $this_card);
        $stmt->bindValue(':rarity', '06 rare secret');
        $stmt->bindValue(':expansion_set', 'SSH');

        // execute the update statement
        if ($stmt->execute()) {
            $import_count++;
        }
    }

    echo "{$import_count} cards imported.";