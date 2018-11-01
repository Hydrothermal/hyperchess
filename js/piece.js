let lifted = false; // currently clicked piece
let pieces;

class Piece {
    constructor(type, color, row, col) {
        pieces.push(this);

        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
        this.has_moved = false;

        this.draw();
    }

    draw() {
        this.el = $(`<img class="piece ${this.color}" src="img/${this.color}${this.type}.svg" />`).appendTo(`#square-${this.row}-${this.col}`);
        this.el.click(this.click.bind(this));
    }

    capturable() {
        return this.el.parent().hasClass("capture");
    }

    threaten(start_piece, row, col, restrict) {
        let { color } = start_piece;

        if(inBounds(row, col) && restrict !== "move") {
            let colored_threats = threatened[this.color];
            let coords = `${row}-${col}`;

            if(colored_threats.indexOf(coords) === -1) {
                colored_threats.push(coords);
            }
        }
    }

    click(e) {
        if(!gameover && this.color === turn && !this.capturable()) {
            e.stopPropagation();
            unlift();
            lifted = this;

            this.scan(highlightMove);
        }
    }

    scan(fn) {
        this.threatening = [];

        switch(this.type) {
            case "p":
            let direction = this.color === "w" ? 1 : -1;
            let step = this.row + (1 * direction);

            fn(this, step, this.col, "move");
            fn(this, step, this.col - 1, "capture");
            fn(this, step, this.col + 1, "capture");

            if(!this.has_moved && !getPiece(step, this.col)) {
                fn(this, this.row + (2 * direction), this.col, "move");
            }
            break;

            case "r":
            ray(this, "right", fn);
            ray(this, "left", fn);
            ray(this, "up", fn);
            ray(this, "down", fn);
            break;

            case "n":
            for (let i = -1; i <= 1; i += 2) {
                for (let u = -2; u <= 2; u += 4) {
                    fn(this, this.row + u, this.col + i);
                    fn(this, this.row + i, this.col + u);
                }
            }
            break;

            case "b":
            ray(this, "up-left", fn);
            ray(this, "up-right", fn);
            ray(this, "down-left", fn);
            ray(this, "down-right", fn);
            break;

            case "q":
            ray(this, "right", fn);
            ray(this, "left", fn);
            ray(this, "up", fn);
            ray(this, "down", fn);

            ray(this, "up-left", fn);
            ray(this, "up-right", fn);
            ray(this, "down-left", fn);
            ray(this, "down-right", fn);
            break;

            case "k":
            for (let i = -1; i <= 1; i++) {
                fn(this, this.row - 1, this.col + i, "safe");
                fn(this, this.row + 1, this.col + i, "safe");
            }
            
            fn(this, this.row, this.col - 1, "safe");
            fn(this, this.row, this.col + 1, "safe");

            // Castling
            if(!this.has_moved && !isThreatened(this.color, this.row, this.col)) {
                let qside = getPiece(this.row, 0);
                let kside = getPiece(this.row, 7);

                if(qside && !qside.has_moved && clearPath(this.color, this.row, 2) && clearPath(this.color, this.row, 3)) {
                    fn(this, this.row, 2, null, qside);
                }

                if(kside && !kside.has_moved && clearPath(this.color, this.row, 5) && clearPath(this.color, this.row, 6)) {
                    fn(this, this.row, 6, null, kside);
                }
            }
            break;
        }
    }

    moveTo(square, auto) {
        let [row, col] = square.boardPos();
        let target_piece = square.getPiece();

        if(target_piece) {
            target_piece.capture();
        }
        
        check = false;
        $("#check").text("");

        this.has_moved = true;
        this.row = row;
        this.col = col;
        this.el.appendTo(square);

        resetThreat();
        checkForCheck("w");
        checkForCheck("b");

        if(!auto && !gameover) { nextTurn(); }
    }

    capture() {
        this.el.remove();
        pieces.splice(pieces.indexOf(this), 1);
    }
}

function initializePieces(color) {
    let row1 = color === "w" ? 0 : board_height - 1;
    let row2 = color === "w" ? 1 : board_height - 2;

    new Piece("r", color, row1, 0);
    new Piece("n", color, row1, 1);
    new Piece("b", color, row1, 2);
    new Piece("q", color, row1, 3);
    new Piece("k", color, row1, 4);
    new Piece("b", color, row1, 5);
    new Piece("n", color, row1, 6);
    new Piece("r", color, row1, 7);

    for (let i = 0; i < 8; i++) {
        new Piece("p", color, row2, i);
    }
}