var battleDecks;
var profileId;
var deckImages = {
    player1: [],
    player2: [],
}
var gameState = {
    gameId: 0,
    player1: {},
    player2: {},
};
var cardGroups = [
    'deck',
    'hand-1',
    'hand-2',
    'discard',
    'active-pokemon',
    'bench-pokemon-1',
    'bench-pokemon-2',
    'bench-pokemon-3',
    'bench-pokemon-4',
    'bench-pokemon-5',
    'prize-cards',
    'stadium',
    'lost-zone'
];
var hoverIntentDelay = 400;
var hoverTimeout;
var pingInterval = 2000;
var pingTimeout = setInterval(
    () => { pingServerMessages(); },
    pingInterval
);

$(function() {
    let initialGameId = randomizeGameId();
    $('#game-id').val(initialGameId);
    $('.top.container').on('click', '#randomize-game-id', function() {
        $('#game-id').val(randomizeGameId());
    });
    
    $('body').on('click', 'button', function() {
        let operation = $(this).data('operation');
        if (!operation) {
            return;
        }

        if (operation == 'sitAtTable') {
            if (!getPlayerId('myself')) {
                return;
            }

            gameState.gameId = $('#game-id').val();

            sendGameMessage(
                getPlayerId('myself'),
                'judge',
                'load_game',
                gameState.gameId
            )
            .then(function(data) {
                gameState[getPlayerId('myself')] = data[getPlayerId('myself')];
                gameState[getPlayerId('opponent')] = data[getPlayerId('opponent')];
            });

            renderContainers([
                'deck',
                'hand 1',
                'hand 2',
                'pokemon',
                'stadium',
                'prize cards',
                'discard',
                'lost zone',
            ]);

            $('.border .action-expand').hide();
            $('.border')
            .off('click', '.collapse-control')
            .on('click', '.collapse-control', function() {
                $(this).parent().find('.collapse-control').toggle();
            });
            $('#this-game-id').html(gameState.gameId);

            renderDeckContainers();
            renderHandContainers();
            renderPokemonGroupContainers();
            renderOtherCardGroupContainers();
            renderPrizeCardContainers();

            $('.top.container > .row').toggleClass('d-none');

        }

        if (operation == 'shuffle') {
            let whichPlayer = $(this).data('player');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation,
                $(this).data('card-group')
            )
            .then(function() {
                alert('Your deck has been shuffled');
            });
        }

        if (operation == 'moveTop') {
            let moveFrom = $(this).data('from');
            let moveTo = $(this).data('to');
            let whichPlayer = $(this).data('player');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation,
                {
                    from: moveFrom,
                    to: moveTo
                }
            )
            .then(function(groups) {
                renderCardGroups(whichPlayer, groups);
            });
        }

        if (operation == 'tuck') {
            let whichPlayer = $(this).data('player');
            let cardGroup = $(this).data('card-group');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation,
                cardGroup
            )
            .then(function(data) {
                gameState[getPlayerId(whichPlayer)][cardGroup] = data;
                renderCardGroup(whichPlayer, cardGroup);
            });
        }

        if (operation == 'moveAll') {
            let moveFrom = $(this).data('from');
            let moveTo = $(this).data('to');
            let whichPlayer = $(this).data('player');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation,
                {
                    from: moveFrom,
                    to: moveTo
                }
            )
            .then(function(groups) {
                renderCardGroups(whichPlayer, groups);
            });
        }

        if (operation == 'flipCoin') {
            let rand = randomizeGameId();
            let result = (rand % 2 == 1) ? 'tails' :' heads';
            $('#coin-flip').html(`${result} (${rand})`);
        }

        if (operation == 'showPokemon') {
            let whichPlayer = $(this).data('player');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation
            )
            .then((groups) => {
                $(this).hide();
                gameState[getPlayerId(whichPlayer)].is_pokemon_hidden = false;
                alert('Your opponent can now see your Pokemon!');
            });
        }

        if (operation == 'pingServerMessages') {
            if (pingTimeout) {
                clearInterval(pingTimeout);
                pingTimeout = false;
                alert('Pinging disabled.');
                
                return;
            }

            pingTimeout = setInterval(
                () => { pingServerMessages(); },
                pingInterval
            );
            alert('Pinging enabled.');
        }

        if (operation == 'swapCardGroups') {
            let whichPlayer = $(this).data('player');
            let groupA = $(this).data('group-a');
            let groupB = $(this).data('group-b');

            sendGameMessage(
                getPlayerId(whichPlayer),
                'judge',
                operation,
                {
                    groupA: groupA,
                    groupB: groupB,
                }
            )
            .then(function(groups) {
                renderCardGroups(whichPlayer, groups);
            });
        }
    })
    .on('mouseenter', '.pokemon-card, #pokemonModal .deck-item img', function() {
        // @see https://stackoverflow.com/a/15576031
        // @see https://stackoverflow.com/a/20078582
        hoverTimeout = setTimeout(() => {
            $(this).addClass('hover');
        }, hoverIntentDelay);
    })
    .on('mouseleave', '.pokemon-card, #pokemonModal .deck-item img', function() {
        $(this).removeClass('hover');
        clearTimeout(hoverTimeout);
    });
});

