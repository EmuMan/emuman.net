const bossFightScene = new Scene('boss_fight', function(scene) {

    let p;
    let c;

    let camera;
    let character;
    let monster;

    let objects;
    let trees;
    let markers;
    let colliders;

    let bat;

    let physics;

    let state;

    const states = {
        PREFIGHT: 'prefight',
        FIGHTING: 'fighting',
        POSTFIGHT: 'postfight'
    }

    function lockPointer() {
        c.elt.requestPointerLock();
    }

    function unlockPointer() {
        document.exitPointerLock();
    }

    function pointerLockChange() {
        if (document.pointerLockElement === c.elt || document.mozPointerLockElement === c.elt) {
            document.addEventListener('mousemove', mouseMoveHandler, false);
        } else {
            document.removeEventListener('mousemove', mouseMoveHandler, false);
        }
    }

    function mouseMoveHandler(e) {
        camera.pitch += e.movementX * cameraSensitivity;
        camera.yaw -= e.movementY * cameraSensitivity;
        while (camera.pitch < 0) camera.pitch += 2 * Math.PI;
        while (camera.pitch > 2 * Math.PI) camera.pitch -= 2 * Math.PI;
        let yawLimit = Math.PI / 2 - cameraYawThreshold;
        while (camera.yaw < -yawLimit) camera.yaw = -yawLimit;
        while (camera.yaw > yawLimit) camera.yaw = yawLimit;
    }

    function pointerSetup() {
        c.elt.requestPointerLock = c.elt.requestPointerLock || c.elt.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        c.mouseClicked(lockPointer);
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
    }

    function processInput() {
        let rot = p.createVector(0, camera.pitch, 0);
        let grounded = false;
        character.collisions.forEach(c => {
            if (c.normal.equals(p.createVector(0, -1, 0))) grounded = true;
        });
        let ma = grounded ? movementAccel : movementAccel / 4;
        if (p.keyIsDown(65)) character.addForce(rotateVector(p.createVector(ma, 0, 0), rot)); // a
        if (p.keyIsDown(68)) character.addForce(rotateVector(p.createVector(-ma, 0, 0), rot)); // d
        if (p.keyIsDown(87)) character.addForce(rotateVector(p.createVector(0, 0, -ma), rot)); // w
        if (p.keyIsDown(83)) character.addForce(rotateVector(p.createVector(0, 0, ma), rot)); // s
        if (p.keyIsDown(32) && grounded) character.addForce(p.createVector(0, 3000, 0)); // space
        if (p.keyIsDown(27)) unlockPointer(); // esc
    }

    function processMousePress() {
        let ray = new Ray(camera.location, camera.getForwardVector());

        let monsterHit = monster.collider.testRay(ray);
        if (monsterHit && monsterHit.time < 30) monster.damage(10);
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        state = states.PREFIGHT;

        camera = new PlayerCamera('camera', p.createVector(0, 10, 0), 0, 0);
        physics = new Physics(p.createVector(0, -100, 0));
        pointerSetup();
        c.mousePressed(processMousePress);

        p.keyPressed = function () {
            // prevents keypresses from going to the rest of the page when this window is focused
            return !(document.pointerLockElement === c.elt || document.mozPointerLockElement === c.elt);
        }

        objects = [];
        trees = [];
        markers = [];
        colliders = [];

        let data = p.loadJSON('/static/cpe_123/scenes/assets/boss_fight.json', function () {
            data['terrain'].forEach(o => objects.push(loadObject(o, p)));
            data['house'].forEach(o => objects.push(loadObject(o, p)));
            data['trees'].forEach(o => trees.push(loadObject(o, p)));
            data['markers'].forEach(o => markers.push(loadObject(o, p)));
            data['colliders'].forEach(o => colliders.push(loadObject(o, p)));

            for (let i = 0; i < trees.length; i++) {
                let tree = new Tree(trees[i].name, trees[i].location, p.createVector(), trees[i].scale, p.color(30, 20, 10));
                tree.generateBranches();
                trees[i] = tree;
                
                let colliderLoc = trees[i].location.copy();
                colliderLoc.y += trees[i].trunk.length / 2;
                physics.addStaticCollider(new StaticCollider(trees[i].name, colliderLoc,
                                                             p.createVector(trees[i].trunk.radius, trees[i].trunk.length, trees[i].trunk.radius)));
            }

            objects.forEach(o => {
                if (o.name === 'door' || o.name === 'door_handle') {
                    markers.forEach(c => {
                        if (c.name === 'door_hinge') {
                            c.addChild(o, true);
                        }
                    });
                }
            });

            objects = objects.filter(o => o.name !== 'door' && o.name !== 'door_handle');

            markers.forEach(m => {
                if (m.name === 'spawn') {
                    character = new DynamicCollider('character',
                        m.location,
                        p.createVector(10, 30, 10));
                    camera.setParent(character);
                    physics.addDynamicCollider(character);
                }
            });

            bat = new Bat('bat', p.createVector(0, 0, 30), p.createVector(), 1, p.color(255, 255, 255));
            character.addChild(bat);

            for (let i = 0; i < colliders.length; i++) {
                colliders[i] = new StaticCollider(colliders[i].name, colliders[i].location, colliders[i].dimensions, 0.0015);
                physics.addStaticCollider(colliders[i]);
            }

            monster = new Monster('rawr', p.createVector(0, 0, 0), p.createVector(), p.createVector(1, 1, 1), p.color(0));
            monster.onDeath = function () { scene.sceneManager.load('victory') };

            scene.ready = true;
        });
    };

    scene.unload = function () {
        unlockPointer();
        c.mousePressed(false);
        p.keyPressed = null;
    }

    scene.draw = function () {
        processInput();

        physics.update(p.deltaTime / 1000);

        let cvxz = getXZ(character.velocity);
        if (cvxz.magSq() > maxMovementSpeed * maxMovementSpeed) {
            cvxz.setMag(maxMovementSpeed);
            character.velocity = p.createVector(cvxz.x, character.velocity.y, cvxz.z);
        }

        p.ambientLight(255, 255, 255);
        p.directionalLight(p.color(255, 255, 255), p.createVector(1, -3, -2))

        p.background(20, 30, 40);

        monster.addParticle();
        let ground;
        for (let i = 0; i < colliders.length; i++) {
            if (colliders[i].name === 'ground_col') {
                ground = colliders[i];
                break;
            }
        }
        monster.update(p, ground);

        grounded = false;
        character.collisions.forEach(c => {
            if (c.normal.equals(p.createVector(0, -1, 0))) grounded = true;
        });
        monster.shockwaves.forEach(s => {
            if (s.locationInside(character.location) && grounded) {
                scene.sceneManager.load('defeat');
            }
        });

        camera.addToScene(p);
        objects.forEach(t => t.addToScene(p));
        markers.forEach(m => m.addToScene(p));
        trees.forEach(t => t.addToScene(p));
        monster.addToScene(p);
    }

});