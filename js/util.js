function name(color) {
    return color === "w" ? "White" : "Black";
}

function swap(color) {
    return color === "w" ? "b" : "w";
}

function inBounds(row, col) {
    return col >= 0 && col <= 7 && row >= 0 && row <= board_height - 1;
}

function getPiece(row, col) {
    return pieces.find(p => p.row === row && p.col === col);
}

function getSquare(row, col) {
    return $(`#square-${row}-${col}`);
}

function isThreatened(color, row, col) {
    return threatened[swap(color)].indexOf(`${row}-${col}`) > -1;
}

function clearPath(color, row, col) {
    return inBounds(row, col) && !getPiece(row, col) && !isThreatened(color, row, col);
}

function resetThreat() {
    threatened = { w: [], b: [] };

    for (let i = 0; i < pieces.length; i++) {
        pieces[i].scan(pieces[i].threaten.bind(pieces[i]));
    }
}

function checkForCheck(color) {
    let king = pieces.find(p => p.type === "k" && p.color === color);
    let checkmate = true;

    if(isThreatened(color, king.row, king.col)) {
        $("#check").text(`${name(color)}'s king is in check.`);

        // Check if king has any legal moves
        // (there's probably a better way to do this)
        for (let i = -1; i <= 1; i++) {
            checkmate = checkmate && !clearPath(color, king.row - 1, king.col + i);
            checkmate = checkmate && !clearPath(color, king.row + 1, king.col + i);
        }
        
        checkmate = checkmate && !clearPath(color, king.row, king.col - 1);
        checkmate = checkmate && !clearPath(color, king.row, king.col + 1);

        if(checkmate) {
            gameover = true;
            $("#check").text(`${name(swap(color))} wins.`);
            $("#turn-wrapper").hide();
            $("#pregame").show();
            $(".active").removeClass("active");
        }
    }
}

function unlift() {
    lifted = false;
    $(".highlight").removeClass("highlight capture castling");
}

function highlightMove(start_piece, row, col, restrict, castle_rook) {
    let valid = true;
    let { color } = start_piece;

    if(inBounds(row, col)) {
        let square = getSquare(row, col);
        let piece = square.getPiece();

        if(restrict === "safe" && isThreatened(color, row, col)) {
            valid = false;
        } else {
            if(piece) {
                if(piece.color === swap(color) && restrict !== "move") {
                    square.addClass("capture");
                } else {
                    valid = false;
                }

                if(restrict === "move") {
                    valid = false;
                }
            } else if(restrict === "capture") {
                valid = false;
            }
        }

        if(valid) {
            square.addClass("highlight");
        }

        if(castle_rook) {
            square.addClass("castling").data("castle-rook", castle_rook);
        }
    }
}

function ray(start_piece, dir, fn) {
    let { color, row, col } = start_piece;
    let row_inc = 0;
    let col_inc = 0;
    let piece;

    switch(dir) {
        case "left":  col_inc = -1; break;
        case "right": col_inc = 1;  break;
        case "up":    row_inc = -1; break;
        case "down":  row_inc = 1;  break;

        case "up-left":    row_inc = -1; col_inc = -1; break;
        case "up-right":   row_inc = -1; col_inc = 1;  break;
        case "down-left":  row_inc = 1;  col_inc = -1; break;
        case "down-right": row_inc = 1;  col_inc = 1;  break;
    }

    while(!piece && inBounds(row, col)) {
        row += row_inc;
        col += col_inc;

        fn(start_piece, row, col);
        piece = getPiece(row, col);
    }
}

$.fn.boardPos = function() {
    let split_id = this.attr("id").split("-");
    return [+split_id[1], +split_id[2]];
};

$.fn.getPiece = function() {
    return getPiece(...this.boardPos());
};