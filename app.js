var collection = [];
var profileId;
var wallet = 0;
var packsOpened = 0;
var cashAdded = 0;
var timeoutFunctions = [];
var apiHome = 'http://localhost:8000';
var energyCards = [
    'en-US-SWSH-Energy-001-grass-energy.jpg',
    'en-US-SWSH-Energy-002-fire-energy.jpg',
    'en-US-SWSH-Energy-003-water-energy.jpg',
    'en-US-SWSH-Energy-004-lightning-energy.jpg',
    'en-US-SWSH-Energy-005-psychic-energy.jpg',
    'en-US-SWSH-Energy-006-fighting-energy.jpg',
    'en-US-SWSH-Energy-007-darkness-energy.jpg',
    'en-US-SWSH-Energy-008-metal-energy.jpg',
    'en-US-SWSH-Energy-009-fairy-energy.jpg'
];

var commonCards = [
    'en-US-SWSH1-002-roselia.jpg',
    'en-US-SWSH1-003-roselia.jpg',
    'en-US-SWSH1-005-cottonee.jpg',
    'en-US-SWSH1-007-maractus.jpg',
    'en-US-SWSH1-010-grookey.jpg',
    'en-US-SWSH1-011-grookey.jpg',
    'en-US-SWSH1-016-blipbug.jpg',
    'en-US-SWSH1-017-blipbug.jpg',
    'en-US-SWSH1-020-gossifleur.jpg',
    'en-US-SWSH1-022-vulpix-1.jpg',
    'en-US-SWSH1-027-salandit.jpg',
    'en-US-SWSH1-030-scorbunny.jpg',
    'en-US-SWSH1-031-scorbunny.png',
    'en-US-SWSH1-037-sizzlipede.jpg',
    'en-US-SWSH1-038-sizzlipede.jpg',
    'en-US-SWSH1-040-shellder.jpg',
    'en-US-SWSH1-042-krabby.jpg',
    'en-US-SWSH1-043-krabby.jpg',
    'en-US-SWSH1-045-goldeen.jpg',
    'en-US-SWSH1-046-goldeen.jpg',
    'en-US-SWSH1-054-sobble.jpg',
    'en-US-SWSH1-055-sobble.jpg',
    'en-US-SWSH1-060-chewtle.jpg',
    'en-US-SWSH1-063-snom.jpg',
    'en-US-SWSH1-065-pikachu.jpg',
    'en-US-SWSH1-067-chinchou.jpg',
    'en-US-SWSH1-068-chinchou.jpg',
    'en-US-SWSH1-070-joltik.jpg',
    'en-US-SWSH1-073-yamper.jpg',
    'en-US-SWSH1-074-yamper.jpg',
    'en-US-SWSH1-077-pincurchin.jpg',
    'en-US-SWSH1-081-galarian-ponyta.jpg',
    'en-US-SWSH1-083-gastly.jpg',
    'en-US-SWSH1-087-munna.jpg',
    'en-US-SWSH1-089-sinistea.jpg',
    'en-US-SWSH1-092-diglett.jpg',
    'en-US-SWSH1-096-rhyhorn.jpg',
    'en-US-SWSH1-097-rhyhorn.jpg',
    'en-US-SWSH1-101-baltoy.jpg',
    'en-US-SWSH1-102-baltoy.jpg',
    'en-US-SWSH1-105-mudbray.jpg',
    'en-US-SWSH1-107-silicobra.jpg',
    'en-US-SWSH1-108-silicobra.jpg',
    'en-US-SWSH1-111-clobbopus.jpg',
    'en-US-SWSH1-112-clobbopus.jpg',
    'en-US-SWSH1-117-galarian-zigzagoon.jpg',
    'en-US-SWSH1-121-skorupi.jpg',
    'en-US-SWSH1-123-croagunk.jpg',
    'en-US-SWSH1-125-nickit.jpg',
    'en-US-SWSH1-127-galarian-meowth.jpg',
    'en-US-SWSH1-129-mawile.jpg',
    'en-US-SWSH1-130-ferroseed.jpg',
    'en-US-SWSH1-133-pawniard.jpg',
    'en-US-SWSH1-136-cufant.jpg',
    'en-US-SWSH1-143-hoothoot.jpg',
    'en-US-SWSH1-145-minccino.jpg',
    'en-US-SWSH1-146-minccino.jpg',
    'en-US-SWSH1-150-rookidee.jpg',
    'en-US-SWSH1-152-wooloo.jpg',
    'en-US-SWSH1-153-wooloo.jpg'
];