function sendGameMessage(from, to, type, data) {
    var apiEndpoint = apiHome + '/send_game_message.php';
    return $.post(
        apiEndpoint,
        {
            gameId: gameState.gameId,
            from: from,
            to: to,
            type: type,
            data: data ?? {}
        },
        function (data) {
            return data;
        },
        'json'
    );
}

function expandIcon() {
    return `
        <svg class="bi bi-arrows-expand" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M2 8a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11A.5.5 0 012 8zm6-1.5a.5.5 0 00.5-.5V1.5a.5.5 0 00-1 0V6a.5.5 0 00.5.5z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M10.354 3.854a.5.5 0 000-.708l-2-2a.5.5 0 00-.708 0l-2 2a.5.5 0 10.708.708L8 2.207l1.646 1.647a.5.5 0 00.708 0zM8 9.5a.5.5 0 01.5.5v4.5a.5.5 0 01-1 0V10a.5.5 0 01.5-.5z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M10.354 12.146a.5.5 0 010 .708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L8 13.793l1.646-1.647a.5.5 0 01.708 0z" clip-rule="evenodd"/>
        </svg>
    `;
}
function collapseIcon() {
    return `
        <svg class="bi bi-arrows-collapse" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M2 8a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11A.5.5 0 012 8zm6-7a.5.5 0 01.5.5V6a.5.5 0 01-1 0V1.5A.5.5 0 018 1z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M10.354 3.646a.5.5 0 010 .708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L8 5.293l1.646-1.647a.5.5 0 01.708 0zM8 15a.5.5 0 00.5-.5V10a.5.5 0 00-1 0v4.5a.5.5 0 00.5.5z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M10.354 12.354a.5.5 0 000-.708l-2-2a.5.5 0 00-.708 0l-2 2a.5.5 0 00.708.708L8 10.707l1.646 1.647a.5.5 0 00.708 0z" clip-rule="evenodd"/>
        </svg>
    `;
}
var buttons = {
    expand: function(whichPlayer, cssClass) {
        return `
            <button
                class="btn btn-secondary btn-sm float-right collapse-control action-expand"
                type="button"
                data-toggle="collapse"
                data-target=".${whichPlayer} .${cssClass} .body"
                aria-expanded="true"
                aria-controls="collapse">
                ${expandIcon()}
            </button>
        `
    },
    collapse: function(whichPlayer, cssClass) {
        return `
            <button
                class="btn btn-secondary btn-sm float-right collapse-control action-collapse"
                type="button"
                data-toggle="collapse"
                data-target=".${whichPlayer} .${cssClass} .body"
                aria-expanded="true"
                aria-controls="collapse">
                ${collapseIcon()}
            </button>
        `;
    },
    moveSpecificCard: function(whichPlayer, from, to, label, reveal) {
        reveal = reveal ?? false;
        let revealStr = (reveal) ? 'true' :'false';

        return `
            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal"
                data-target="#pokemonModal" data-operation="gameMoveSpecificCard"
                data-which-player="${whichPlayer}" data-from="${from}" data-to="${to}"
                data-reveal="${revealStr}">
                ${label}
            </button>
        `
    },
    loadDeck: function(whichPlayer) {
        return `
            <button type="button" class="btn btn-warning" data-toggle="modal"
                data-target="#pokemonModal" data-operation="gameLoadDeck"
                data-player="${whichPlayer}">
                Load Deck
            </button>
        `;
    },
    shuffle: function(whichPlayer, cardGroup) {
        return `
            <button type="button" class="btn btn-primary" data-operation="shuffle"
                data-player="${whichPlayer}" data-card-group="${cardGroup}">
                Shuffle
            </button>
        `;
    },
    moveTop: function(whichPlayer, from, to, label) {
        return `
            <button type="button" class="btn btn-primary btn-sm" data-operation="moveTop"
                data-player="${whichPlayer}" data-from="${from}" data-to="${to}">
                ${label}
            </button>
        `;
    },
    tuck: function (whichPlayer, group, label) {
        return `
            <button type="button" class="btn btn-secondary btn-sm" data-operation="tuck"
                data-player="${whichPlayer}" data-card-group="${group}">
                ${label}
            </button>
        `;
    },
    moveAll: function(whichPlayer, from, to, label) {
        return `
            <button type="button" class="btn btn-danger btn-sm" data-operation="moveAll"
                data-player="${whichPlayer}" data-from="${from}" data-to="${to}">
                ${label}
            </button>
        `;
    },
    showPokemon: function(whichPlayer) {
        return `
            <button type="button" class="btn btn-outline-primary btn-sm" data-operation="showPokemon"
                data-player="${whichPlayer}">
                Show Pokemon
            </button>
        `;
    },
    modalRevealedCard: function(buttonId, cardIdx) {
        return `
            <button type="button" class="d-none" data-toggle="modal"
                data-target="#pokemonModal" data-operation="revealOpponentCard"
                data-opponent-card="${cardIdx}" id="revealCard-${buttonId}">
                Hidden Button
            </button>
        `;
    },
    switchWithActive: function(whichPlayer, benchGroup) {
        return `
            <button type="button" class="btn btn-outline-primary btn-sm" data-operation="swapCardGroups"
                data-player="${whichPlayer}" data-group-a="${benchGroup}" data-group-b="active-pokemon">
                Switch with Active
            </button>
        `;
    }
};

