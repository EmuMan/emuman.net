const AURA_MAX = 8.0;
const AURA_TAX = 0.8;
const GAUGES = [1.0, 1.5, 2.0, 4.0, 8.0];
const ELEMENTS = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];
const AURA_TYPES = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "burning", "frozen", "quicken"];
const NO_AURA = ["anemo", "geo"];
const TIMESCALES = [0.25, 0.5, 1.0, 2.0, 4.0];

// This is a little tricky. I'm not sure all of this data is correct, but it's what the wiki had to offer.
const SIMULTANEOUS_REACTION_PRIORITY = {
    "pyro": ["electro", "anemo", "hydro", "cryo", "dendro"],
    "hydro": ["pyro", "anemo", "cryo", "dendro", "electro"],
    "dendro": ["quicken", "electro", "pyro", "hydro"],
    "electro": ["quicken", "pyro", "anemo", "hydro", "cryo", "frozen", "dendro"], // TODO: are cryo + frozen affected at the same time?
    "cryo": ["electro", "pyro", "anemo", "hydro"],
    "frozen": ["electro", "pyro", "anemo"],
    "anemo": ["electro", "pyro", "hydro", "cryo", "frozen"],
    "geo": ["frozen", "electro", "pyro", "hydro", "cryo"],
    "quicken": ["pyro", "hydro"],
    "burning": []
}

