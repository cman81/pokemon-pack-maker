var pokemonModal = {};

pokemonModal.save = function($modal) {
    $('#pokemonModal').off('click');
    
    $modal.find('.modal-title').html('Save Deck');
    $modal.find('.modal-body').html(`
        <p>Which deck do you want to pick?</p>
        <img src="sword and shield/en-US-SWSH1-203-lapras-vmax.jpg" data-collection-id="4"
            data-dismiss="modal" />
    `);
    $modal.find('.modal-footer').html(`
        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal"
            data-target=".battle-deck .modal.save-new" data-dismiss="modal" data-operation="saveNew">
            Save a new deck
        </button>
    `);

};

pokemonModal.load = function($modal) {
    $('#pokemonModal').off('click');

    $modal.find('.modal-title').html('Load Deck');
    $modal.find('.modal-body').html(`
        <p>Which deck do you want to pick?</p>
        <img src="sword and shield/en-US-SWSH1-203-lapras-vmax.jpg" data-collection-id="4"
            data-dismiss="modal" />
    `);
    $modal.find('.modal-footer').html('');

    $('#pokemonModal').on('click', 'img', function() {
        battleDeck = [{"img":"en-US-SWSH1-049-lapras-v.jpg","rarity":"rare holo","quantity":2},{"img":"en-US-SWSH1-050-lapras-vmax.jpg","rarity":"rare ultra","quantity":2},{"img":"en-US-SWSH1-063-snom.jpg","rarity":"common","quantity":2},{"img":"en-US-SWSH1-064-frosmoth.jpg","rarity":"rare holo","quantity":2},{"img":"en-US-SWSH1-141-snorlax-v.jpg","rarity":"rare holo","quantity":4},{"img":"en-US-SWSH1-142-snorlax-vmax.jpg","rarity":"rare ultra","quantity":4},{"img":"en-US-SWSH1-163-evolution-incense.jpg","rarity":"uncommon","quantity":4},{"img":"en-US-SWSH1-164-great-ball.jpg","rarity":"uncommon","quantity":4},{"img":"en-US-SWSH1-166-hyper-potion.jpg","rarity":"uncommon","quantity":4},{"img":"en-US-SWSH1-173-poke-kid.jpg","rarity":"uncommon","quantity":4},{"img":"en-US-SWSH1-174-pokegear-30.jpg","rarity":"uncommon","quantity":2},{"img":"en-US-SWSH1-175-pokemon-catcher.jpg","rarity":"uncommon","quantity":2},{"img":"en-US-SWSH1-189-lapras-v.jpg","rarity":"rare ultra","quantity":2},{"img":"en-US-SWSH1-201-professors-research.jpg","rarity":"rare ultra","quantity":3},{"img":"en-US-SWSH1-203-lapras-vmax.jpg","rarity":"rare secret","quantity":2},{"img":"en-US-SWSH1-209-professors-research.jpg","rarity":"rare secret","quantity":1},{"img":"en-US-SWSH-Energy-003-water-energy.jpg","rarity":"energy","quantity":20}];
        renderCards(battleDeck, 50, '#battle-deck');
    })
};

pokemonModal.saveNew = function($modal) {
    $('#pokemonModal').off('click');

    $modal.find('.modal-title').html('Save a new deck');
    $modal.find('.modal-body').html(``);
    $modal.find('.modal-footer').html('');
};
