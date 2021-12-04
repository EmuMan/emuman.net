const maxMovementSpeed = 80;
const movementAccel = 350;

const cameraSensitivity = 0.001;
const cameraYawThreshold = 0.1;

class Branch {

   length;
   radius;
   rotation;
   children;

   constructor(length, radius, rotation) {
      this.length = length;
      this.radius = radius;
      this.rotation = rotation;
      this.children = [];
   }

   addChild(child) {
      this.children.push(child);
   }

   drawRecursive(instance) {
      instance.push();
         instance.rotateZ(this.rotation.z);
         instance.rotateY(this.rotation.y);
         instance.rotateX(this.rotation.x);
         instance.translate(0, this.length / 2, 0);
         instance.cylinder(this.radius, this.length);
         instance.translate(0, this.length / 2, 0);
         for (let i = 0; i < this.children.length; i++) {
            this.children[i].drawRecursive(instance);
         }
      instance.pop();
   }

}

class Tree extends P5Mesh {
   
   trunk;
   leaves;
   fallingLeaves;

   constructor(name, location, rotation, scale, color) {
      super(name, location, rotation, scale, color);
      this.leaves = [];
      this.fallingLeaves = [];
      this.trunk = new Branch(30, 2, new p5.Vector());
   }

   drawMesh(instance) {
      this.trunk.drawRecursive(instance);
   }

   generateBranches() {
      this._branchRecursive(0, this.trunk);
   }

   _branchRecursive(depth, currentBranch) {
      if (depth == 4) return;

      let branchChance = 75; // percent chance that a branch will form every attempt
      let maxBranches = 3;
      let rotationFactor = Math.PI / 4;

      let branchCount = 0;
      let rotations = [];

      while ((Math.random() * 100 < branchChance && branchCount < maxBranches) || (depth < 3 && branchCount < 1)) {
         for (let i = 0; i < 3; i++) {
            rotations.push(i != 1 ? Math.random() * rotationFactor * 2 - rotationFactor : 0);
         }
         let rotation = new p5.Vector(rotations[0], rotations[1], rotations[2]);
         let length = currentBranch.length * (Math.random() * 0.2 + 0.7);
         let newBranch = new Branch(length, currentBranch.radius * 0.8, rotation);
         currentBranch.addChild(newBranch);
         this._branchRecursive(depth + 1, newBranch);
         branchCount += 1;
         rotations.splice(0, rotations.length);
      }
   }

}

class MonsterParticle extends P5Sphere {

   time;
   velocity;
   originalRadius;

   constructor(name, location, scale, color, velocity) {
      super(name, location, new p5.Vector(0, 0, 0), scale, color, Math.random() * 2 + 2);
      this.setDetail(5);
      this.time = 0;
      this.velocity = velocity;
      this.originalRadius = this.radius;
   }

   update(instance) {
      const dt = instance.deltaTime / 1000;
      const noiseScale = 20;
      this.time += dt;
      let acc = new p5.Vector(instance.noise(this.location.x * noiseScale) - 0.5,
                              instance.noise(this.location.y * noiseScale) - 0.5,
                              instance.noise(this.location.z * noiseScale) - 0.5);
      acc.mult(dt * 1000);
      this.velocity.add(acc);
      let _velocity = this.velocity.copy();
      _velocity.mult(dt);
      this.location.add(_velocity);

      this.radius = this.originalRadius * (1 - this.time);
   }

}

class Shockwave extends P5Mesh {

   particles;
   collider;
   maxRadius;

   constructor(name, location, rotation, scale, color, maxRadius) {
      super(name, location, rotation, scale, color, null);
      this.maxRadius = maxRadius;
      this.collider = new SphereTrigger(`${name}_col`, location, 0);
      this.particles = [];
   }

   addParticle() {
      const d = new p5.Vector(0, 0, this.collider.radius);
      rotateVector(d, new p5.Vector(0, Math.random() * 2 * Math.PI, 0));
      const v = p5.Vector.add(p5.Vector.random3D(), new p5.Vector(0, 3, 0));
      this.particles.push(new MonsterParticle(`${this.name}_particle`, p5.Vector.add(this.location, d),
                                              this.scale.copy(), this.color, v));
   }

   update(instance) {
      let toRemove = 0;
      this.particles.forEach(p => {
         if (p.time > 0.3) {
            toRemove++;
            return;
         }
         p.update(instance);
      });
      for (let i = 0; i < toRemove; i++) this.particles.shift();
      for (let i = 0; i < 10; i++) this.addParticle();

      this.collider.radius += 150 * instance.deltaTime / 1000;
   }

   drawMesh(instance) {
      this.particles.forEach(p => p.addToScene(instance));
   }

   locationInside(loc) {
      const distance = p5.Vector.sub(loc, this.location).mag();
      if (distance < this.collider.radius && distance > this.collider.radius - 10) {
         return true;
      }
   }

}

