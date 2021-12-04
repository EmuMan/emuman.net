function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const defeatScene = new Scene('defeat', function(scene) {

    let c;
    let p;

    let monster;

    let font;

    function onMouseClick() {
        scene.sceneManager.load('opening');
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        p.mousePressed = onMouseClick;

        monster = new Monster2D(p.createVector(210, 100), 0, 1);

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

		p.background(100);

        monster.update(p.deltaTime / 1000);
        monster.addToScene(p);
        
        p.textFont(font);
		p.fill(0);
		p.textSize(61);
		p.text("GAME OVER", 120, 100);
		p.fill(255);
		p.textSize(60);
		p.text("GAME OVER", 122.5, 100);
        p.textSize(20);
        p.text('Click anywhere to restart', 193, 190);
    }

});