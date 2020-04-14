var battleDecks;
var profileId;
var gameState = {
    gameId: 0,
    player1: {},
    player2: {},
};
var cardGroups = [
    'deck',
    'hand',
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
            if (!getPlayerId()) {
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
                for (let key in cardGroups) {
                    let cardGroup = cardGroups[key];
                    gameState[getPlayerId('myself')][cardGroup] = data[getPlayerId('myself')][cardGroup];
                }
            });

            renderContainers([
                'deck',
                'hand',
                'discard',
                'active pokemon',
                'bench pokemon 1',
                'bench pokemon 2',
                'bench pokemon 3',
                'bench pokemon 4',
                'bench pokemon 5',
                'prize cards',
                'stadium',
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
            renderOtherCardGroupContainers();
            renderPrizeCardContainers();

            $('.top.container > .row').toggle();

        }

        if (operation == 'shuffle') {
            sendGameMessage(
                getPlayerId($(this).data('player')),
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
    })
    .on('mouseenter', '.pokemon-card', function() {
        // @see https://stackoverflow.com/a/15576031
        // @see https://stackoverflow.com/a/20078582
        hoverTimeout = setTimeout(() => {
            console.log('over');
            $(this).addClass('hover');
        }, hoverIntentDelay);
    })
    .on('mouseleave', '.pokemon-card', function() {
        console.log('out');
        $(this).removeClass('hover');
        clearTimeout(hoverTimeout);
    });
});

function renderHandCards(whichPlayer) {
    renderCardGroup(whichPlayer, 'hand');
}

function sendGameMessage(from, to, type, data) {
    var apiEndpoint = apiHome + '/send_game_message.php';
    return $.post(
        apiEndpoint,
        {
            gameId: gameState.gameId,
            from: from,
            to: to,
            type: type,
            data: data ?? ''
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
    moveSpecificCard: function(whichPlayer, from, to, label) {
        return `
            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal"
                data-target="#pokemonModal" data-operation="gameMoveSpecificCard"
                data-which-player="${whichPlayer}" data-from="${from}" data-to="${to}">
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
            <button type="button" class="btn btn-outline-secondary btn-sm" data-operation="tuck"
                data-player="${whichPlayer}" data-card-group="${group}">
                ${label}
            </button>
        `;
    },
    moveAll: function(whichPlayer, from, to, label) {
        return `
            <button type="button" class="btn btn-outline-danger btn-sm" data-operation="moveAll"
                data-player="${whichPlayer}" data-from="${from}" data-to="${to}">
                ${label}
            </button>
        `;
    },
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
                ${buttons.shuffle(whichPlayer, 'deck')}
            </div>
            <div>Cards in deck: <span class="count">0</span></div> 
        `);
    }
}

function renderPrizeCardContainers() {
    let playerClass = ['myself', 'opponent'];
    for (let key in playerClass) {
        let whichPlayer = playerClass[key];
        $(`.${whichPlayer} .prize-cards .body`).html(`
            <div class="actions">
            ${buttons.moveTop(whichPlayer, 'deck', 'prize-cards', 'Deal from deck')}
            </div>
            <div>Cards in deck: <span class="count">0</span></div> 
        `);
    }
}

function renderHandContainers() {
    let playerClass = ['myself'];
    for (let key in playerClass) {
        let whichPlayer = playerClass[key];
        $(`.${whichPlayer} .hand .body`).html(`
            <div class="actions">
                ${buttons.moveTop(whichPlayer, 'deck', 'hand', 'Deal from deck')}
                ${buttons.moveAll(whichPlayer, 'hand', 'deck', 'Return to deck')}
            </div>
            <div class="cards"></div>
        `);
    }
}

/**
 * "Other" card groups include the following:
 * - discard
 * - active pokemon
 * - bench pokemon (multiple)
 * - stadium
 * - lost zone
 */
function renderOtherCardGroupContainers() {
    let playerClass = ['myself', 'opponent'];
    let otherCardGroups = [
        'discard',
        'active-pokemon',
        'bench-pokemon-1',
        'bench-pokemon-2',
        'bench-pokemon-3',
        'bench-pokemon-4',
        'bench-pokemon-5',
        'stadium',
        'lost-zone'
    ];
    for (let key in playerClass) {
        for (let k in otherCardGroups) {
            let group = otherCardGroups[k];
            let whichPlayer = playerClass[key];
            
            $(`.${whichPlayer} .${group} .body`).html('');
            if (whichPlayer == 'myself') {
                $(`.${whichPlayer} .${group} .body`).append(`
                    <div class="actions">
                        ${buttons.moveSpecificCard(whichPlayer, 'hand', group, 'Choose from hand')}
                        ${buttons.tuck(whichPlayer, group, 'Tuck')}
                        ${buttons.moveAll(whichPlayer, group, 'discard', 'Discard all')}
                    </div>
                `);
            }

            $(`.${whichPlayer} .${group} .body`).append(`
                <div class="cards"></div>
            `);
        }

        
    }
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

    if (group == 'deck') {
        $(`.${whichPlayer} .${group} .count`).html(groupData.count);
        return;
    }

    if (group == 'prize-cards') {
        $(`.${whichPlayer} .${group} .count`).html(groupData.count);
        return;
    }

    $(`.${whichPlayer} .${group} .cards`).html('');
    for (let key in groupData.cards) {
        let cardIdx = groupData.cards[key];
        let img = gameState[getPlayerId(whichPlayer)].deckImages[cardIdx];
        $(`.${whichPlayer} .${group} .cards`).append(`
            <div class="card-wrapper">
                <img src="sword and shield/${img}" class="pokemon-card front"/>
            </div>
        `);
    }
}

function renderCardGroups(whichPlayer, groups) {
    for (let groupKey in groups) {
        let thisGroup = groups[groupKey];
        gameState[getPlayerId(whichPlayer)][groupKey] = thisGroup;
        renderCardGroup(whichPlayer, groupKey);
    }
}
