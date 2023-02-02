const AURA_MAX = 8.0;
const AURA_TAX = 0.8;
const gaugeS = [1.0, 1.5, 2.0, 4.0, 8.0];
const ELEMENTS = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];
const AURA_TYPES = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "burning", "frozen", "quicken"];
const NO_AURA = ["anemo", "geo"];

// This is a little tricky. I'm not sure all of this data is correct, but it's what the wiki had to offer.
const SIMULTANEOUS_REACTION_PRIORITY = {
    "pyro": ["electro", "anemo", "hydro", "cryo", "dendro"],
    "hydro": ["pyro", "anemo", "cryo", "dendro", "electro"],
    "dendro": ["quicken", "electro", "pyro", "hydro"],
    "electro": ["quicken", "pyro", "anemo", "hydro", "cryo", "frozen", "dendro"], // TODO: are cryo + frozen affected at the same time?
    "cryo": ["electro", "pyro", "anemo", "hydro"],
    "frozen": ["electro", "pyro", "anemo"],
    "anemo": ["electro", "pyro", "hydro", "cryo", "frozen"],
    "geo": ["frozen", "electro", "pyro", "hydro", "cryo"], // TODO: frozen crystallize (at end)
    "quicken": ["pyro", "hydro"]
}

window.onload = function() {

    let barsContainer = document.getElementById("bars");
    let buttonsContainer = document.getElementById("buttons");
    let logContainer = document.getElementById("reaction-log");

    let trackedAuras = [];
    
    let lastDecayTime = performance.now();
    let lastElectroChargedTick = performance.now();
    let currentMaxFreezeGauge = 0.0;
    let lastBurningApplication = performance.now();

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
            this.gauge = gauge * AURA_TAX;
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
                if (gauge * AURA_TAX > this.gauge) {
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
            this.valueElement.textContent = `${this.gauge.toFixed(2)}U`;
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
                logReaction(element, "electro-charged");
            } else if (element === "pyro") {
                reactionCoefficient = 1.0;
                logReaction(element, "overloaded");
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
            this.valueElement.textContent = `${this.gauge.toFixed(2)}U`;
        }
    }

    class QuickenAura extends Aura {
        constructor(gauge) {
            super("quicken", gauge);
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
        let frozen = getAuraIfExists("frozen");
        if (frozen !== null) {
            if (frozen.gauge < gauge) {
                frozen.setupGauge(gauge);
            }
        } else {
            (new FrozenAura(gauge)).add();
        }
    }

    function applyQuicken(electroGauge, dendroGauge) {
        let gauge = Math.min(electroGauge, dendroGauge);
        let quicken = getAuraIfExists("quicken");
        if (quicken !== null) {
            if (quicken.gauge < gauge) {
                quicken.setupGauge(gauge);
            }
        } else {
            (new QuickenAura(gauge)).add();
        }
    }

    function applyBurning() {
        let burning = getAuraIfExists("burning");
        if (burning !== null) {
            burning.setupGauge(2.0);
        } else {
            (new BurningAura(2.0)).add();
        }
    }

    function processElementalApplication(element, gauge) {        
        let initialGauge = gauge;
        let elementSRP = SIMULTANEOUS_REACTION_PRIORITY[element];
        for (let i in elementSRP) {
            let auraType = elementSRP[i];
            let toReactWith = getAuraIfExists(auraType)
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
                }
            } else {
                existing.applyTrigger(element, gauge);
            }

        }
    }

    function decayAuras() {
        currentTime = performance.now();
        elapsedTime = currentTime - lastDecayTime;

        // electrocharged ticks
        let electroAura = getAuraIfExists("electro");
        let hydroAura = getAuraIfExists("hydro");
        if (electroAura !== null && hydroAura !== null &&
            // wiki says this is a thing but i say it's not
            // electroAura.gauge > 0.4 && hydroAura.gauge > 0.4 && 
            currentTime - lastElectroChargedTick > 1000.0) {
            electroAura.attackAura(0.4);
            hydroAura.attackAura(0.4);
            lastElectroChargedTick = currentTime;
        }

        // burning ticks
        let burningAura = getAuraIfExists("burning");
        let dendroAura = getAuraIfExists("dendro");
        let quickenAura = getAuraIfExists("quicken");
        if (burningAura !== null && (dendroAura !== null || quickenAura !== null) &&
            currentTime - lastBurningApplication > 2000.0) {
            processElementalApplication("pyro", 1.0);
            lastBurningApplication = currentTime;
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
        
        lastDecayTime = currentTime;
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
        gaugeS.forEach(gauge => {
            button = document.createElement("button");
            button.textContent = `${gauge}U ${element}`;
            button.classList.add("button");
            button.classList.add(`background-${element}`);
            button.addEventListener("click", function() {
                processElementalApplication(element, gauge);
            }, false);
            buttonsContainer.appendChild(button);
        });
    });

    setInterval(function() {
        decayAuras();
        trackedAuras.forEach(aura => { aura.update(); });
    }, 10);
}
