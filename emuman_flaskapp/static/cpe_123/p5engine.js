const normals = [
    new p5.Vector(1, 0, 0),
    new p5.Vector(0, 1, 0),
    new p5.Vector(0, 0, 1)
]

class Quaternion {

    // https://api.flutter.dev/flutter/vector_math/Quaternion-class.html

    x;
    y;
    z;
    w;

    constructor(x, y, z, w) {
        if (w === undefined) {
            this.setEuler(x, y, z);
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        this.w += other.w;
    }

    copy() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    length() {
        return Math.sqrt(this.lengthSq())
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    normalize() {
        let l = this.length();
        if (l == 0.0) return;
        
        let d = 1.0 / l;
        this.x *= l;
        this.y *= l;
        this.z *= l;
        this.w *= l;
    }

    rotate(v) {
        // god help me

        // conjugate(this) * [v,0] * this
        
        let tiw = this.w;
        let tiz = -this.z;
        let tiy = -this.y;
        let tix = -this.x;
        
        let tx = tiw * v.x + tix * 0.0 + tiy * v.z - tiz * v.y;
        let ty = tiw * v.y + tiy * 0.0 + tiz * v.x - tix * v.z;
        let tz = tiw * v.z + tiz * 0.0 + tix * v.y - tiy * v.x;
        let tw = tiw * 0.0 - tix * v.x - tiy * v.y - tiz * v.z;
        
        v.x = tw * this.x + tx * this.w + ty * this.z - tz * this.y;
        v.y = tw * this.y + ty * this.w + tz * this.x - tx * this.z;
        v.z = tw * this.z + tz * this.w + tx * this.y - ty * this.x;
    }

    setEuler(yaw, pitch, roll) {
        let halfYaw = yaw * 0.5;
        let halfPitch = pitch * 0.5;
        let halfRoll = roll * 0.5;

        let cosYaw = Math.cos(halfYaw);
        let sinYaw = Math.sin(halfYaw);
        let cosPitch = Math.cos(halfPitch);
        let sinPitch = Math.sin(halfPitch);
        let cosRoll = Math.cos(halfRoll);
        let sinRoll = Math.sin(halfRoll);

        this.x = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
        this.y = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
        this.z = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
        this.w = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
    }

}

class P5Object {

    name;
    location;

    constructor(name, location) {
        this.name = name;
        this.location = location;
    }

    addToScene(instance) { }

    move(x, y, z) {
        this.location.x += x;
        this.location.y += y;
        this.location.z += z;
    }

}

class P5Camera extends P5Object {

    up;
    target;

    constructor(name, location, up, target) {
        super(name, location);
        this.up = up;
        this.target = target;
    }

    addToScene(instance) {
        instance.camera(this.location.x, this.location.y, this.location.z,
            this.target.x, this.target.y, this.target.z,
            this.up.x, this.up.y, this.up.z);
    }

}

class P5Mesh extends P5Object {

    rotation;
    scale;
    color;
    children;
    outline;

    constructor(name, location, rotation, scale, color, outline) {
        super(name, location);
        this.rotation = rotation;
        this.scale = scale;
        this.color = color;
        this.children = [];
        this.outline = outline ?? 0;
    }

    addChild(obj, fixTransform) {
        if (fixTransform) {
            // rotation will not be workable until i implement quaternions
            obj.location.sub(this.location);
            obj.scale.div(this.scale);
        }
        this.children.push(obj);
    }

    addToScene(instance) {
        instance.push();
            instance.translate(this.location);
            instance.scale(this.scale);
            instance.rotateZ(this.rotation.z);
            instance.rotateY(this.rotation.y);
            instance.rotateX(this.rotation.x);
            if (this.color) instance.fill(this.color);
            instance.strokeWeight(this.outline);
            this.drawMesh(instance);
            this.children.forEach(c => c.addToScene(instance));
        instance.pop();
    }

    drawMesh() { }

}

class P5Box extends P5Mesh {

    dimensions;

    constructor(name, location, rotation, scale, color, dimensions, outline) {
        super(name, location, rotation, scale, color, outline);
        this.dimensions = dimensions;
    }

    drawMesh(instance) { instance.box(this.dimensions.x, this.dimensions.y, this.dimensions.z); }

}

class P5Plane extends P5Mesh {

    dimensions;

    constructor(name, location, rotation, scale, color, dimensions, outline) {
        super(name, location, rotation, scale, color, outline);
        this.dimensions = dimensions;
    }

    drawMesh(instance) { instance.plane(this.dimensions.x, this.dimensions.y); }

}

class P5Sphere extends P5Mesh {

    radius;
    detailX;
    detailY;

    constructor(name, location, rotation, scale, color, radius, outline) {
        super(name, location, rotation, scale, color, outline);
        this.radius = radius;
        this.detailX = this.detailY = 16;
    }

    setDetail(detail) { this.detailX = this.detailY = detail; }

    drawMesh(instance) { instance.sphere(this.radius, this.detailX, this.detailY); }

}

class P5Cylinder extends P5Mesh {

    radius;
    height;

    constructor(name, location, rotation, scale, color, radius, height, outline) {
        super(name, location, rotation, scale, color, outline);
        this.radius = radius;
        this.height = height;
    }

    drawMesh(instance) { instance.cylinder(this.radius, this.height, 16, 1, true, true); }

}

class P5Cone extends P5Mesh {

    radius;
    height;

    constructor(name, location, rotation, scale, color, radius, height, outline) {
        super(name, location, rotation, scale, color, outline);
        this.radius = radius;
        this.height = height;
    }

    drawMesh(instance) { instance.cone(this.radius, this.height, 16, 1, true); }

}

class P5Ellipsoid extends P5Mesh {
    radii;

    constructor(name, location, rotation, scale, color, radii, outline) {
        super(name, location, rotation, scale, color, outline);
        this.radii = radii;
    }

    drawMesh(instance) { instance.ellipsoid(this.radii.x, this.radii.y, this.radii.z, 24, 24); }

}

class P5Torus extends P5Mesh {

    radius;
    tubeRadius;

    constructor(name, location, rotation, scale, color, radius, tubeRadius, outline) {
        super(name, location, rotation, scale, color, outline);
        this.radius = radius;
        this.tubeRadius = tubeRadius;
    }

    drawMesh(instance) { instance.torus(this.radius, this.tubeRadius, 24, 16); }

}

class P5Empty extends P5Mesh {

    constructor(name, location, rotation, scale) {
        super(name, location, rotation, scale, null, null);
    }

}

class P5Mesh2D extends P5Mesh {

    constructor(name, location, rotation, scale, color, outline) {
        super(name, location, rotation, scale, color, outline);
    }

    addToScene(instance) {
        instance.push();
            instance.translate(this.location);
            instance.scale(this.scale);
            instance.rotate(this.rotation);
            if (this.color) instance.fill(this.color);
            instance.strokeWeight(this.outline);
            this.drawMesh(instance);
            this.children.forEach(c => c.addToScene(instance));
        instance.pop();
    }

}

class P5Ellipse2D extends P5Mesh2D {

    width;
    height;

    constructor(name, location, rotation, scale, color, width, height, outline) {
        super(name, location, rotation, scale, color, outline);
        this.width = width;
        this.height = height ?? width; // cool syntax B)
    }

    drawMesh(instance) { instance.ellipse(0, 0, this.width, this.height) }

}

// a2v = array to vector
function a2v(a) {
    if (a.length == 2) {
        return new p5.Vector(a[0], a[1]);
    } else {
        return new p5.Vector(a[0], a[1], a[2]);
    }
}

function loadObject(data, instance, color) {
    if (instance && !color && data['type'] != 'camera') {
        color = instance.color(data['color']);
    }
    switch(data['type']) {
        case 'camera':
            return new P5Camera(data['name'], a2v(data['location']), a2v(data['up']), a2v(data['target']))
        case 'box':
            return new P5Box(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, a2v(data['dimensions']));
        case 'plane':
            return new P5Plane(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, a2v(data['dimensions']));
        case 'sphere':
            return new P5Sphere(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, data['dimensions'][0]);
        case 'cylinder':
            return new P5Cylinder(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, data['dimensions'][0], data['dimensions'][1]);
        case 'cone':
            return new P5Cone(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, data['dimensions'][0], data['dimensions'][1]);
        case 'ellipsoid':
            return new P5Ellipsoid(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, a2v(data['dimensions']));
        case 'torus':
            return new P5Torus(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']), color, data['dimensions'][0], data['dimensions'][1]);
        case 'empty':
            return new P5Empty(data['name'], a2v(data['location']), a2v(data['rotation']), a2v(data['scale']))
    }
    return null;
}

function rotateVector(v, r) {
    // because apparently p5 doesn't natively provide this functionality for 3d vectors...
    // luckily, we can use a short - albeit fairly inefficient - trick to extend the 2d rotation into a 3rd dimension,
    // by simply performing it for every axis required (in xyz format) (trust me it works, i think)
    let tempR;
    tempR = new p5.Vector(v.x, v.y);
    tempR.rotate(r.z);
    v.y = tempR.y;
    tempR.y = v.z;
    tempR.rotate(-r.y);
    v.x = tempR.x;
    tempR.x = v.y;
    tempR.rotate(r.x);
    v.y = tempR.x;
    v.z = tempR.y;
    return v;
}

function getXZ(v) {
    return new p5.Vector(v.x, 0, v.z);
}

function smallestIndex(a) {
    let si = 0;
    for (let i = 0; i < a.length; i++) {
    if (a[i] < a[si]) si = i;
    }
    return si;
}

function largestIndex(a) {
    let li = 0;
    for (let i = 0; i < a.length; i++) {
    if (a[i] > a[li]) li = i;
    }
    return li;
}

function isString(v) {
    return typeof v === 'string' || v instanceof String;
}


class Ray {

    origin;
    direction;

    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

}

class RayHit {
    
    ray;
    time;
    normal;

    constructor(ray, time, normal) {
        this.ray = ray;
        this.time = time;
        this.normal = normal;
    }

}

class Trigger extends P5Object{

    constructor(name, location) {
        super(name, location);
    }

    testPoint(point) { }

    testRay(ray) { }

}

class SphereTrigger extends Trigger {

    radius;

    constructor(name, location, radius) {
        super(name, location);
        this.radius = radius;
    }

    testPoint(point) {
        let distance = point.copy();
        distance.sub(this.location);
        // TODO: Try the below line when possible
        // let distance = p5.Vector.sub(point, this.location)
        return distance.magSq() < this.radius * this.radius;
    }

    testRay(ray) {
        // https://fiftylinesofcode.com/ray-sphere-intersection/#:~:text=Ray-Sphere%20Intersection%20%E2%80%93%20From%20Math%20to%20Code%201,will%20be.%204%20Usage.%20...%205%20Assignments.%20
        let sphereToRay = p5.Vector.sub(ray.origin, this.location);

        let p = ray.direction.dot(sphereToRay);
        let q = sphereToRay.dot(sphereToRay) - this.radius * this.radius;

        let discriminant = (p * p) - q;
        if (discriminant < 0) return null;

        let dRoot = Math.sqrt(discriminant);
        let closestTime = Math.min(-p - dRoot, -p + dRoot);
        if (closestTime < 0) return null;
        let normal = p5.Vector.add(ray.origin, p5.Vector.mult(ray.direction, closestTime));
        normal.sub(this.location);
        normal.normalize();

        return new RayHit(ray, closestTime, normal);
    }

}

class BoxTrigger extends Trigger {

    dimensions;

    constructor(name, location, dimensions) {
        super(name, location);
        this.dimensions = dimensions;
    }

    testPoint(point) {
        return point.x > this.location.x - this.dimensions.x / 2 &&
               point.x < this.location.x + this.dimensions.x / 2 &&
               point.y > this.location.x - this.dimensions.y / 2 &&
               point.y < this.location.x + this.dimensions.y / 2 &&
               point.z > this.location.x - this.dimensions.z / 2 &&
               point.z < this.location.x + this.dimensions.z / 2
    }

    testRay(ray) {
        let halfSize = this.dimensions.copy();
        halfSize.mult(0.5);

        let nt = [];
        let ft = [];

        nt.push((this.location.x - halfSize.x - ray.origin.x) / ray.direction.x);
        ft.push((this.location.x + halfSize.x - ray.origin.x) / ray.direction.x);
        nt.push((this.location.y - halfSize.y - ray.origin.y) / ray.direction.y);
        ft.push((this.location.y + halfSize.y - ray.origin.y) / ray.direction.y);
        nt.push((this.location.z - halfSize.z - ray.origin.z) / ray.direction.z);
        ft.push((this.location.z + halfSize.z - ray.origin.z) / ray.direction.z);

        let temp;
        for (let i = 0; i < 3; i++) {
            if (ft[i] < nt[i]) {
                temp = nt[i];
                nt[i] = ft[i];
                ft[i] = temp;
            }
        }

        let condition = true;
        for (let i = 0; i < 3 && condition; i++) {
            for (let o = 0; o < 3; o++) {
                if (i != o && nt[i] > ft[o]) {
                    condition = false;
                    break;
                }
            }
        }

        if (condition) {
            let firstAxis = largestIndex(nt);
            let lastAxis = smallestIndex(ft);
            if (ft[lastAxis] < 0 || nt[firstAxis] < 0) return null;
            let normal = normals[firstAxis];
            if (ray.direction.dot(normal) < 0) normal.mult(-1);
            return new RayHit(ray, nt[firstAxis], normals[firstAxis]); 
        }
        
        return null;
    }

    copy() {
        return new BoxTrigger(this.name + "_copy", this.location.copy(), this.dimensions.copy());
    }

}

class CollisionResolution {

    dCollider;
    sCollider;
    deltaTime; // used to scale velocity to dT
    time; // used to determine where on the scaled velocity the collision hit
    normal;

    constructor(dCollider, sCollider, deltaTime, time, normal) {
        this.dCollider = dCollider;
        this.sCollider = sCollider;
        this.deltaTime = deltaTime;
        this.time = time;
        this.normal = normal;
    }

    resolve() {
        // r = resolution
        let rMag = this.dCollider.velocity.dot(this.normal) * (1 - this.time);
        let rVec = p5.Vector.mult(this.normal, rMag);

        this.dCollider.velocity.sub(rVec);
    }

}

class StaticCollider extends BoxTrigger {

    friction;

    constructor(name, location, dimensions, friction) {
        super(name, location, dimensions);
        this.friction = friction;
    }

}

class DynamicCollider extends BoxTrigger {

    velocity;
    forces;
    children;
    collisions;

    constructor(name, location, dimensions) {
        super(name, location, dimensions);
        this.velocity = new p5.Vector();
        this.forces = [];
        this.children = [];
        this.collisions = [];
    }

    testCollision(other, deltaTime) {        
        let _scaled = other.copy();
        _scaled.dimensions.x += this.dimensions.x;
        _scaled.dimensions.y += this.dimensions.y;
        _scaled.dimensions.z += this.dimensions.z;

        let rayHit = _scaled.testRay(new Ray(this.location, p5.Vector.mult(this.velocity, deltaTime)));
        if (rayHit && rayHit.time < 1) {
            let res = new CollisionResolution(this, other, deltaTime, rayHit.time, rayHit.normal);
            this.collisions.push(res);
            return res;
        }
        return null;
    }
    
    addChild(child) {
        this.children.push(child);
    }

    addForce(force) {
        this.forces.push(force);
    }

    applyForces(deltaTime) {
        this.velocity.add(p5.Vector.mult(this.getTotalForce(), 1 / 60));
    }

    addToScene(instance) {
        instance.push();
            instance.translate(this.location);
            this.children.forEach(c => c.addToScene(instance));
        instance.pop();
    }

    getTotalForce() {
        let total = new p5.Vector();
        this.forces.forEach(f => total.add(f));
        return total;
    }

    applyFriction(deltaTime) {
        let forceSum = this.getTotalForce();
        // nf = normal force
        this.collisions.forEach(c => {
            if (!c.normal.equals(new p5.Vector(0, -1, 0))) return;
            let nfMag = forceSum.dot(c.normal);
            if (nfMag < 0) return;
            let friction = p5.Vector.mult(this.velocity, 1 / (nfMag * c.sCollider.friction + 1) - 1);
            friction.mult(1 / deltaTime); // this is either correct or dreadfully wrong and i'm too scared to figure out which
            this.addForce(friction);
        });
    }

}

class PlayerCamera extends P5Camera {

    parent;

    pitch;
    yaw;

    constructor(name, location, pitch, yaw) {
        super(name, location, new p5.Vector(0, -1, 0), new p5.Vector(0, 0, -1));
        this.pitch = pitch;
        this.yaw = yaw;
    }

    addToScene(instance) {
        this.update();
        super.addToScene(instance);
    }

    setParent(parent) {
        this.parent = parent;
    }

    update() {
        this.location = this.parent.location; // probably only need to do this once? idk how references work here
        this.target = this.getForwardVector();
        this.target.add(this.location);
    }

    getForwardVector() {
        let vec = new p5.Vector(0, 0, -1);
        // janky but yaw needs to be applied before pitch.
        // considering changing the engine to work in yxz or something?
        rotateVector(vec, new p5.Vector(this.yaw, 0, 0));
        rotateVector(vec, new p5.Vector(0, this.pitch, 0));
        return vec;
    }

}

class Physics {

    gravity;

    triggers;
    staticColliders;
    dynamicColliders;

    constructor(gravity) {
        this.gravity = gravity;

        this.triggers = [];
        this.staticColliders = [];
        this.dynamicColliders = [];
    }

    update(deltaTime) {
        this.dynamicColliders.forEach(dc => {
            dc.addForce(this.gravity);
            dc.applyFriction(deltaTime);
            dc.applyForces(deltaTime);

            dc.collisions.splice(0, dc.collisions.length);

            this.staticColliders.forEach(sc => {
                dc.testCollision(sc, deltaTime);
            });
            dc.collisions.sort((a, b) => a.time - b.time);

            dc.collisions.forEach(col => {
                if (col) col.resolve();
            });

            dc.location.add(p5.Vector.mult(dc.velocity, deltaTime));
            
            dc.forces.splice(0, dc.forces.length);
        });
    }

    addTrigger(trigger) {
        this.triggers.push(trigger);
    }

    addStaticCollider(collider) {
        this.staticColliders.push(collider);
    }

    removeStaticCollider(collider) {
        if (typeof collider === 'string' || collider instanceof String) {
            this.staticColliders = this.staticColliders.filter(sc => sc.name !== collider);
        } else {
            this.staticColliders = this.staticColliders.filter(sc => sc !== collider);
        }
    }

    addDynamicCollider(collider) {
        this.dynamicColliders.push(collider);
    }

}

class Scene {

    instance;
    sceneManager;

    name;
    time;
    ready;

    load;
    draw;
    unload;

    constructor(name, setup) {
        this.name = name;
        this.time = 0;
        this.ready = false;

        setup(this);
    }

    _load(sceneManager, instance, canvas) {
        this.sceneManager = sceneManager;
        this.instance = instance;
        if (this.load) this.load(instance, canvas);
    }

    _draw() {
        this.time += this.instance.deltaTime / 1000;
        if (this.draw && this.ready) this.draw();
    }

    _unload() {
        if (this.unload) this.unload();
    }

}

class SceneManager {

    instance;
    canvas;

    activeScene;
    scenes;

    constructor(instance, canvas) {
        this.instance = instance;
        this.canvas = canvas;

        this.activeScene = null;
        this.scenes = [];
    }

    add(scene) {
        this.scenes.push(scene);
    }

    drawActive() {
        if (this.activeScene) this.activeScene._draw();
    }

    load(scene) {
        const s = isString(scene);
        for (let i = 0; i < this.scenes.length; i++) {
            if ((s ? this.scenes[i].name : this.scenes[i]) === scene) {
                if (this.activeScene) this.activeScene._unload();
                this.activeScene = this.scenes[i];
                this.activeScene._load(this, this.instance, this.canvas);
                break;
            }
        }
    }

    remove(scene) {
        const s = isString(scene);
        this.scenes = this.scenes.filter(sc => (s ? sc.name !== scene : sc !== scene));
        if (s ? (this.activeScene.name === scene) : (this.activeScene === scene)) {
            this.activeScene._unload();
            if (this.scenes.length !== 0) {
                this.activeScene = this.scenes[0];
                return;
            }
            this.activeScene = null;
        }
    }

}