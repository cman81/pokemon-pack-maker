var profileId;
var wallet = 0;
var packsOpened = 0;
var cashAdded = 0;
var timeoutFunctions = [];
var lastProfileUpdate = 0;
var sessionCash = 5000;

var collection = [];
var loadedBattleDeck = [];
var energyCards = [];
var commonCards = [];
var uncommonCards = [];
var rareCards = {};
  
$(document).ready(function() {
    loadCards('SSH');

    $('#open-pack').click(function() {
        activateSection('pack');
        if (wallet < 4) {
            $('#status-message').html('Not enough money in your wallet! Packs cost $4.00');
            return;
        }

        playSound('#magic-spell');
        var pack = addPackToCollection();

        // render the generated pack!
        pack = shuffle(pack);
        renderCards(pack, 125, '#pack');

        wallet -= 4;
        packsOpened++;
        updateStats();
    });

    $('#view-pack').click(function() {
        activateSection('pack');
    });

    $('#view-collection').click(function() {
        collection = compileCollection(collection);

        activateSection('collection');
        renderCards(collection, 50, '#collection');
    });

    $('#main-actions').on('click', '#view-battle-deck', function() {
        loadedBattleDeck = compileCollection(loadedBattleDeck);

        activateSection('battle-deck');
        renderCards(loadedBattleDeck, 50, '#battle-deck');
    });

    $('.section').on('mouseover', '.pokemon-card', function() {
        if ($(this).hasClass('rare')) {
            playSound('#bigwhoosh');
            return;
        }
        playSound('#whoosh');
    });

    $('.add-cash').click(function() {
        var amountToAdd = parseInt($(this).attr('id').substring(7)); // e.g.: dollar-5 becomes 5
        if (amountToAdd > sessionCash) {
            $(this).removeClass('btn-outline-success');
            $(this).addClass('btn-outline-danger');
            return;
        }

        cashAdded += amountToAdd;
        wallet += amountToAdd;
        sessionCash -= amountToAdd;
        updateStats();
    });

    $('.load-profile').click(function() {
        var apiEndpoint = apiHome + '/load_profile.php';
        profileId = $(this).text().toLowerCase();
        
        $.getJSON(
            apiEndpoint,
            {name: profileId},
            function(data) {
                wallet = data.wallet ?? 0;
                packsOpened = data.packsOpened ?? 0;
                cashAdded = data.cashAdded ?? 0;
                collection = data.collection ?? [];

                updateStats();
                collection = compileCollection(collection);
                activateSection('collection');
                renderCards(collection, 50, '#collection');
            }
        );
    });

    $('#collection').on('click', '.pokemon-card', function() {
        if ($('#collection-click-action').val() == 'add-to-deck') {
            addToBattleDeck($(this));
        }
        if ($('#collection-click-action').val() == 'sell-extras') {
            sellExtras($(this));
        }
    });

    $('#battle-deck').on('click', '.pokemon-card', function() {
        var index = $(this).parent('.card-wrapper').index();
        loadedBattleDeck[index].quantity--;
        loadedBattleDeck = compileCollection(loadedBattleDeck);
        updateDeckStats();
        renderCards(loadedBattleDeck, 0, '#battle-deck');
    });
});
