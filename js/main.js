let board_height = 8;
let gameover, threatened, turn, check, scale;

function createSquare(row, col, color) {
    $(`<div id="square-${row}-${col}" class="square" style="background-color: ${color};"></div>`).appendTo("#board");
}

function createBoard() {
    let colors = ["#333", "#ddd"];

    for (let i = 0; i < board_height; i++) {
        for(let u = 0; u < 8; u++) {
            createSquare(i, u, colors[(u + i) % 2]);
        }

        $("#board").append("<br>");
    }

    pieces = [];
    initializePieces("w");
    initializePieces("b");

    $(".square").click(e => {
        let square = $(e.currentTarget);

        if(lifted) {
            if(square.hasClass("highlight")) {
                lifted.moveTo(square);

                if(square.hasClass("castling")) {
                    let rook = square.data("castle-rook");

                    if(rook.col === 0) {
                        // Queenside castle
                        rook.moveTo(getSquare(rook.row, 3), true);
                    } else {
                        // Kingside castle
                        rook.moveTo(getSquare(rook.row, 5), true);
                    }
                }
            }

            unlift();
        }
    });
}

function nextTurn() {
    turn = turn === "w" ? "b" : "w";

    $(".piece.active").removeClass("active");
    $(`.piece.${turn}`).addClass("active");
    $("#turn").text(name(turn));
}

$(() => {
    createBoard();
    resetThreat();

    $("input[type=range]").on("input", e => {
        let el = $(e.currentTarget);
        el.next().text(el.val());
    });

    $("#scale").on("change", e => {
        document.documentElement.style.setProperty("--scale", e.currentTarget.value + "px");
    });

    $("#height").on("change", e => {
        board_height = e.currentTarget.value;
        $("#board").empty();
        createBoard();
    });

    $("#begin").click(e => {
        gameover = false;
        turn = null;
        $("#height").trigger("change");

        $("#check").empty();
        $("#pregame").hide();
        $("#turn-wrapper").show();
        
        nextTurn();
    });
});