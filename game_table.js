var battleDecks;
var profileId;
var gameState = {
    gameId: randomizeGameId(),
    player1: {
        deckImages: [],
        hand: [],
    },
    player2: {
        deckImages: [],
        hand: [],
    }
};

$(function() {
    $('#game-id').val(randomizeGameId());
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
                gameState[getPlayerId('myself')].hand = data[getPlayerId('myself')].hand;
            });

            renderContainers([
                'deck',
                'discard',
                'hand',
                'active pokemon',
                'benched pokemon',
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
        
            renderDeckContainers();
            renderHandContainers();

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
            .then(function(cardIdx) {
                gameState[getPlayerId(whichPlayer)].hand.push(cardIdx);
                renderHandCards(whichPlayer);
            });
        }
    });
});

function renderHandCards(whichPlayer) {
    $(`.${whichPlayer} .hand .cards`).html('');
    for (let key in gameState[getPlayerId(whichPlayer)].hand.cards) {
        let cardIdx = gameState[getPlayerId(whichPlayer)].hand.cards[key];
        let img = gameState[getPlayerId(whichPlayer)].deckImages[cardIdx];
        $(`.${whichPlayer} .hand .cards`).append(`
            <div class="card-wrapper">
                <img src="sword and shield/${img}" class="pokemon-card front"/>
            </div>
        `);
    }
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

function renderContainers(labels) {
    let playerClass = ['myself', 'opponent'];
    let headingWeight = ['h2', 'h3'];

    for (let k in playerClass) {
        let player = playerClass[k];
        let heading = headingWeight[k];

        for (let key in labels) {
            let label = labels[key];
            let cssClass = label.replace(' ', '-');
            // @see https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
            let title = label.charAt(0).toUpperCase() + label.slice(1)
    
            $(`.${player} > .container`).append(`
                <div class="row">
                    <div class="col ${cssClass} border">
                        <div class="header">
                            <span class="${heading}">${title}</span>
                            <button
                                class="btn btn-secondary btn-sm float-right collapse-control action-expand"
                                type="button"
                                data-toggle="collapse"
                                data-target=".${player} .${cssClass} .body"
                                aria-expanded="true"
                                aria-controls="collapse">
                                ${expandIcon()}
                            </button>
                            <button
                                class="btn btn-secondary btn-sm float-right collapse-control action-collapse"
                                type="button"
                                data-toggle="collapse"
                                data-target=".${player} .${cssClass} .body"
                                aria-expanded="true"
                                aria-controls="collapse">
                                ${collapseIcon()}
                            </button>
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
        let value = playerClass[key];
        $(`.${value} .deck .body`).html(`
            <div class="actions">
                <button type="button" class="btn btn-warning" data-toggle="modal"
                    data-target="#pokemonModal" data-operation="gameLoadDeck"
                    data-player="${value}">
                    Load Deck
                </button>
                <button type="button" class="btn btn-primary" data-operation="shuffle"
                    data-player="${value}" data-card-group="deck">
                    Shuffle
                </button>
            </div>
            <div>Cards in deck: <span class="count">0</span></div> 
        `);
    }
}

function renderHandContainers() {
    let playerClass = ['myself', 'opponent'];
    for (let key in playerClass) {
        let value = playerClass[key];
        $(`.${value} .hand .body`).html(`
            <div class="actions">
                <button type="button" class="btn btn-primary" data-operation="moveTop"
                    data-player="${value}" data-from="deck" data-to="hand">
                    Move 1 from deck
                </button>
            </div>
            <div class="cards"></div>
        `);
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
