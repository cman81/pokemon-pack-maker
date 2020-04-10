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
            let key = $(this).parent().index() - 1;
            saveCollection(loadedBattleDeck, loadedBattleDeck[key].img, true, false);
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
            saveCollection(loadedBattleDeck, loadedBattleDeck[key].img, true, false);
        });
};

pokemonModal.saveNew = function($modal) {
    $modal.find('.modal-title').html('Save a new deck');
    $modal.find('.modal-body').html(`<p>Which card do you want to use as the deckbox?</p>`);
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
            let key = $(this).parent().index() - 1;
            saveCollection(loadedBattleDeck, loadedBattleDeck[key].img, true, true);
        });
};
