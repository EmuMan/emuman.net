function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const houseScene = new Scene('house', function(scene) {

    const states = {
        INITIAL: 'initial',
        WAIT_FOR_CLICK: 'wait_for_click'
    }

    let c;
    let p;

    let font;

    let stars;
    let trees;
    let person;
    let monster;

    let state;

    const starCount = randomBetween(200, 300);
    const treeCount = randomBetween(80, 150);

    function onMouseClick() {
        if (state === states.WAIT_FOR_CLICK && p.mouseX > 460 && p.mouseX < 530 &&
                                               p.mouseY > 225 && p.mouseY < 345) {
            scene.sceneManager.load('doors');
        }
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        state = states.INITIAL;

        p.mousePressed = onMouseClick;

        person = new Person2D(p.createVector(-350, 0), 0, 1);
        monster = new Monster2D(p.createVector(150, 0), 0, 0.75);

        person.surprised = true;
        person.addChild(monster);

        stars = [];
        trees = [];

        for (let i = 0; i < starCount; i++) {
            stars.push(new P5Ellipse2D(`star_${i}`,
                                       p.createVector(p.random(600), p.random(150)),
                                       0,
                                       p.createVector(1, 1),
                                       p.color(180),
                                       p.random(0.3, 1.4) * 2.5));
        }

        for (let i = 0; i < treeCount; i++) {
            trees.push(new Tree2D(p.createVector(p.random(600), p.random(160, 175)),
                                                 0, p.random(0.4, 0.8)));
        }

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

        monster.update(p.deltaTime / 1000);

        if (state === states.INITIAL) {
            person.location.x += 300 * (p.deltaTime / 1000);
            if (person.location.x >= 0) {
                state = states.WAIT_FOR_CLICK;
                person.location.x = 0;
            }
        }

        p.background(20);

        // ground
        p.fill(0, 100, 0)
        p.rect(0, 150, p.width, 250)

        stars.forEach(s => s.addToScene(p));
        trees.forEach(t => t.addToScene(p));

        person.addToScene(p);

        //outside of house
		p.fill(105, 75, 60);
		p.quad(410, 180, p.width, 180, p.width, 350, 410, 350);
		//roof
		p.fill(105, 75, 60);
		p.triangle(410, 180, 505, 120, p.width, 180)
		//door
		p.fill(250, 200, 40);
		p.rect(460, 225, 75, 170);
		p.fill(0);
		p.rect(463, 228, 70, 160);
		p.fill(250, 200, 40);
		p.ellipse(525, 290, 10);
		p.fill(0);
		p.ellipse(525, 290, 8);
        
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
		p.text("Run into the house", 250, 365);
		p.text("There you'll find items to help you defeat the monster ", 170, 380);
		p.text("Click on the door to enter!", 240, 395);
    }

});