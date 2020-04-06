var isAppReady = false;
var collection = [];
var profileId;
var wallet = 0;
var packsOpened = 0;
var cashAdded = 0;
var timeoutFunctions = [];
var apiHome = 'http://localhost:8000';

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
        var pack = generatePack();

        // add this pack to the collection
        $.each(pack, function(index, value) {
            collection.push({
                ...value,
                'quantity': 1
            });
        });
        saveProfile();

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
            if (i == 0) {
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
        collection = consolidatedCollection;

        activateSection('collection');
        renderCards(collection, 50, '#collection');
    });

    $('.section').on('mouseover', '.pokemon-card', function() {
        playSound('#whoosh');
    });

    $('.add-cash').click(function() {
        var amountToAdd = parseInt($(this).attr('id').substring(7)); // e.g.: dollar-5 becomes 5
        cashAdded += amountToAdd;
        wallet += amountToAdd;
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
                activateSection('collection');
                renderCards(collection, 50, '#collection');
            }
        );
    });

    loadCards('SSH');
});

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
        cashAdded: cashAdded,
        collection: collection
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
                    <img src="sword and shield/${value.img}" class="${value.rarity} pokemon-card front" />
                    <br />
                    <span class="rarity">${value.rarity}</span>
                    ${quantitySpan}
                </div>
            `);
            playSound();
        }, time));
        time += timeInterval;
    });
}

function generatePack() {
    var pack = [];

    // 1 random energy
    const energyCardsClone = [...energyCards];
    pack.push({
        'img': '00 energy/' + energyCardsClone[Math.floor(Math.random() * energyCardsClone.length)],
        'rarity': 'energy'
    });

    // 5 random common cards
    var commonCardsClone = [...commonCards];
    commonCardsClone = shuffle(commonCardsClone);
    for (var i = 0; i < 5; i++) {
        pack.push({
            'img': '01 common/' + commonCardsClone.pop(),
            'rarity': 'common'
        });
    }

    // 3 random uncommon cards
    var uncommonCardsClone = [...uncommonCards];
    uncommonCardsClone = shuffle(uncommonCardsClone);
    for (var i = 0; i < 3; i++) {
        pack.push({
            'img': '02 uncommon/' + uncommonCardsClone.pop(),
            'rarity': 'uncommon'
        });
    }

    // 1 random rare card of varying rarity
    var rareCardsClone = {};
    Object.assign(rareCardsClone, rareCards);
    var rarityKey = determineRarity();
    $('#status-message').html(`You got a ${rarityKey.substring(3)} card!`);
    console.log(`Your rare card was a: ${rarityKey}!`);
    rareCardsClone = rareCardsClone[rarityKey];
    pack.push({
        'img': rarityKey + '/' + rareCardsClone[Math.floor(Math.random() * rareCardsClone.length)],
        'rarity': rarityKey.substring(3),
    });

    return pack;
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
 * - rare holo (1 in every 4 packs)
 * - rare ultra (1 in every 8 packs)
 * - rare secret (1 in every 72 packs)
 */
function determineRarity() {
    var rand = Math.floor(Math.random() * 4) + 1; // roll a D4
    if (rand <= 3) {
        return '03 rare';
    }

    var rand = Math.floor(Math.random() * 3) + 1; // flip a D3
    if (rand <= 2) {
        return '04 rare holo';
    }

    var rand = Math.floor(Math.random() * 9) + 1; // roll a D9
    if (rand <= 8) {
        return '05 rare ultra';
    }

    return '06 rare secret';
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
}
