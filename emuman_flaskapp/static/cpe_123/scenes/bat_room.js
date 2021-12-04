function convertScene(instance) {
    instance.translate(-instance.width / 2, -instance.height / 2, 0);
}

function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
}

const batRoomScene = new Scene('bat_room', function(scene) {

    let c;
    let p;

    let font;
    
    let state;

    const states = {
        INITIAL: 'initial',
        AFTER_BAT: 'after_bat'
    }

    function onMouseClick() {
        if (state === states.INITIAL && p.mouseX > 320 && p.mouseX < 380 && p.mouseY > 273 && p.mouseY < 315) {
            state = states.AFTER_BAT;
        } else if (state === states.AFTER_BAT && p.mouseX > 525 && p.mouseX < 565 && p.mouseY > 220 && p.mouseY < 310) {
            scene.sceneManager.load('final_room');
        }
    }

    function draw_bat(bx, by, rot) {
        p.push();
            p.translate(bx, by);
            p.rotate(rot);
        
            p.stroke(0);
            p.strokeWeight(2);
            p.fill(246, 169, 98);
            p.quad(-2.8, -3, -5.5, -50, 5.5, -50, 2.8, -3);
            p.push();
                p.translate(0, 0, 0.2);
                p.ellipse(0, 0, 12, 8);
            p.pop();
            p.arc(0, -51, 11, 13, Math.PI, 2 * Math.PI);
            p.noStroke();
            p.rect(-4.42, -51, 8.9, 2);

            // drawing a noStroke repetition to remove unwanted outline diagonals
            p.push();
                p.translate(0, 0, 0.2);
                p.quad(-2.4, -3, -5.0, -52, 5.0, -52, 2.4, -3);
            p.pop();
        
            // handle
            p.translate(0, 0, 0.2);
            p.stroke(0);
            p.strokeWeight(.6);
            p.fill(200);
            p.rect(-2, -8, 4.5, 3);
            p.rect(-2.2, -11.2, 4.5, 3);
            p.rect(-2.5, -14.2, 5, 3);
        p.pop()
    }

    scene.load = (instance, canvas) => {
        c = canvas;
        p = instance;

        state = states.INITIAL;

        p.mousePressed = onMouseClick;

        font = p.loadFont('/static/cpe_123/scenes/assets/FreeSans.ttf', function () { scene.ready = true; });
    };

    scene.unload = function () {
        p.mousePressed = null;
    }

    scene.draw = function () {
        convertScene(p);

        p.background(120);

        // doors
		p.fill(20);
		p.strokeWeight(3);
		p.stroke(255, 255, 0);
		p.quad(34, 240, 53, 315, 72, 280, 60, 220);
		p.quad(566, 240, 547, 315, 528, 280, 545, 220);
        // drawing a noStroke repetition to remove unwanted outline diagonal
        p.push();
            p.translate(0, 0, 0.3);
            p.noStroke();
            p.quad(34, 240, 53, 315, 72, 280, 60, 220);
            p.quad(566, 240, 547, 315, 528, 280, 545, 220);
        p.pop();
        p.stroke(255, 255, 0);
		p.noFill();
        p.push();
            p.translate(0, 0, 0.3);
            p.ellipse(61, 260, 5);
            p.ellipse(541, 260, 5);
        p.pop();

        // floor
        p.noStroke();
		p.fill(60);
		p.quad(100, 225, 0, 400, 600, 400, 500, 225);

        // wall corner lines
        p.stroke(60);
		p.strokeWeight(5);
		p.line(85, 0, 102, 235);
		p.line(515, 0, 498, 235);

        if (state === states.INITIAL) draw_bat(330, 310, (p.PI / 180) * 55);
    }

});