var uncommonCards = [
    'en-US-SWSH1-012-thwackey.jpg',
    'en-US-SWSH1-013-thwackey.jpg',
    'en-US-SWSH1-018-dottler.jpg',
    'en-US-SWSH1-021-eldegoss.jpg',
    'en-US-SWSH1-026-heatmor.jpg',
    'en-US-SWSH1-028-salazzle.jpg',
    'en-US-SWSH1-032-raboot.jpg',
    'en-US-SWSH1-033-raboot.jpg',
    'en-US-SWSH1-044-kingler.jpg',
    'en-US-SWSH1-047-seaking.jpg',
    'en-US-SWSH1-051-qwilfish.jpg',
    'en-US-SWSH1-052-mantine.jpg',
    'en-US-SWSH1-056-drizzile.jpg',
    'en-US-SWSH1-057-drizzile.jpg',
    'en-US-SWSH1-071-galvantula.jpg',
    'en-US-SWSH1-084-haunter.jpg',
    'en-US-SWSH1-093-dugtrio.jpg',
    'en-US-SWSH1-094-hitmonlee.jpg',
    'en-US-SWSH1-095-hitmonchan.jpg',
    'en-US-SWSH1-098-rhydon.jpg',
    'en-US-SWSH1-100-sudowoodo.jpg',
    'en-US-SWSH1-118-galarian-linoone.jpg',
    'en-US-SWSH1-131-ferrothorn.jpg',
    'en-US-SWSH1-132-galarian-stunfisk.jpg',
    'en-US-SWSH1-134-bisharp.jpg',
    'en-US-SWSH1-151-corvisquire.jpg',
    'en-US-SWSH1-154-dubwool.jpg',
    'en-US-SWSH1-156-air-balloon.jpg',
    'en-US-SWSH1-157-bede.jpg',
    'en-US-SWSH1-158-big-charm.jpg',
    'en-US-SWSH1-159-crushing-hammer.jpg',
    'en-US-SWSH1-160-energy-retrieval.jpg',
    'en-US-SWSH1-161-energy-search.jpg',
    'en-US-SWSH1-162-energy-switch.jpg',
    'en-US-SWSH1-163-evolution-incense.jpg',
    'en-US-SWSH1-164-great-ball.jpg',
    'en-US-SWSH1-165-hop.jpg',
    'en-US-SWSH1-166-hyper-potion.jpg',
    'en-US-SWSH1-167-lucky-egg.jpg',
    'en-US-SWSH1-168-lum-berry.jpg',
    'en-US-SWSH1-170-metal-saucer.jpg',
    'en-US-SWSH1-171-ordinary-rod.jpg',
    'en-US-SWSH1-172-pal-pad.jpg',
    'en-US-SWSH1-173-poke-kid.jpg',
    'en-US-SWSH1-174-pokegear-30.jpg',
    'en-US-SWSH1-175-pokemon-catcher.jpg',
    'en-US-SWSH1-176-pokemon-center-lady.jpg',
    'en-US-SWSH1-177-potion.jpg',
    'en-US-SWSH1-179-quick-ball.jpg',
    'en-US-SWSH1-180-rare-candy.jpg',
    'en-US-SWSH1-181-rotom-bike.jpg',
    'en-US-SWSH1-182-sitrus-berry.jpg',
    'en-US-SWSH1-183-switch.jpg',
    'en-US-SWSH1-184-team-yell-grunt.jpg',
    'en-US-SWSH1-185-vitality-band.jpg',
    'en-US-SWSH1-186-aurora-energy.jpg'
];

