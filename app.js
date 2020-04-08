var profileId;
var wallet = 0;
var packsOpened = 0;
var cashAdded = 0;
var timeoutFunctions = [];
var apiHome = 'http://localhost:8000/api';
var lastProfileUpdate = 0;
var sessionCash = 500;

var collection = [];
var battleDeck = [];
var energyCards = [];
var commonCards = [];
var uncommonCards = [];
var rareCards = {};


const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})
  
$(document).ready(function() {
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
        battleDeck = compileCollection(battleDeck);

        activateSection('battle-deck');
        renderCards(battleDeck, 50, '#battle-deck');
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
        battleDeck[index].quantity--;
        battleDeck = compileCollection(battleDeck);
        renderCards(battleDeck, 0, '#battle-deck');
    });

    loadCards('SSH');
});

/**
 * Sell extra copies of a card. Keep 5 copies.
 */
function sellExtras($thisImg) {
    $thisImg.animate({ left: "300px", opacity: 0 }, 250, function () { $thisImg.removeAttr('style'); $thisImg});
    var index = $thisImg.parent('.card-wrapper').index();
    var card = collection[index];

    // client-side
    if (card.quantity <= 5) {
        return;
    }
    sellQty = card.quantity - 5;
    card.quantity = 5;

    sellValue = sellQty * card.marketValue;
    wallet += sellValue;
    updateStats();
    $thisImg.parent('.card-wrapper').children('.quantity').html("(x5)");

    if (!profileId) {
        return;
    }

    // server-side
    var apiEndpoint = apiHome + '/sell_extras.php';
    $.getJSON(
        apiEndpoint,
        {
            name: profileId,
            cardId: collection[index].img,
            sellQty: sellQty
        }
    );
}

function addToBattleDeck($thisImg) {
    $thisImg.animate({ left: "300px", opacity: 0 }, 250, function () { $thisImg.removeAttr('style'); $thisImg});
    var index = $thisImg.parent('.card-wrapper').index();
    battleDeck.push({
        img: collection[index].img,
        rarity: collection[index].rarity,
        quantity: 1
    });
    battleDeck = compileCollection(battleDeck);
}

/**
 * Sort the collection by card number, then place energy cards at the end.
 * 
 * Find all instances of a given card and merge them into a single array element with an updated
 * 'quantity' field
 */
function compileCollection(collection) {
    var collectionClone = [...collection];
    collectionClone.sort(function(a, b) {
        var firstIdx = parseInt(a.img.match(/\d{3}/), 10);
        var secondIdx = parseInt(b.img.match(/\d{3}/), 10);

        if (a.rarity == 'energy' && b.rarity == 'energy') {
            return firstIdx - secondIdx;
        }
        if (a.rarity != 'energy' && b.rarity != 'energy') {
            return firstIdx - secondIdx;
        }
        if (a.rarity == 'energy') {
            return 1;
        }
        if (b.rarity == 'energy') {
            return -1;
        }
    });

    var consolidatedCollection = [];
    for (var i = 0; i < collectionClone.length; i++) {
        if (collectionClone[i].quantity < 1) {
            // skip if quantity = 0
            continue;
        }
        if (consolidatedCollection.length == 0) {
            consolidatedCollection.push(collectionClone[i]);
            continue;
        }

        if (collectionClone[i].img != collectionClone[i - 1].img) {
            consolidatedCollection.push(collectionClone[i]);
            continue;
        }

        const lastIdx = consolidatedCollection.length - 1;
        consolidatedCollection[lastIdx].quantity += collectionClone[i].quantity;
    }
    return consolidatedCollection;
}

function addPackToCollection() {
    var pack = generatePack();

    // add this pack to the collection (client-side)
    $.each(pack, function (index, value) {
        collection.push({
            ...value,
            'quantity': 1
        });
    });

    collection = compileCollection(collection);

    if (!profileId) {
        return pack;
    }

    // add this pack to the collection (server-side)
    var apiEndpoint = apiHome + '/add_to_collection.php';
    var payload = {
        collectionId: profileId,
        cards: pack
    };

    $.post(
        apiEndpoint,
        payload,
        function(data) {
            console.log(data);
        },
        'json'
    );

    return pack;
}

function loadCards(expansion_set) {
    var apiEndpoint = apiHome + '/load_cards.php';
    $.getJSON(
        apiEndpoint,
        {expansion_set: expansion_set},
        function(data) {
            energyCards = data.energyCards ?? [];
            commonCards = data.commonCards ?? [];
            uncommonCards = data.uncommonCards ?? [];
            rareCards = {
                '03 rare': data.rareCards ?? [],
                '04 rare holo': data.rareHoloCards ?? [],
                '05 rare ultra': data.rareUltraCards ?? [],
                '06 rare secret': data.rareSecretCards ?? [],
            };
        }
    );
}

