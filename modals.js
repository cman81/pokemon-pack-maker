var pokemonModal = {};

pokemonModal.save = function($modal) {
    $modal.find('.modal-title').html('Save Deck');
    $modal.find('.modal-body').html(`<p>Which deck do you want to save to?</p>`);
    $modal.find('.modal-footer').html(`
        <button type="button" class="btn btn-primary btn-sm"
            data-target="#pokemonModal" data-operation="saveNew">
            Save a new deck
        </button>
    `);

    loadBattleDecks(profileId).then(function() {
        for (let key in battleDecks) {
            let value = battleDecks[key];
            $modal.find('.modal-body').append(`
                <div class="deck-item">
                    <img src="sword and shield/${value.boxArt}" data-dismiss="modal"
                        data-collection-id="${value.collectionId}"/><br />
                    <span class="deck-name">${value.collectionName}</span>
                </div>
            `);
        }
    });
    

    $('#pokemonModal')
        .off('click', '.modal-footer button')
        .on('click', '.modal-footer button', function() {
            let operation = $(this).data('operation'); // Extract info from data-* attributes

            if (operation != 'saveNew') {
                return;
            }

            pokemonModal.saveNew($modal);
        })

    $('#pokemonModal')
        .off('click', '.modal-body img')
        .on('click', '.modal-body img', function() {
            let deckName = $(this).parent().find('.deck-name').text();
            saveCollection(loadedBattleDeck, deckName, true, false);
        });
};

pokemonModal.load = function($modal) {
    $modal.find('.modal-title').html('Load Deck');
    $modal.find('.modal-body').html(`<p>Which deck do you want to load?</p>`);
    $modal.find('.modal-footer').html('');

    loadBattleDecks(profileId).then(function() {
        for (let key in battleDecks) {
            let value = battleDecks[key];
            $modal.find('.modal-body').append(`
                <div class="deck-item">
                    <img src="sword and shield/${value.boxArt}" data-dismiss="modal"
                        data-collection-id="${value.collectionId}"/><br />
                    <span class="deck-name">${value.collectionName}</span>
                </div>
            `);
        }
    });

    $('#pokemonModal')
        .off('click', '.modal-body img')
        .on('click', '.modal-body img', function() {
            let key = $(this).parent().index() - 1;
            loadCollection(battleDecks[key].collectionName).then(function() {
                loadedBattleDeck = compileCollection(loadedBattleDeck);

                renderCards(loadedBattleDeck, 50, '#battle-deck');
            });
        });
};

pokemonModal.saveNew = function($modal) {
    $modal.find('.modal-title').html('Save a new deck');
    $modal.find('.modal-body').html(`
        <div class="form-group">
            <label for="exampleInputEmail1">Deck Name</label>
            <input type="text" class="form-control" id="new-deck-name" aria-describedby="nameHelp" placeholder="Enter Name">
            <small id="nameHelp" class="form-text text-muted">Make it something cool!</small>
        </div>
        <p>Which card do you want to use as the deckbox?</p>
    `);
    $modal.find('.modal-footer').html('');

    for (let key in loadedBattleDeck) {
        let value = loadedBattleDeck[key];
        $modal.find('.modal-body').append(`
            <div class="deck-item">
                <img src="sword and shield/${value.img}" data-dismiss="modal" />
            </div>
        `);
    }

    $('#pokemonModal')
        .off('click', '.modal-body img')
        .on('click', '.modal-body img', function() {
            let key = $(this).parent('.deck-item').index() - 1;
            saveCollection(loadedBattleDeck, $('#new-deck-name').val(), true, true, loadedBattleDeck[key].img);
        });
};

pokemonModal.error = function(errorMessage, $modal) {
    $modal = $modal ?? $('#modal');

    $modal.find('.modal-title').html('Error!');
    $modal.find('.modal-body').html(errorMessage);
    $modal.find('.modal-footer').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>');
}