class Monster extends P5Mesh {

   collider;
   damageCollider;
   activationTrigger;

   states;
   state;
   stateTimer;
   hasLanded;

   health;
   time;
   particles;
   shockwaves;
   localPos;

   onDeath;

   constructor(name, location, rotation, scale, color) {
      super(name, location, rotation, scale, color);

      this.states = {
         IDLE: 'idle',
         DIVE: 'dive',
         RISE: 'rise',
         BLAST: 'blast'
      }
      this.state = this.states.IDLE;
      this.stateTimer = 0;
      this.hasLanded = false;


      this.collider = new SphereTrigger('monster_collider', this.location, 10);
      this.activationTrigger = new SphereTrigger('monster_trigger', this.location, 50);
      this.damageCollider = new DynamicCollider('monster_damage', this.location, new p5.Vector(10, 10, 10));

      this.health = 100;
      this.time = 0;
      this.particles = [];
      this.shockwaves = [];
      this.localPos = new p5.Vector();

      this.onDeath = null;
   }

   drawMesh(instance) {
      this.particles.forEach(p => p.addToScene(instance));
      this.shockwaves.forEach(p => p.addToScene(instance));
      instance.push();
         instance.translate(this.localPos);
         instance.rotateX(this.time);
         instance.rotateY(this.time);
         instance.sphere(7, 5, 5);
      instance.pop();
   }

   addParticle() {
      const v = p5.Vector.random3D();
      v.mult(30);
      this.particles.push(new MonsterParticle(`${this.name}_particle`, p5.Vector.add(this.location, this.localPos),
                                              this.scale.copy(), this.color, v));
   }

   update(instance, ground) {
      this.time += instance.deltaTime / 1000;
      this.stateTimer += instance.deltaTime / 1000;

      let toRemove = 0;
      this.particles.forEach(p => {
         if (p.time > 1) {
            toRemove++;
            return;
         }
         p.update(instance);
      });
      for (let i = 0; i < toRemove; i++) this.particles.shift();

      toRemove = 0;
      this.shockwaves.forEach(s => {
         if (s.collider.radius > s.maxRadius) {
            toRemove++;
            return;
         }
         s.update(instance);
      });
      for (let i = 0; i < toRemove; i++) this.shockwaves.shift();

      this.collider.location = p5.Vector.add(this.location, this.localPos);
      this.damageCollider.location = p5.Vector.add(this.location, this.localPos);

      const oldState = this.state;
      this.evalState(instance, ground);
      if (this.state !== oldState) {
         this.stateTimer = 0;
      }
   }

   evalState(instance, ground) {
      switch (this.state) {
         case this.states.IDLE:
            if (this.stateTimer > 1) {
               this.state = instance.random(100) < 50 ? this.states.DIVE : this.states.BLAST;
            }
            break;
         case this.states.DIVE:
            if (this.stateTimer < 0.2) {
               this.localPos.add(p5.Vector.mult(new p5.Vector(0, 40, 0), instance.deltaTime / 1000));
            } else {
               this.localPos.add(p5.Vector.mult(new p5.Vector(0, -200, 0), instance.deltaTime / 1000));
               this.damageCollider.velocity = new p5.Vector(0, -200, 0);
               if (this.damageCollider.testCollision(ground, instance.deltaTime / 1000)) {
                  this.state = this.states.RISE;
                  this.shockwaves.push(new Shockwave(`${this.name}_sw`, p5.Vector.add(this.localPos, new p5.Vector(0, 7, 0)), this.rotation, this.scale, this.color, 200));
               }
            }
            break;
         case this.states.RISE:
            this.localPos.y += 40 * instance.deltaTime / 1000;
            if (this.localPos.y > 0) {
               this.localPos.y = 0;
               this.state = this.states.IDLE;
            }
            break;
         case this.states.BLAST:
            this.state = this.states.DIVE;
            break;
      }
   }

   damage(hp) {
      this.health -= hp;
      if (this.health <= 0) {
         this.health = 0;
         this._onDeath();
      }
      console.log(this.health);
   }
   
   _onDeath() {
      if (this.onDeath) this.onDeath();
   }

}

class Bat extends P5Mesh {

   constructor(name, location, rotation, scale, color) {
      super(name, location, rotation, scale, color, null);
   }

   drawMesh(instance) {
      instance.cylinder(5, 20);
      instance.translate(0, 10, 0);
      instance.sphere(5);
   }

}

class Monster2D extends P5Mesh2D {

   time;
   movementRadius;
   movementSpeed;

   constructor(location, rotation, scale) {
       super('monster', location, rotation, scale, null, null);
       this.time = 0;
       this.movementRadius = 40;
       this.movementSpeed = 3;
   }

