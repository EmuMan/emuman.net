function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const victoryScene = new Scene('victory', function(scene) {

    let c;
    let p;

    let person;

    let font;

    function onMouseClick() {
        scene.sceneManager.load('opening');
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        p.mousePressed = onMouseClick;

        person = new Person2D(p.createVector(0, 0), 0, 1);

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

		p.background(147, 209, 235);

        person.addToScene(p);
        
        p.textFont(font);
		p.fill(0);
		p.textSize(61);
		p.text("YOU WIN", 147.5, 100);
		p.fill(255);
		p.textSize(60);
		p.text("YOU WIN", 150, 100);
        p.textSize(20);
        p.text('Click anywhere to restart', 180, 190);
    }

});