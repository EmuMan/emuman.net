function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const doorsScene = new Scene('doors', function(scene) {

    let c;
    let p;

    let font;

    function onMouseClick() {
        // definitely an important optimization, yep
        if (p.mouseY > 150 && p.mouseY < 300) {
            if (p.mouseX > 160 && p.mouseX < 240) {
                scene.sceneManager.load('tiles');
            } else if (p.mouseX > 360 && p.mouseX < 440) {
                scene.sceneManager.load('defeat');
            }
        }
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        p.mousePressed = onMouseClick;

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

        p.background(20);

        // scene
		p.fill('#211605');
		p.rect(0, 300, 600, 100);
		p.fill(105, 75, 60);
		p.rect(0, 0, 600, 300);
		p.strokeWeight(1);

        // doors
		p.stroke('#754F12');
		p.fill('#0F0A02');
		p.rect(160, 150, 80, 150);
		p.ellipse(230, 230, 10);
		p.rect(360, 150, 80, 150);
		p.ellipse(430, 230, 10);

        // numbers
		p.fill(255);
		p.textSize(32);
		p.text('1', 190, 140);
		p.text('2', 395, 140);
        
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
		p.text("Click on a door to continue exploring the house", 175, 365);
		p.text("Choose the wrong one... and start over again!", 175, 380);
    }

});