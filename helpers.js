var apiHome = 'http://localhost:8000/api';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})

function updateDeckStats() {
    let count = 0;
    $.each(loadedBattleDeck, function(key, value) {
        count += value.quantity;
    });
    $('#deck-cards').html(count);
}

/**
 * Load battle decks from the database, then return as a promise for post-processing
 * 
 */
function loadBattleDecks(profileId) {
    var apiEndpoint = apiHome + '/load_battledecks.php';
    
    return $.getJSON(
        apiEndpoint,
        function(data) {
            battleDecks = data;
        }
    );
}

/**
 * Sell extra copies of a card. Keep 4 copies.
 */
function sellExtras($thisImg) {
    const copiesToKeep = 4;
    $thisImg.animate(
        { left: "300px", opacity: 0 }, 250, function () { $thisImg.removeAttr('style'); $thisImg}
    );
    var index = $thisImg.parent('.card-wrapper').index();
    var card = collection[index];

    // client-side
    if (card.quantity <= copiesToKeep) {
        return;
    }
    sellQty = card.quantity - copiesToKeep;
    card.quantity = copiesToKeep;

    sellValue = sellQty * card.marketValue;
    wallet += sellValue;
    updateStats();
    $thisImg.parent('.card-wrapper').find('.quantity').html(`(x${copiesToKeep})`);

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

function loadCollection(collectionId) {
    var apiEndpoint = apiHome + '/load_collection.php';
    return $.getJSON(
        apiEndpoint,
        {collectionId: collectionId},
        function(data) {
            loadedBattleDeck = data;
        }
    );
}

function addToBattleDeck($thisImg) {
    $thisImg.animate(
        { left: "300px", opacity: 0 }, 250, function () { $thisImg.removeAttr('style'); $thisImg}
    );

    var index = $thisImg.parent('.card-wrapper').index();
    loadedBattleDeck.push({
        img: collection[index].img,
        rarity: collection[index].rarity,
        quantity: 1
    });
    loadedBattleDeck = compileCollection(loadedBattleDeck);
    updateDeckStats();
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
    saveCollection(pack, profileId, false, false);

    return pack;
}

/**
 * Save cards to a collection
 */
function saveCollection(pack, collectionName, isReplace, isNew, boxArt) {
    isReplace = isReplace ?? false;
    isNew = isNew ?? false;
    boxArt = boxArt ?? '';

    var apiEndpoint = apiHome + '/add_to_collection.php';
    var payload = {
        profileId: profileId ?? 'anonymous',
        collectionId: collectionName,
        cards: pack,
        isReplace: isReplace,
        isNew: isNew,
        boxArt: boxArt
    };
    $.post(apiEndpoint, payload, function (data) {
        if (data.status == 'error') {
            pokemonModal.error(data.statusMessage);
        }
    }, 'json');
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

/**
 * A collection of cards is usually stored this way:
 * - {img: "en-US-SWSH1-049-lapras-v.jpg", rarity: "rare holo", quantity: 2, marketValue: 1.75}
 * - {img: "en-US-SWSH1-050-lapras-vmax.jpg", rarity: "rare ultra", quantity: 3, marketValue: 5}
 * This function serves to create a list this way:
 * - en-US-SWSH1-049-lapras-v.jpg
 * - en-US-SWSH1-049-lapras-v.jpg
 * - en-US-SWSH1-050-lapras-vmax.jpg
 * - en-US-SWSH1-050-lapras-vmax.jpg
 * - en-US-SWSH1-050-lapras-vmax.jpg
 */
function expandDeck(deck) {
    let cards = [];

    for (let cardKey in deck) {
        let cardValue = deck[cardKey];
        for (let count = 0; count < cardValue.quantity; count++) {
            cards.push(cardValue.img);
        }
    }

    return cards;
}