var rareCards = {
    '03 rare': [
        'en-US-SWSH1-004-roserade.jpg',
        'en-US-SWSH1-006-whimsicott.jpg',
        'en-US-SWSH1-008-durant.jpg',
        'en-US-SWSH1-014-rillaboom.jpg',
        'en-US-SWSH1-015-rillaboom.jpg',
        'en-US-SWSH1-019-orbeetle.jpg',
        'en-US-SWSH1-023-ninetales.jpg',
        'en-US-SWSH1-029-turtonator.jpg',
        'en-US-SWSH1-034-cinderace.jpg',
        'en-US-SWSH1-035-cinderace.jpg',
        'en-US-SWSH1-036-cinderace.jpg',
        'en-US-SWSH1-039-centiskorch.jpg',
        'en-US-SWSH1-041-cloyster.jpg',
        'en-US-SWSH1-048-lapras.jpg',
        'en-US-SWSH1-058-inteleon.jpg',
        'en-US-SWSH1-059-inteleon.jpg',
        'en-US-SWSH1-061-drednaw.jpg',
        'en-US-SWSH1-062-cramorant.jpg',
        'en-US-SWSH1-064-frosmoth.jpg',
        'en-US-SWSH1-066-raichu.jpg',
        'en-US-SWSH1-069-lanturn.jpg',
        'en-US-SWSH1-075-boltund.jpg',
        'en-US-SWSH1-076-boltund.jpg',
        'en-US-SWSH1-078-morpeko.jpg',
        'en-US-SWSH1-082-galarian-rapidash.jpg',
        'en-US-SWSH1-085-gengar.jpg',
        'en-US-SWSH1-088-musharna.jpg',
        'en-US-SWSH1-090-polteageist.jpg',
        'en-US-SWSH1-099-rhyperior.jpg',
        'en-US-SWSH1-103-claydol.jpg',
        'en-US-SWSH1-106-mudsdale.jpg',
        'en-US-SWSH1-109-sandaconda.jpg',
        'en-US-SWSH1-110-sandaconda.jpg',
        'en-US-SWSH1-113-grapploct.jpg',
        'en-US-SWSH1-114-stonjourner.jpg',
        'en-US-SWSH1-128-galarian-perrserker.jpg',
        'en-US-SWSH1-135-corviknight.jpg',
        'en-US-SWSH1-137-copperajah.jpg',
        'en-US-SWSH1-140-snorlax.jpg',
        'en-US-SWSH1-144-noctowl.jpg',
        'en-US-SWSH1-147-cinccino.jpg',
        'en-US-SWSH1-148-oranguru.jpg',
        'en-US-SWSH1-149-drampa.jpg'
    ],
    '04 rare holo': [
        'en-US-SWSH1-001-celebi-v.jpg',
        'en-US-SWSH1-009-dhelmise-v.jpg',
        'en-US-SWSH1-024-torkoal-v.jpg',
        'en-US-SWSH1-025-victini-v.jpg',
        'en-US-SWSH1-049-lapras-v.jpg',
        'en-US-SWSH1-050-lapras-vmax.jpg',
        'en-US-SWSH1-053-keldeo-v.jpg',
        'en-US-SWSH1-072-tapu-koko-v.jpg',
        'en-US-SWSH1-079-morpeko-v.jpg',
        'en-US-SWSH1-080-morpeko-vmax.jpg',
        'en-US-SWSH1-086-wobbuffet-v.jpg',
        'en-US-SWSH1-091-indeedee-v.jpg',
        'en-US-SWSH1-104-regirock-v.jpg',
        'en-US-SWSH1-115-stonjourner-v.jpg',
        'en-US-SWSH1-116-stonjourner-vmax.jpg',
        'en-US-SWSH1-119-galarian-obstagoon.jpg',
        'en-US-SWSH1-120-sableye-v.jpg',
        'en-US-SWSH1-122-drapion.jpg',
        'en-US-SWSH1-124-toxicroak.jpg',
        'en-US-SWSH1-126-thievul.jpg',
        'en-US-SWSH1-138-zacian-v.jpg',
        'en-US-SWSH1-139-zamazenta-v.jpg',
        'en-US-SWSH1-141-snorlax-v.jpg',
        'en-US-SWSH1-142-snorlax-vmax.jpg',
        'en-US-SWSH1-155-cramorant-v.jpg',
        'en-US-SWSH1-169-marnie.jpg',
        'en-US-SWSH1-178-professors-research.jpg'
    ],
    '05 rare ultra': [
        'en-US-SWSH1-187-dhelmise-v.jpg',
        'en-US-SWSH1-188-torkoal-v.jpg',
        'en-US-SWSH1-189-lapras-v.jpg',
        'en-US-SWSH1-190-morpeko-v.jpg',
        'en-US-SWSH1-191-wobbuffet-v.jpg',
        'en-US-SWSH1-192-indeedee-v.jpg',
        'en-US-SWSH1-193-stonjourner-v.jpg',
        'en-US-SWSH1-194-sableye-v.jpg',
        'en-US-SWSH1-195-zacian-v.jpg',
        'en-US-SWSH1-196-zamazenta-v.jpg',
        'en-US-SWSH1-197-snorlax-v.jpg',
        'en-US-SWSH1-198-cramorant-v.jpg',
        'en-US-SWSH1-199-bede.jpg',
        'en-US-SWSH1-200-marnie.jpg',
        'en-US-SWSH1-201-professors-research.jpg',
        'en-US-SWSH1-202-team-yell-grunt-1.jpg'
    ],
    '06 rare secret': [
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
    ],
};

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
});

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