function saveProfile() {
    if (!profileId) {
        return;
    }

    var apiEndpoint = apiHome + '/save_profile.php';
    var payload = {
        name: profileId,
        wallet: wallet,
        packsOpened: packsOpened,
        cashAdded: cashAdded
    };

    $.post(
        apiEndpoint,
        payload,
        function(data) {
            console.log(data);
        },
        'json'
    );
}

function playSound(cssId) {
    const sound = $(cssId)[0];
    if (!sound) {
        return;
    }

    $('#whoosh')[0].pause();
    $('#bigwhoosh')[0].pause();
    sound.currentTime = 0;
    sound.play();
}

function renderCards(pack, timeInterval, cssId) {
    $(cssId + ' .card-wrapper').remove();

    var time = timeInterval;
    $.each(pack, function (index, value) {
        timeoutFunctions.push(setTimeout(function () {
            var quantitySpan = '';
            if (value.quantity > 1) {
                quantitySpan = `<span class="quantity">(x${value.quantity})</span>`;
            }

            $(cssId).append(`
                <div class="card-wrapper ${value.rarity}">
                    <img src="sword and shield/${value.img}"
                        class="${value.rarity} pokemon-card front" />
                    <br />
                    <span class="rarity">${value.rarity}</span>
                    ${quantitySpan}
                </div>
            `);
        }, time));
        time += timeInterval;
    });
}

function generatePack() {
    let thisCard;
    var pack = [];

    // 1 random energy card
    const energyCardsClone = [...energyCards];
    thisCard = energyCards[Math.floor(Math.random() * energyCards.length)];
    addCardToPack(pack, thisCard, 'energy');

    // 6 random common cards
    var commonCardsClone = [...commonCards];
    commonCardsClone = shuffle(commonCardsClone);
    for (let i = 0; i < 6; i++) {
        thisCard = commonCardsClone.pop();
        addCardToPack(pack, thisCard, 'common');
    }

    // 3 random uncommon cards
    var uncommonCardsClone = [...uncommonCards];
    uncommonCardsClone = shuffle(uncommonCardsClone);
    for (let i = 0; i < 3; i++) {
        thisCard = uncommonCardsClone.pop();
        addCardToPack(pack, thisCard, 'uncommon');
    }

    // 1 random rare card of varying rarity
    var rareCardsClone = {};
    Object.assign(rareCardsClone, rareCards);
    var rarityKey = determineRarity();
    $('#status-message').html(`You got a ${rarityKey.substring(3)} card!`);
    console.log(`Your rare card was a: ${rarityKey}!`);
    rareCardsClone = rareCardsClone[rarityKey];
    thisCard = rareCardsClone[Math.floor(Math.random() * rareCardsClone.length)];
    addCardToPack(pack, thisCard, rarityKey.substring(3));
    
    return pack;
}

function addCardToPack(pack, thisCard, rarity) {
    pack.push({
        img: thisCard.cardId,
        rarity: rarity,
        marketValue: thisCard.marketValue ?? 0
    });
}

/**
 * Shuffles array in place.
 * @see https://stackoverflow.com/a/6274381
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

/**
 * Returns one of the following rarity keys:
 * - rare
 * - rare holo (1 in every 4 packs = 36/144)
 * - rare ultra (1 in every 16 packs = 9/144)
 * - rare secret (1 in every 72 packs = 2/144)
 */
function determineRarity() {
    var rand = Math.floor(Math.random() * 144) + 1; // roll a D144

    if (rand >= 1 && rand <= 2) { // range size = 2
        return '06 rare secret';
    }

    if (rand >= 11 && rand <= 19) { // range size = 9
        return '05 rare ultra';
    }

    if (rand >= 21 && rand <= 56) { // range size = 36
        return '04 rare holo';
    }

    return '03 rare';
}

function activateSection(name) {
    for (var i = 0; i < timeoutFunctions.length; i++) {
        clearTimeout(timeoutFunctions[i]);
    }

    $('.section').hide();
    $('.section.' + name).show();
}

function updateStats() {
    $('#cash-added').html(formatter.format(cashAdded));
    $('#wallet').html(formatter.format(wallet));
    $('#packs-opened').html(packsOpened);
    
    var uniqueCardCount = collection.reduce(function (values, v) {
        if (!values.set[v.img]) {
            values.set[v.img] = 1;
            values.count++;
        }
        return values;
    }, { set: {}, count: 0 }).count;
    $('#unique-card-count').html(uniqueCardCount);

    now = Date.now();
    if (now - lastProfileUpdate > 2000) { // wait 2 seconds before saving again
        saveProfile();
        lastProfileUpdate = now;
    }
}