function renderContainers(labels) {
    let playerClass = ['myself', 'opponent'];
    let headingWeight = ['h2', 'h3'];

    for (let k in playerClass) {
        let whichPlayer = playerClass[k];
        let heading = headingWeight[k];

        for (let key in labels) {
            let label = labels[key];
            let cssClass = label.replace(/ /g, '-');
            // @see https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
            let title = label.charAt(0).toUpperCase() + label.slice(1)
    
            $(`.${whichPlayer} > .container`).append(`
                <div class="row">
                    <div class="col ${cssClass} border">
                        <div class="header">
                            <span class="${heading}">${title}</span>
                            ${buttons.expand(whichPlayer, cssClass)}
                            ${buttons.collapse(whichPlayer, cssClass)}
                        </div>
                        <div class="body collapse show">Nothing to see here!</div>
                    </div>
                </div>
            `);
        }
    }
}

function renderDeckContainers() {
    let playerClass = ['myself', 'opponent'];
    for (let key in playerClass) {
        let whichPlayer = playerClass[key];
        $(`.${whichPlayer} .deck .body`).html(`
            <div class="actions">
                ${buttons.loadDeck(whichPlayer)}
            </div>
            <div>Cards in deck: <span class="count">0</span></div> 
        `);

        if (whichPlayer == 'myself') {
            $(`.${whichPlayer} .deck .body .actions`).append(`${buttons.shuffle(whichPlayer, 'deck')}`);
        }
    }
}

function renderPrizeCardContainers() {
    let playerClass = ['myself', 'opponent'];
    for (let key in playerClass) {
        let whichPlayer = playerClass[key];

        $(`.${whichPlayer} .prize-cards .body`).html('');
        if (whichPlayer == 'myself') {
            $(`.${whichPlayer} .prize-cards .body`).append(`
                <div class="actions">
                    ${buttons.moveTop(whichPlayer, 'deck', 'prize-cards', 'Deal from deck')}
                    ${buttons.moveTop(whichPlayer, 'prize-cards', 'hand-1', 'Take a prize card')}
                </div>
            `);
        }
        $(`.${whichPlayer} .prize-cards .body`).append(`
            <div>Prize cards remaining: <span class="count">0</span></div> 
        `);
    }
}

function renderHandContainers() {
    let playerClass = ['myself', 'opponent'];
    for (let key in playerClass) {
        let whichPlayer = playerClass[key];
        for (let pos = 1; pos <= 2; pos++) {
            let cardGroup = `hand-${pos}`;
            renderHandContainer(whichPlayer, cardGroup);
        }
    }
}