   drawMesh(instance) {
       const theta = this.time * this.movementSpeed;
       instance.translate(Math.cos(theta) * this.movementRadius,
                          Math.sin(theta) * this.movementRadius);
       
       //body
       instance.fill(50);
       instance.beginShape();
         instance.curveVertex(50, 175);
         instance.curveVertex(50, 175);
         instance.curveVertex(70, 140);
         instance.curveVertex(100, 150);
         instance.curveVertex(135, 140);
         instance.curveVertex(120, 180);
         instance.curveVertex(130, 200);
         instance.curveVertex(125, 240);
         instance.curveVertex(95, 225);
         instance.curveVertex(75, 260);
         instance.curveVertex(60, 235);
         instance.curveVertex(25, 200);
         instance.curveVertex(40, 215);
         instance.curveVertex(10, 180);
         instance.curveVertex(50, 175);
       instance.endShape(instance.CLOSE);
       
       //face	
       instance.fill(255);
       instance.ellipse(75, 160, 5, 15);
       instance.ellipse(90, 160, 5, 15);
   }

   update(deltaTime) { this.time += deltaTime; }

}

class Person2D extends P5Mesh2D {

   surprised;

   leftEyeLoc;
   rightEyeLoc;

   constructor(location, rotation, scale) {
       super('Person2D', location, rotation, scale, null, null);
       this.surprised = false;
   }

   drawMesh(instance) {
       //head and neck
       instance.fill(219, 190, 150);
       //head
       instance.ellipse(300, 265, 42.5);
       //neck
       instance.rect(295, 285, 10, 10);

       //white of eyes
       instance.fill(255);
       //L
       instance.ellipse(290, 260, 15);
       //R
       instance.ellipse(310, 260, 15);

       this.leftEyeLoc = new p5.Vector(instance.mouseX - 290, instance.mouseY - 260);
       this.rightEyeLoc = new p5.Vector(instance.mouseX - 310, instance.mouseY - 260);

       this.leftEyeLoc.setMag(5);
       this.rightEyeLoc.setMag(5);
   
       //pupils
       instance.fill(0);
       //L
       instance.ellipse(290 + this.leftEyeLoc.x, 260 + this.leftEyeLoc.y, 7.5);
       //R
       instance.ellipse(310 + this.rightEyeLoc.x, 260 + this.rightEyeLoc.y, 7.5);

       //mouth
       instance.fill(0);
       if (this.surprised) instance.ellipse(300, 275, 10);
       else instance.ellipse(300, 275, 10, 5);

       //pants
       instance.fill(0, 0, 100);
       instance.rect(290, 325, 20, 25);
       
       //shirt
       instance.fill(150, 0, 0);
       instance.beginShape();
           instance.curveVertex(300, 290);
           instance.curveVertex(300, 290);
           instance.curveVertex(295, 290);
           instance.curveVertex(285, 310);
           instance.curveVertex(285, 325);
           instance.curveVertex(315, 325);
           instance.curveVertex(315, 310);
           instance.curveVertex(305, 290);
           instance.curveVertex(300, 290);
       instance.endShape(instance.CLOSE);
       
       //hands
       instance.fill(219, 190, 150);
       instance.ellipse(290, 325, 10);
       instance.ellipse(310, 325, 10);

       //shoes
       instance.fill(255);
       instance.ellipse(295, 350, 10, 3);
       instance.ellipse(305, 350, 10, 3);
   }

}

class Tree2D extends P5Mesh2D {

   constructor(location, rotation, scale) {
       super('tree', location, rotation, scale);
   }

   drawMesh(instance) {
       instance.fill(70, 40, 20);
       instance.rect(-5, -30, 10, 30);
     instance.fill(0, 50, 0);
     instance.triangle(-15, -20, 0, -45, 15, -20);
     instance.triangle(-13, -30, 0, -55, 13, -30);
     instance.triangle(-11, -40, 0, -65, 11, -40);
   }

}

class BasicCircle2D {

   location;
   radius;

   constructor(location, radius) {
      this.location = location;
      this.radius = radius;
   }

   draw(instance) {
      instance.circle(this.location.x, this.location.y, this.radius);
   }

}

let defaultCam;

let sketch = function(p) {

   let canvas;
   let sm;

   p.setup = function() {
      p.pixelDensity(1);
      canvas = p.createCanvas(600, 400, p.WEBGL);
      p.noStroke();

      let eyeZ = ((p.height / 2) / p.tan(p.PI / 6));
      p.perspective(p.PI / 3, p.width / p.height, eyeZ / 400, eyeZ * 10);

      defaultCam = p.createCamera();

      sm = new SceneManager(p, canvas);

      sm.add(openingScene);
      sm.add(houseScene);
      sm.add(doorsScene);
      sm.add(tilesScene);
      sm.add(batRoomScene);
      sm.add(finalRoomScene);
      sm.add(bossFightScene);
      
      sm.add(victoryScene);
      sm.add(defeatScene);

      sm.load(openingScene);
   };
   
   p.draw = function() {
      sm.drawActive();
   };

};


let instance = new p5(sketch);
