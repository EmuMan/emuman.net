function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const openingScene = new Scene('opening', function(scene) {

    const states = {
        INITIAL: 'initial',
        MONSTER_MOVE: 'monster_move',
        WAIT_FOR_PLAYER_CLICK: 'wait_for_player_click',
        PERSON_MOVE: 'person_move'
    }

    let c;
    let p;

    let font;

    let person;
    let monster;
    let stars;
    let trees;

    let state;

    const starCount = randomBetween(200, 300);
    const treeCount = randomBetween(80, 150);

    function onMouseClick() {
        if (state === states.INITIAL && p.mouseX > 150 &&
            p.mouseX < 450 && p.mouseY > 350)  state = states.MONSTER_MOVE;
        else if (state === states.WAIT_FOR_PLAYER_CLICK &&
                 p.mouseX > 275 && p.mouseX < 325 && p.mouseY > 240 && p.mouseY < 350)
            state = states.PERSON_MOVE;
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        state = states.INITIAL;

        p.mousePressed = onMouseClick;

        person = new Person2D(p.createVector(), 0, 1);
        monster = new Monster2D(p.createVector(-130, 0), 0, 0.75);

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

        if (state === states.MONSTER_MOVE) {
            monster.location.x += 300 * (p.deltaTime / 1000);
            if (monster.location.x >= 150) {
                state = states.WAIT_FOR_PLAYER_CLICK;
                person.surprised = true;
                monster.location.x = 150;
            }
        } else if (state === states.PERSON_MOVE) {
            person.location.x += 300 * (p.deltaTime / 1000);
            if (person.location.x >= p.width) {
                scene.sceneManager.load('house');
                return;
            }
        }

        p.background(20);

        // ground
        p.fill(0, 100, 0)
        p.rect(0, 150, p.width, 250)

        stars.forEach(s => s.addToScene(p));
        trees.forEach(t => t.addToScene(p));

        person.addToScene(p);
        
        // text box
        p.noStroke();
        p.fill(0);
        p.quad(0, 350, p.width, 350, p.width, p.height, 0, p.height);
        p.fill(255);
        p.quad(p.width / 4, 350, 3 * p.width / 4, 350, 3 * p.width / 4, p.height, p.width / 4, p.height);
        // text
        p.textFont(font);
        p.fill(0);
        switch (state) {
            case states.INITIAL:
            case states.MONSTER_MOVE:
                p.textSize(60);
                p.text("Start", 230, 397.5);
                break;
            case states.WAIT_FOR_PLAYER_CLICK:
            case states.PERSON_MOVE:
                p.textSize(10);
                p.text("You are running through the woods being chased by a monster", 160, 365);
                p.text("You need to find to a way to both escape and defeat them", 170, 380);
                p.text("Click on the player to begin your journey", 210, 395);
        }
    }

});