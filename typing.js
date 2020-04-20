var isGameStarted = false;
var startTime;
var intervalFunctions = [];
var cards = [];
var charsCorrect = 0;
var charsCompleted = 0;
var cardsCompleted = 0;

$(function () {
    loadTypingCards();

    $(document).on('keypress', function(event) {
        beginGame();
    })
});

function beginGame() {
    if (!isGameStarted) {
        isGameStarted = true;
        startTime = Date.now();
        intervalFunctions.push(setInterval(() => {
            const timer = Date.now() - startTime;
            $('.main.container .col .timer').html(`${Math.round(timer / 1000)}`);
        }, 1000));
    }
}

function loadTypingCards() {
    const apiEndpoint = apiHome + '/load_typing_cards.php';
        
    $.getJSON(
        apiEndpoint,
        function(data) {
            cards = data;
            renderTypingCard(cards.pop());
        }
    );
}

function renderTypingCard(card) {
    $('.main.container .col .card-item').html(`
        <img src="cards/${card.expansionSet}/${card.imgSrc}" class="pokemon-card" />
    `);
    $('.main.container .col .target .letters').html(card.cardName.toLowerCase());
    $('.main.container .col .keyboard-input .letters').html('');
    $('.main.container .col .keyboard-input').width(
        $('.main.container .col .target .letters').width()
    );
}
