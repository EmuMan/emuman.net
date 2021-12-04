function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const finalRoomScene = new Scene('final_room', function(scene) {

    let c;
    let p;

    let font;

    let starCount;
    let lStars;
    let rStars;

    function onMouseClick() {
        if (p.mouseX > 310 && p.mouseX < 365 && p.mouseY > 60 && p.mouseY < 150) {
            scene.sceneManager.load('boss_fight');
        }
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        p.mousePressed = onMouseClick;

        starCount = p.random(75, 100);
        lStars = [];
        rStars = [];
        
        for (let i = 0; i < starCount; i++) {
            lStars.push(new BasicCircle2D(p.createVector(p.random(150, 220), p.random(50, 100)),
                                          p.random(0.6, 2.8)));
            rStars.push(new BasicCircle2D(p.createVector(p.random(430, 500), p.random(50, 100)),
                                          p.random(0.6, 2.8)));
        }

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

        p.background(20);

        // windows
        p.noStroke();
		p.fill(181, 84, 0);
		p.rect(0, 0, p.width, 150);
		p.fill(145, 55, 0);
		p.rect(0, 150, p.width, 250);

		p.fill(60);
		p.rect(150, 50, 70, 50);
		p.rect(430, 50, 70, 50);

        p.push();
            p.fill(180);
            p.noStroke();
            lStars.forEach(s => s.draw(p));
            rStars.forEach(s => s.draw(p));
        p.pop();

		p.push();
            p.noFill();
            p.stroke(200, 200, 40);
            p.strokeWeight(2.5);
            p.rect(150, 50, 70, 50);
            p.rect(430, 50, 70, 50);
            p.fill(30);
            p.rect(310, 60, 45, 90);
            p.noFill();
            p.strokeWeight(2);
            p.ellipse(345, 105, 6);
		p.pop();

        p.push();
            p.translate(0, 0, 0.2);
            p.fill(40);
            p.rect(308, 148, 49, 25);
        p.pop();

		p.push();
            p.stroke(70);
            p.fill(40);
            p.strokeWeight(3);
            p.ellipse(280, 290, 180, 80);
		p.pop();
    }

});