function renderHandContainer(whichPlayer, cardGroup) {
    $(`.${whichPlayer} .${cardGroup} .body`).html('');
    if (whichPlayer == 'opponent') {
        $(`.${whichPlayer} .${cardGroup} .body`).append(`
                <div>Cards in hand: <span class="count">0</span></div> 
        `);
        
        return;
    }
    $(`.${whichPlayer} .${cardGroup} .body`).append(`
        <div class="actions">
            ${buttons.moveTop(whichPlayer, 'deck', cardGroup, 'Draw 1')}
            ${buttons.moveAll(whichPlayer, cardGroup, 'deck', 'Return to deck')}
        </div>
        <div class="count"></div>
        <div class="cards clearfix"></div>
    `);

    if (cardGroup == 'hand-1') { return; }

    $(`.${whichPlayer} .${cardGroup} .body .actions`).append(`
        ${buttons.moveSpecificCard(whichPlayer, 'hand-2', 'hand-1', 'Reveal and Keep 1', true)}
        ${buttons.moveSpecificCard(whichPlayer, 'hand-2', 'hand-1', 'Keep 1')}
        ${buttons.moveAll(whichPlayer, 'deck', cardGroup, 'Draw All')}
    `);
}

/**
 * "Other" card groups include the following:
 * - discard
 * - stadium
 * - lost zone
 */
function renderOtherCardGroupContainers() {
    let playerClass = ['myself', 'opponent'];
    let otherCardGroups = [
        'discard',
        'stadium',
        'lost-zone'
    ];
    for (let key in playerClass) {
        for (let k in otherCardGroups) {
            let group = otherCardGroups[k];
            let whichPlayer = playerClass[key];
            let $groupBody = $(`.${whichPlayer} .${group} .body`);

            $groupBody.html('');

            if (whichPlayer == 'myself') {
                $groupBody.append(`
                    <div class="actions">
                        ${buttons.moveSpecificCard(whichPlayer, 'hand-1', group, 'Choose from Hand 1')}
                        ${buttons.tuck(whichPlayer, group, 'Tuck')}
                        ${buttons.moveAll(whichPlayer, group, 'discard', 'Discard all')}
                        ${buttons.moveSpecificCard(whichPlayer, group, 'discard', 'Discard 1')}
                        ${buttons.moveSpecificCard(whichPlayer, group, 'lost-zone', 'Send to Lost Zone')}
                    </div>
                `);
            }

            $groupBody.append(`<div class="cards clearfix"></div>`);
        }
    }
}

function renderPokemonGroupContainers() {
    let playerClass = ['myself', 'opponent'];
    let cardGroups = [
        'active-pokemon',
        'bench-pokemon-1',
        'bench-pokemon-2',
        'bench-pokemon-3',
        'bench-pokemon-4',
        'bench-pokemon-5',
    ];

    for (let key in playerClass) {
        let whichPlayer = playerClass[key];
        let $groupBody = $(`.${whichPlayer} .pokemon .body`);
        $groupBody.html(``);
    
        for (let k in cardGroups) {
            let group = cardGroups[k];

            $groupBody.append(`
                <div class="${group} pokemon-item float-left border">
                    <div class="cards clearfix">
                        <div class="card-wrapper">
                            <button type="button" class="pokemon">
                                <img src="card-back.png" class="pokemon-card back"/>
                            </button>
                        </div>
                    </div>
                    Damage: <span class="count">0</span>
                </div>
            `);
        }
    }
}

