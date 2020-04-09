var pokemonModal = {
    save: {
        'title': 'Save Deck',
        'body': `
            <p>Which deck do you want to pick?</p>
            <img src="sword and shield/en-US-SWSH1-203-lapras-vmax.jpg" data-collection-id="4"
                data-dismiss="modal" />
        `,
        'footer': `
            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal"
                data-target=".battle-deck .modal.save-new" data-dismiss="modal" data-operation="saveNew">
                Save a new deck
            </button>
        `
    },
    load: {
        'title': 'Load Deck',
        'body': `
            <p>Which deck do you want to pick?</p>
            <img src="sword and shield/en-US-SWSH1-203-lapras-vmax.jpg" data-collection-id="4"
                data-dismiss="modal" />
        `,
    },
    saveNew: {
        'title': 'Save a new deck'
    }
};