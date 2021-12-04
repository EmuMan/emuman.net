function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const tilesScene = new Scene('tiles', function(scene) {

    let c;
    let p;

    let font;

    const tileLoc = new p5.Vector(0, 100);
    const tileSize = 40;

    let tileProgress = 0;

    const correctTiles = [
        new p5.Vector(7, 5),
        new p5.Vector(6, 4),
        new p5.Vector(7, 3),
        new p5.Vector(6, 2),
        new p5.Vector(7, 1),
        new p5.Vector(6, 0)
    ]

    function onMouseClick() {
        if (tileProgress < correctTiles.length &&
            p.mouseY > tileLoc.y && p.mouseY < tileLoc.y + tileSize * 6) {
            // click is on tiles
            const tile = correctTiles[tileProgress];
            const tOrigin = p5.Vector.add(p5.Vector.mult(tile, tileSize), tileLoc);
            if (p.mouseX > tOrigin.x && p.mouseX < tOrigin.x + tileSize &&
                p.mouseY > tOrigin.y && p.mouseY < tOrigin.y + tileSize) {
                tileProgress++;
            } else {
                scene.sceneManager.load('defeat');
            }
        } else if (tileProgress >= correctTiles.length && p.mouseX > 245 && p.mouseX < 283 && p.mouseY > 30 && p.mouseY < 90) {
            scene.sceneManager.load('bat_room');
        }
    }

    function drawTiles(xCount, yCount) {
        p.push();
            p.translate(tileLoc);
            let col;
            for (let y = 0; y < yCount; y++) {
                for (let x = 0; x < xCount; x++) {
                    col = ((x + y) % 2 == 0) ? p.color(240) : p.color(0);
                    // only check up to the current progress
                    for (let i = 0; i < tileProgress; i++) {
                        if (x === correctTiles[i].x && y === correctTiles[i].y) {
                            col = p.color(0, 255, 0);
                        }
                    }
                    p.fill(col);
                    p.rect(x * tileSize, y * tileSize, tileSize);
                }
            }
        p.pop();
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        p.mousePressed = onMouseClick;

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
        tileProgress = 0;
    }

    scene.draw = function () {
        convertScene(p);

        p.background(20);

        drawTiles(15, 6);

		// walls
		p.fill('#211605');
		p.rect(0, 340, 600, 60);
		p.fill('#211605');
		p.rect(0, 0, 600, 100);
		p.fill('#362109');
		p.triangle(0, 350, 0, 0, 100, 0);
		p.fill('#362109');
		p.triangle(600, 0, 600, 400, 500, 400);

		// door
		p.strokeWeight(2);
		p.stroke('#754F12');
		p.fill('#0F0A02');
		p.rect(245, 38, 30, 60);
		p.strokeWeight(1);
		p.ellipse(270, 75, 5);

		// sign
		p.fill('#73500D');
		p.noStroke();
		p.rect(130, 40, 70, 30);
		p.fill(255);
		p.textSize(9);
		p.text('watch your', 142, 53);
		p.text('step', 157, 63);
        
        // text box
        p.noStroke();
        p.fill(0);
        p.quad(0, 350, p.width, 350, p.width, p.height, 0, p.height);
        p.fill(255);
        p.quad(p.width / 4, 350, 3 * p.width / 4, 350, 3 * p.width / 4, p.height, p.width / 4, p.height);
        // text
        p.textFont(font);
        p.fill(0);
        p.textSize(10);
		p.text("Click on the tiles to make your way to the door", 180, 365);
		p.text("Be careful, a wrong click could be fatal", 200, 380);
		p.textSize(6);
		p.text("hint: white tiles only, straight path", 230, 392);
    }

});