function renderPokemonStatus($groupBody, whichPlayer, group) {
    $groupBody.append(`
        <div class="pokemon-stats">
            <h4>
                <label for="${whichPlayer}-${group}-damage-hp">Damage:</label>
                <input type="text" id="${whichPlayer}-${group}-damage-hp" readonly style="border:0; color:#f6931f; font-weight:bold;">
            </h4>
            <div class="slider" id="${whichPlayer}-${group}-damage-hp-range"></div>
            <h4>Special Conditions:</h4>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="${whichPlayer}-${group}-asleep" value="asleep" />
                <label class="form-check-label" for="${whichPlayer}-${group}-asleep">Asleep</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="${whichPlayer}-${group}-paralyzed" value="paralyzed" />
                <label class="form-check-label" for="${whichPlayer}-${group}-paralyzed">Paralyzed</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="${whichPlayer}-${group}-confused" value="confused" />
                <label class="form-check-label" for="${whichPlayer}-${group}-confused">Confused</label>
            </div>
            <br />
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="${whichPlayer}-${group}-poisoned" value="poisoned" />
                <label class="form-check-label" for="${whichPlayer}-${group}-poisoned">Poisoned</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="${whichPlayer}-${group}-burned" value="burned" />
                <label class="form-check-label" for="${whichPlayer}-${group}-burned">Burned</label>
            </div>
        </div>
    `);

    let $sliderDiv = $(`#${whichPlayer}-${group}-damage-hp-range`);
    let $sliderText = $(`#${whichPlayer}-${group}-damage-hp`);
    $sliderDiv.slider({
        range: true,
        min: 0,
        max: 40,
        values: [0, 0],
        slide: function (event, ui) {
            let damage = ui.values[0] * 10;
            let total_hp = ui.values[1] * 10;
            $sliderText.val(`${damage} / ${total_hp} HP`);
        }
    });
    
    let damage = $sliderDiv.slider("values", 0) * 10;
    let total_hp = $sliderDiv.slider("values", 1) * 10;
    $sliderText.val(`${damage} / ${total_hp} HP`);
}

function randomizeGameId() {
    // generate a random number between 100000 and 999999
    return Math.floor(Math.random() * 899999) + 100000; // roll a D144
}

function getPlayerId(mode) {
    let selectedValue = $('#player-select').val();
    if (selectedValue.substr(0, 6) != 'player') {
        alert('Please select a player before continuing');
        return false;
    }

    if (mode == 'myself') {
        return selectedValue;
    }

    if (selectedValue == 'player1') {
        return 'player2';
    }

    return 'player1';
}

function renderCardGroup(whichPlayer, group) {
    let groupData = gameState[getPlayerId(whichPlayer)][group] ?? {
        cards: [],
        count: 0
    };

    if (groupData.count || groupData.count === 0) {
        $(`.${whichPlayer} .${group} .count`).html(groupData.count);
        return;
    }

    $(`.${whichPlayer} .${group} .cards`).html('');
    for (let key in groupData.cards) {
        let cardIdx = groupData.cards[key];
        let img = deckImages[getPlayerId(whichPlayer)][cardIdx];

        if (group.match('pokemon')) {
            return renderPokemonCard(whichPlayer, group, img);
        }

        $(`.${whichPlayer} .${group} .cards`).append(`
            <div class="card-wrapper">
                <img src="sword and shield/${img}" class="pokemon-card front"/>
            </div>
        `);
    }
}

function renderPokemonCard(whichPlayer, group, imgSrc) {
    $(`.${whichPlayer} .${group} .cards`).html(`
        <div class="card-wrapper">
            <button type="button" class="pokemon" data-toggle="modal"
                data-target="#pokemonModal" data-operation="pokemonDetails"
                data-group="${group}" data-player="${whichPlayer}">
                <img src="sword and shield/${imgSrc}" class="pokemon-card front"/>
            </button>
        </div>
    `);
}

function renderCardGroups(whichPlayer, groups) {
    for (let groupKey in groups) {
        let thisGroup = groups[groupKey];
        gameState[getPlayerId(whichPlayer)][groupKey] = thisGroup;
        renderCardGroup(whichPlayer, groupKey);
    }
}

function pingServerMessages() {
    if (!gameState.gameId) { return; }

    let apiEndpoint = apiHome + '/get_game_messages.php';

    return $.getJSON(
        apiEndpoint,
        {
            gameId: gameState.gameId,
            recipient: getPlayerId('myself')
        },
        function(messages) {
            for (let key in messages) {
                let message = messages[key];
                processServerMessage(message);
            }
        }
    );
}

function processServerMessage(message) {
    if (message.type == 'renderCardGroup') {
        for (let cardGroup in message.data) {
            let value = message.data[cardGroup];
            gameState[getPlayerId('opponent')][cardGroup] = value;
            renderCardGroup('opponent', cardGroup);
            break; // only 1 iteration
        }

        return;
    }

    if (message.type == 'revealCard') {
        let buttonId = randomizeGameId();
        // create a button
        $('body').append(buttons.modalRevealedCard(buttonId, message.data));

        // click the button
        $(`#revealCard-${buttonId}`).click();

        // destroy the button
        $(`#revealCard-${buttonId}`).remove();
        
        return;
    }
}