window.onload = function() {

    let timeScale = 1.0;
    let timeScaleIndex = 2;
    let totalElapsedTime = 0.0;
    let lastRealTimeMeasurement = performance.now();
    let showDurability = false;
    let paused = false;

    let barsContainer = document.getElementById("bars");
    let buttonsContainer = document.getElementById("element-buttons");
    let logContainer = document.getElementById("reaction-log");
    let playButton = document.getElementById("play");
    let pauseButton = document.getElementById("pause");
    let speedDropdown = document.getElementById("speed");
    let keybindListElement = document.getElementById("keybind-list");

    let keybinds = [];
    let readingKeybindInputFor = 0;
    let readingKeyPress = false;
    let readingAction = false;
    let firstTimeCreatingKeybind = true;

    let trackedAuras = [];
    
    let lastElectroChargedTick = 0.0;
    let currentMaxFreezeGauge = 0.0;
    let lastBurningApplication = 0.0;
    
    // stack for new auras to be created, because reactions happen first
    let aurasToAdd = [];

    class Aura {
        constructor(element, gauge) {
            this.barElement = null;
            this.progressElement = null;
            this.valueElement = null;
            this.containerElement = null;
            this.decayRateInheritance = true;
            this.auraType = element;
            this._gauge = 0.0;
            this.decayRate = null;
            this.auraTax = AURA_TAX;
            this.setupGauge(gauge);
        }
    
        set gauge(value) {
            this._gauge = value;
            if (this.progressElement !== null) {
                this.update();
            }
        }
    
        get gauge() {
            return this._gauge;
        }

        setGaugeWithTax(gauge) {
            this.gauge = gauge * this.auraTax;
        }
        
        setupGauge(gauge) {
            this.setGaugeWithTax(gauge);
            if (this.decayRate === null || !this.decayRateInheritance) {
                this.decayRate = 1 / (35 / (4 * gauge) + 25 / 8); // in U per second
            }
        }

        applyTrigger(element, gauge) {
            if (element === this.auraType) {
                // if the incoming aura is stronger, apply it
                if (gauge * this.auraTax > this.gauge) {
                    this.setupGauge(gauge);
                }
                return 0.0;
            }
            
            let reactionCoefficient = this.getReactionCoefficient(element, gauge);
            
            // for non-reacting elements
            if (reactionCoefficient === 0.0) {
                return gauge;
            }

            return this.attackAura(reactionCoefficient * gauge);
        }
        
        // pretend this is abstract
        getReactionCoefficient(element, gauge) {
            return 0.0;
        }

        attackAura(gauge) {
            this.gauge -= gauge;
            // if this.gauge is negative, there was application left over
            if (this.gauge < 0) {
                this.remove();
                return -this.gauge;
            }
            return 0;
        }

        decay(timeElapsed) {
            return this.decayWithRate(timeElapsed, this.decayRate);
        }

        decayWithRate(timeElapsed, decayRate) {
            let toRemove = timeElapsed * decayRate;
            if (toRemove >= this.gauge) {
                this.remove();
                return false;
            }
            this.gauge -= toRemove;
            return true;
        }
    
        update() {
            let width = (this.gauge / AURA_MAX) * 100;
            this.progressElement.style["width"] = `${width}%`;
            if (showDurability) {
                this.valueElement.textContent = `${(this.gauge * 25).toFixed(1)}d`;
            } else {
                this.valueElement.textContent = `${this.gauge.toFixed(2)}U`;
            }
        }

        add() {
            trackedAuras.push(this);
            this.containerElement = document.createElement("div");
            this.containerElement.classList.add("gauge-container");
            barsContainer.appendChild(this.containerElement);

            this.valueElement = document.createElement("p");
            this.valueElement.classList.add("gauge-value");
            this.valueElement.classList.add(`color-${this.auraType}`);
            this.containerElement.appendChild(this.valueElement);

            this.barElement = document.createElement("div");
            this.barElement.classList.add("bar");
            this.containerElement.appendChild(this.barElement);

            this.progressElement = document.createElement("div");
            this.progressElement.classList.add("progress");
            this.progressElement.classList.add(`background-${this.auraType}`);
            this.barElement.appendChild(this.progressElement);

            let markerList = document.createElement("ul");
            markerList.classList.add("marker-list");
            for (let i = 1; i < 8; i++) {
                let marker = document.createElement("li");
                marker.classList.add("marker");
                markerList.appendChild(marker);
            }
            this.barElement.appendChild(markerList);
            
            this.update();
        }

        remove() {
            trackedAuras.splice(trackedAuras.indexOf(this), 1);
            this.containerElement.remove();
        }
    }

    class AnemoAura extends Aura {
        constructor(gauge) {
            super("anemo", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "cryo") {
                reactionCoefficient = 0.5;
                logReaction(element, "cryo swirl");
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 0.5;
                logReaction(element, "electro swirl");
            } else if (element === "geo") {
                reactionCoefficient = 0.0;
            } else if (element === "hydro") {
                reactionCoefficient = 0.5;
                logReaction(element, "hydro swirl");
            } else if (element === "pyro") {
                reactionCoefficient = 0.5;
                logReaction(element, "pyro swirl");
            } else if (element === "frozen") {
                reactionCoefficient = 0.5;
                logReaction(element, "frozen swirl");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient
        }
    }

    class CryoAura extends Aura {
        constructor(gauge) {
            super("cryo", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "cryo swirl");
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 1.0;
                logReaction(element, "superconduct");
            } else if (element === "geo") {
                reactionCoefficient = 0.5;
                logReaction(element, "cryo crystallize");
            } else if (element === "hydro") {
                reactionCoefficient = 1.0;
                logReaction(element, "frozen");
                applyFrozen(gauge, this.gauge);
            } else if (element === "pyro") {
                reactionCoefficient = 2.0;
                logReaction(element, "forward melt")
            } else if (element === "frozen") {
                reactionCoefficient = 0.0;
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }
    }

    class DendroAura extends Aura {
        constructor(gauge) {
            super("dendro", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.0;
            } else if (element === "cryo") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 1.0;
                logReaction(element, "quicken");
                applyQuicken(gauge, this.gauge);
            } else if (element === "geo") {
                reactionCoefficient = 0.0; // TODO: verify
            } else if (element === "hydro") {
                reactionCoefficient = 0.5;
                logReaction(element, "reverse bloom");
            } else if (element === "pyro") {
                reactionCoefficient = 0.0;
                // pretty sure burning cannot be refreshed by pyro
                if (!auraExists("burning")) {
                    logReaction(element, "burning");
                    applyBurning();
                }
            } else if (element === "frozen") {
                reactionCoefficient = 0.0;
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }

        decayBurning(timeElapsed) {
            return this.decayWithRate(timeElapsed, Math.max(0.4, this.decayRate * 2));
        }

        remove() {
            super.remove();
            let burningAura = getAuraIfExists("burning");
            // if there is still a quicken aura that can continue feeding burning
            let quickenAura = getAuraIfExists("quicken");
            if (burningAura !== null && quickenAura === null) {
                burningAura.remove();
            }
        }
    }

    class ElectroAura extends Aura {
        constructor(gauge) {
            super("electro", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "electro swirl");
            } else if (element === "cryo") {
                reactionCoefficient = 1.0;
                logReaction(element, "superconduct");
            } else if (element === "dendro") {
                reactionCoefficient = 1.0;
                logReaction(element, "quicken");
                applyQuicken(this.gauge, gauge);
            } else if (element === "geo") {
                reactionCoefficient = 0.5;
                logReaction(element, "electro crystallize");
            } else if (element === "hydro") {
                reactionCoefficient = 0.0;
                applyElectroCharged();
                logReaction(element, "electro-charged");
            } else if (element === "pyro") {
                reactionCoefficient = 1.0;
                logReaction(element, "overloaded");
            } else if (element === "frozen") {
                reactionCoefficient = 1.0;
                logReaction(element, "frozen superconduct");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
                // TODO: i don't *think* aggravating off of a quicken aura can happen...
            }
            return reactionCoefficient;
        }
    }

    class GeoAura extends Aura {
        constructor(gauge) {
            super("geo", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.0; // TODO: verify
            } else if (element === "cryo") {
                reactionCoefficient = 0.5;
                logReaction(element, "cryo crystallize");
            } else if (element === "dendro") {
                reactionCoefficient = 0.0; // TODO: verify
            } else if (element === "electro") {
                reactionCoefficient = 0.5;
                logReaction(element, "electro crystallize");
            } else if (element === "hydro") {
                reactionCoefficient = 0.5;
                logReaction(element, "hydro crystallize");
            } else if (element === "pyro") {
                reactionCoefficient = 0.5;
                logReaction(element, "pyro crystallize");
            } else if (element === "frozen") {
                reactionCoefficient = 0.5;
                logReaction(element, "frozen crystallize");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }
    }

    class HydroAura extends Aura {
        constructor(gauge) {
            super("hydro", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "hydro swirl");
            } else if (element === "cryo") {
                reactionCoefficient = 1.0;
                logReaction(element, "frozen");
                applyFrozen(this.gauge, gauge);
            } else if (element === "dendro") {
                reactionCoefficient = 2.0;
                logReaction(element, "forward bloom");
            } else if (element === "electro") {
                reactionCoefficient = 0.0;
                applyElectroCharged();
                logReaction(element, "electro-charged");
            } else if (element === "geo") {
                reactionCoefficient = 0.5;
                logReaction(element, "hydro crystallize");
            } else if (element === "pyro") {
                if (auraExists("frozen")) {
                    return 0.0; // reject vape when frozen
                }
                reactionCoefficient = 0.5;
                logReaction(element, "reverse vaporize");
            } else if (element === "frozen") {
                reactionCoefficient = 0.0;
            } else if (element === "quicken") {
                reactionCoefficient = 2.0;
                logReaction(element, "quicken forward bloom");
            }
            return reactionCoefficient;
        }
    }

    class PyroAura extends Aura {
        constructor(gauge) {
            super("pyro", gauge);
            this.decayRateInheritance = false;
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "pyro swirl");
            } else if (element === "cryo") {
                reactionCoefficient = 0.5;
                logReaction(element, "reverse melt");
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
                logReaction(element, "burning");
                applyBurning();
            } else if (element === "electro") {
                reactionCoefficient = 1.0;
                logReaction(element, "overloaded");
            } else if (element === "geo") {
                reactionCoefficient = 0.5;
                logReaction(element, "pyro crystallize");
            } else if (element === "hydro") {
                reactionCoefficient = 2.0;
                logReaction(element, "forward vaporize");
            } else if (element === "frozen") {
                reactionCoefficient = 0.5;
                logReaction(element, "frozen reverse melt");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
                logReaction(element, "quicken burning");
            }
            return reactionCoefficient;
        }
    }

    class BurningAura extends Aura {
        constructor(gauge) {
            super("burning", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "burning swirl");
            } else if (element === "cryo") {
                reactionCoefficient = 0.5;
                logReaction(element, "burning reverse melt");
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 1.0;
                logReaction(element, "burning overloaded");
            } else if (element === "geo") {
                reactionCoefficient = 0.0;
            } else if (element === "hydro") {
                reactionCoefficient = 2.0;
                logReaction(element, "burning forward vaporize");
            } else if (element === "pyro") {
                reactionCoefficient = 0.0;
            } else if (element === "frozen") {
                reactionCoefficient = 0.5;
                logReaction(element, "burning frozen rev melt");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }

        setupGauge(gauge) {
            this.gauge = gauge;
            this.decayRate = 0.0;
        }
    }

    class FrozenAura extends Aura {
        constructor(gauge) {
            super("frozen", gauge);
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.5;
                logReaction(element, "frozen swirl");
            } else if (element === "cryo") {
                reactionCoefficient = 0.0;
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 1.0;
                logReaction(element, "frozen superconduct");
            } else if (element === "geo") {
                reactionCoefficient = 0.5;
                logReaction(element, "frozen crystallize + shatter");
                this.remove(); // shatter basically removes frozen
            } else if (element === "hydro") {
                reactionCoefficient = 0.0;
            } else if (element === "pyro") {
                reactionCoefficient = 2.0;
                logReaction(element, "frozen forward melt");
            } else if (element === "quicken") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }

        setupGauge(gauge) {
            this.gauge = gauge;
            currentMaxFreezeGauge = this.gauge;
            let freezeDuration = 2 * Math.sqrt(5 * this.gauge + 4) - 4;
            this.decayRate = (1 / freezeDuration) * this.gauge;
        }

        update() {
            let width = (this.gauge / currentMaxFreezeGauge) * 100;
            this.progressElement.style["width"] = `${width}%`;
            if (showDurability) {
                this.valueElement.textContent = `${(this.gauge * 25).toFixed(1)}d`;
            } else {
                this.valueElement.textContent = `${this.gauge.toFixed(2)}U`;
            }
        }
    }

    class QuickenAura extends Aura {
        constructor(gauge) {
            super("quicken", gauge);
            this.auraTax = 1.0;
        }

        getReactionCoefficient(element, gauge) {
            let reactionCoefficient = 0.0;
            if (element === "anemo") {
                reactionCoefficient = 0.0;
            } else if (element === "cryo") {
                reactionCoefficient = 0.0;
            } else if (element === "dendro") {
                reactionCoefficient = 0.0;
            } else if (element === "electro") {
                reactionCoefficient = 0.0;
            } else if (element === "geo") {
                reactionCoefficient = 0.0; // TODO: verify
            } else if (element === "hydro") {
                reactionCoefficient = 0.5;
                logReaction(element, "quicken reverse bloom");
            } else if (element === "pyro") {
                reactionCoefficient = 0.0;
                // pretty sure burning cannot be refreshed by pyro
                if (!auraExists("burning")) {
                    logReaction(element, "quicken burning");
                    applyBurning();
                }
            } else if (element === "frozen") {
                reactionCoefficient = 0.0;
            }
            return reactionCoefficient;
        }

        setupGauge(gauge) {
            this.gauge = gauge;
            let quickenDuration = this.gauge * 5 + 6;
            this.decayRate = (1 / quickenDuration) * this.gauge;
        }

        decayBurning(timeElapsed) {
            return this.decayWithRate(timeElapsed, Math.max(0.4, this.decayRate * 2));
        }

        remove() {
            super.remove();
            let burningAura = getAuraIfExists("burning");
            // if there is still a dendro aura that can continue feeding burning
            let dendroAura = getAuraIfExists("dendro");
            if (burningAura !== null && dendroAura === null) {
                burningAura.remove();
            }
        }
    }

    function auraExists(auraType) {
        return trackedAuras.some(aura => aura.auraType === auraType);
    }

    function getAuraIfExists(auraType) {
        // TODO: maybe modify this to take advantage of OOP?
        for (let auraIndex in trackedAuras) {
            if (trackedAuras[auraIndex].auraType === auraType) {
                return trackedAuras[auraIndex];
            }
        }
        return null;
    }

    function applyFrozen(hydroGauge, cryoGauge) {
        let gauge = 2 * Math.min(hydroGauge, cryoGauge);
        aurasToAdd.push({element: "frozen", gauge: gauge});
    }

    function applyQuicken(electroGauge, dendroGauge) {
        let gauge = Math.min(electroGauge, dendroGauge);
        aurasToAdd.push({element: "quicken", gauge: gauge});
    }

    function applyBurning() {
        aurasToAdd.push({element: "burning", gauge: 2.0});
    }

    function applyElectroCharged() {
        // doesn't actually apply anything, just sets the last ec time
        // to add a very slight damage tick delay
        lastElectroChargedTick = totalElapsedTime + 150.0;
    }

    function processElementalApplication(element, gauge) {
        let initialGauge = gauge;
        let elementSRP = SIMULTANEOUS_REACTION_PRIORITY[element];
        for (let i in elementSRP) {
            let auraType = elementSRP[i];
            let toReactWith = getAuraIfExists(auraType);
            let remaining = gauge;
            if (toReactWith !== null) {
                remaining = toReactWith.applyTrigger(element, gauge);
            }
            // pyro and burning aura get affected at the same time
            if (auraType === "pyro") {
                let burningAura = getAuraIfExists("burning");
                if (burningAura !== null) {
                    remaining = Math.min(remaining, burningAura.applyTrigger(element, gauge));
                }
            }
            // TODO: i assume quicken + dendro works similarly to pyro + burning?
            if (auraType === "dendro") {
                let quickenAura = getAuraIfExists("quicken");
                if (quickenAura !== null) {
                    remaining = Math.min(remaining, quickenAura.applyTrigger(element, gauge));
                }
            }
            // TODO: i assume frozen + cryo works similarly to pyro + burning?
            if (auraType === "cryo") {
                let frozenAura = getAuraIfExists("frozen");
                if (frozenAura !== null) {
                    remaining = Math.min(remaining, frozenAura.applyTrigger(element, gauge));
                }
            }
            if (gauge !== initialGauge && element === "geo") {
                // geo doesn't do multiple reactions apparently
                break;
            }
            gauge = remaining;
            if (gauge === 0.0) {
                break;
            }
        }

        if (gauge === initialGauge && !NO_AURA.includes(element)) {
            // no reaction occured, which means the element can
            // be given a new aura (except anemo and geo)
            let existing = getAuraIfExists(element);
            if (existing === null) {
                if (element === "anemo") {
                    (new AnemoAura(gauge)).add();
                } else if (element === "cryo") {
                    (new CryoAura(gauge)).add();
                } else if (element === "dendro") {
                    (new DendroAura(gauge)).add();
                } else if (element === "electro") {
                    (new ElectroAura(gauge)).add();
                } else if (element === "geo") {
                    (new GeoAura(gauge)).add();
                } else if (element === "hydro") {
                    (new HydroAura(gauge)).add();
                } else if (element === "pyro") {
                    (new PyroAura(gauge)).add();
                } else if (element === "burning") {
                    (new BurningAura(gauge)).add();
                } else if (element === "frozen") {
                    (new FrozenAura(gauge)).add();
                } else if (element === "quicken") {
                    (new QuickenAura(gauge)).add();
                }
            } else {
                existing.applyTrigger(element, gauge);
            }
        }

        // this loop becomes kinda weird when the recursion of the function
        // is taken into account, and if i'm not being dumb it doesn't
        // actually have to be a loop, just an if statement. but i feel better
        // about it like this. idk.
        while (aurasToAdd.length > 0) {
            newAura = aurasToAdd.pop();
            processElementalApplication(newAura.element, newAura.gauge);
        }
    }

    function tick(elapsedTime) {
        totalElapsedTime += elapsedTime;

        // electrocharged ticks
        let electroAura = getAuraIfExists("electro");
        let hydroAura = getAuraIfExists("hydro");
        if (electroAura !== null && hydroAura !== null &&
            // wiki says this is a thing but i say it's not
            // electroAura.gauge > 0.4 && hydroAura.gauge > 0.4 && 
            totalElapsedTime - lastElectroChargedTick > 1000.0) {
            electroAura.attackAura(0.4);
            hydroAura.attackAura(0.4);
            lastElectroChargedTick = totalElapsedTime;
        }

        // burning ticks
        let burningAura = getAuraIfExists("burning");
        let dendroAura = getAuraIfExists("dendro");
        let quickenAura = getAuraIfExists("quicken");
        if (burningAura !== null && (dendroAura !== null || quickenAura !== null) &&
            totalElapsedTime - lastBurningApplication > 2000.0) {
            processElementalApplication("pyro", 1.0);
            lastBurningApplication = totalElapsedTime;
        }

        // general decay
        let auraIndex = 0;
        while (auraIndex < trackedAuras.length) {
            let aura = trackedAuras[auraIndex];
            let decayResult = 
                    (burningAura !== null && (aura instanceof DendroAura || aura instanceof QuickenAura)) ?
                    aura.decayBurning(elapsedTime / 1000) :
                    aura.decay(elapsedTime / 1000);
            if (decayResult) {
                auraIndex++;
            }
        }
    }

    function clearAuras() {
        while (trackedAuras.length > 0) {
            trackedAuras[0].remove();
        }
        logContainer.innerHTML = "";
    }

    function logReaction(element, description) {
        let logElement = document.createElement("li");
        logElement.classList.add(`color-${element}`);
        logElement.classList.add("log-message");
        logElement.textContent = description;
        logContainer.appendChild(logElement);
        logElement.scrollIntoView();
    }
    
    ELEMENTS.forEach(element => {
        let label = document.createElement("p");
        label.textContent = element;
        label.classList.add("element-button-label");
        label.classList.add(`color-${element}`);
        buttonsContainer.appendChild(label);
        GAUGES.forEach(gauge => {
            let button = document.createElement("button");
            button.setAttribute("type", "button");
            button.textContent = `${gauge}U`;
            button.classList.add("element-button");
            button.classList.add(`background-${element}`);
            button.addEventListener("click", function() {
                if (readingAction) {
                    let keybind = keybinds[readingKeybindInputFor];
                    keybind.element = element;
                    keybind.gauge = gauge;
                    setReadingKeybindAction("apply");
                } else {
                    processElementalApplication(element, gauge);
                }
            }, false);
            buttonsContainer.appendChild(button);
        });
    });

    function pauseSimulation() {
        timeScale = 0.0;
        paused = true;
        playButton.classList.remove("hide-button");
        pauseButton.classList.add("hide-button");
    }

    function playSimulation() {
        timeScale = TIMESCALES[timeScaleIndex];
        paused = false;
        playButton.classList.add("hide-button");
        pauseButton.classList.remove("hide-button");
    }

    function togglePlay() {
        if (paused) {
            playSimulation();
        } else {
            pauseSimulation();
        }
    }

    function simulationStepForward() {
        tick(500.0);
    }

    function setTimeScale(tsIndex) {
        timeScaleIndex = Math.max(0, Math.min(TIMESCALES.length - 1, tsIndex));
        timeScale = TIMESCALES[timeScaleIndex];
    }

    playButton.addEventListener("click", function () {
        if (readingAction) {
            setReadingKeybindAction("toggle-play");
        } else {
            playSimulation();
        }
    });

    pauseButton.addEventListener("click", function () {
        if (readingAction) {
            setReadingKeybindAction("toggle-play");
        } else {
            pauseSimulation();
        }
    });

    document.getElementById("step-forward").addEventListener("click", function () {
        if (readingAction) {
            setReadingKeybindAction("step-forward");
        } else {
            simulationStepForward();
        }
    }, false);

    document.getElementById("clear").addEventListener("click", function () {
        if (readingAction) {
            setReadingKeybindAction("clear");
        } else {
            clearAuras();
        }
    });
    
    speedDropdown.addEventListener("change", function () {
        setTimeScale(parseInt(this.value, 10));
    });

    document.getElementById("show-durability-checkbox").addEventListener("change", function () {
        showDurability = this.checked;
        trackedAuras.forEach(aura => { aura.update(); });
    });

    function getMainLoopDeltaTime() {
        let currentTime = performance.now();
        let deltaTime = currentTime - lastRealTimeMeasurement;
        lastRealTimeMeasurement = currentTime;
        return deltaTime;
    }

    class Keybind {
        constructor(key, action) {
            this.id = getFirstEmptyKeybindID();
            this._key = key;
            this._action = action;
            this.element = null;
            this.gauge = null;
            this.dom_element = null;
            this.dom_element_key = null;
            this.dom_element_action = null;
        }

        set key(value) {
            this._key = value;
            this.update();
        }

        get key() {
            return this._key;
        }

        set action(value) {
            this._action = value;
            this.update();
        }

        get action() {
            return this._action;
        }

        add() {
            var keybindEntryElement = document.createElement("li");
            keybindEntryElement.id = `keybind-${this.id}`;
    
            var keybindRemoveElement = document.createElement("a");
            keybindRemoveElement.classList.add("keybind-remove");
            keybindRemoveElement.innerHTML = "<iconify-icon icon=\"clarity:remove-line\"></iconify-icon>";
            var keybindID = this.id // this.id does not work in the listener
            keybindRemoveElement.addEventListener("click", function () {
                removeKeybind(keybindID);
            });
            keybindEntryElement.appendChild(keybindRemoveElement);
    
            var keybindKeyElement = document.createElement("span");
            keybindKeyElement.id = `keybind-${this.id}-key`;
            keybindEntryElement.appendChild(keybindKeyElement);
    
            var keybindActionElement = document.createElement("span");
            keybindKeyElement.id = `keybind-${this.id}-action`;
            keybindEntryElement.appendChild(keybindActionElement);
    
            keybindListElement.appendChild(keybindEntryElement);
    
            this.dom_element = keybindEntryElement;
            this.dom_element_key = keybindKeyElement;
            this.dom_element_action = keybindActionElement;

            this.update();
            
            keybinds.push(this);
        }

        setElementAndGauge(element, gauge) {
            this.element = element;
            this.gauge = gauge;
        }

        remove() {
            this.dom_element.remove();
            keybinds.splice(keybinds.indexOf(this), 1);
        }

        update() {
            var keyText = this.key.replace("Key", "");
            this.dom_element_key.textContent = keyText;

            var actionElement = this.dom_element_action;
            if (this.action === "apply") {
                actionElement.textContent = `${this.gauge}U ${this.element}`;
                actionElement.classList.add(`color-${this.element}`);
            } else {
                var actionText = this.action.replace("_", " ");
                let firstChar = actionText.substring(0, 1);
                actionText = firstChar.toUpperCase() + actionText.substring(1, actionText.length);
                actionElement.textContent = actionText;
            }
        }

        handleAction() {
            switch (this.action) {
                case "clear":
                    clearAuras();
                    break;
                case "toggle_play":
                    togglePlay();
                    break;
                case "speed_down":
                    setTimeScale(timeScaleIndex - 1);
                    speedDropdown.value = timeScaleIndex;
                    break;
                case "speed_up":
                    setTimeScale(timeScaleIndex + 1);
                    speedDropdown.value = timeScaleIndex;
                    break;
                case "step_forward":
                    simulationStepForward();
                    break;
                case "apply":
                    processElementalApplication(this.element, this.gauge);
                    break;
            }
        }
    }

    function getFirstEmptyKeybindID() {
        var i = 0;
        while (keybinds.some(keybind => { return keybind.id === i; })) {
            i++;
        }
        return i;
    }

    function removeKeybind(keybindID) {
        for (var i = 0; i < keybinds.length; i++) {
            if (keybinds[i].id == keybindID) {
                keybinds[i].remove();
                return;
            }
        }
    }

    function  setReadingKeybindKey(key) {
        keybinds[readingKeybindInputFor].key = key;
        readingKeyPress = false;
        readingAction = true;
    }

    function setReadingKeybindAction(action) {
        keybinds[readingKeybindInputFor].action = action;
        readingAction = false;
    }

    new Keybind("KeyC", "clear").add();
    new Keybind("KeyP", "toggle_play").add();
    new Keybind("ArrowLeft", "speed_down").add();
    new Keybind("ArrowRight", "speed_up").add();

    document.onkeydown = function (e) {
        if (e.type == "keydown") {
            if (readingKeyPress) {
                setReadingKeybindKey(e.code);
                return;
            }
            keybinds.forEach(keybind => {
                if (e.code == keybind.key) {
                    keybind.handleAction();
                }
            });
        }
    }

    document.getElementById("add-keybind").addEventListener("click", function () {
        var newKeybind = new Keybind("None", "None", {});
        newKeybind.add();
        readingKeybindInputFor = newKeybind.id;
        readingKeyPress = true;
        readingAction = false;
        if (firstTimeCreatingKeybind) {
            alert("Press any key, and then press a button in the simulation to bind them together. (This message will only be displayed once)");
            firstTimeCreatingKeybind = false;
        }
    });

    setInterval(function() {
        let elapsedTime = getMainLoopDeltaTime();
        tick(elapsedTime * timeScale);
        trackedAuras.forEach(aura => { aura.update(); });
    }, 10);
}
