<?php
    require_once "PokemonDB.class.php";

    exit(json_encode(load_collection($_GET['collectionId'])));
