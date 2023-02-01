const AURA_MAX = 8.0;
const AURA_TAX = 0.8;
const gaugeS = [1.0, 1.5, 2.0, 4.0, 8.0];
const ELEMENTS = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"];
const AURA_TYPES = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro", "burning", "frozen", "quicken"];
const NO_AURA = ["anemo", "geo"];

// This is a little tricky. I'm not sure all of this data is correct, but it's what the wiki
// had to offer. KQM has a slightly different take that seemed more character-focused and
// didn't go into depth on specific reactions, so I decided that this would be good enough.
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

    let trackedAuras = [];
    
    let lastDecayTime = performance.now();
    let lastElectroChargedTick = performance.now();
    let currentMaxFreezeGauge = 0.0;
    let lastBurningApplication = performance.now();

    class Aura {
        constructor(element, gauge) {
            if (element === "frozen") {
                this.setupFrozen(gauge);
            } else if (element === "quicken") {
                this.setupQuicken(gauge);
            } else if (element === "burning") {
                this.setupBurning(gauge);
            } else {
                this._gauge = gauge * AURA_TAX;
                this.decayRate = 1 / (35 / (4 * gauge) + 25 / 8); // in U per second
            }
            this.auraType = element;
            this.barElement = null;
            this.progressElement = null;
            this.valueElement = null;
            this.containerElement = null;
        }
    
        set gauge(value) {
            this._gauge = value * AURA_TAX;
            if (this.progressElement !== null) {
                this.update();
            }
        }
    
        get gauge() {
            return this._gauge;
        }

        setupFrozen(gauge) {
            this._gauge = gauge;
            currentMaxFreezeGauge = this._gauge;
            let freezeDuration = 2 * Math.sqrt(5 * this._gauge + 4) - 4;
            this.decayRate = (1 / freezeDuration) * this._gauge;
        }

        setupQuicken(gauge) {
            this._gauge = gauge;
            let quickenDuration = this._gauge * 5 + 6;
            this.decayRate = (1 / quickenDuration) * this._gauge;
        }

        setupBurning(gauge) {
            this._gauge = gauge;
            this.decayRate = 1 / (35 / (4 * gauge) + 25 / 8);
        }

        applyTrigger(element, gauge) {
            let reactionCoefficient = 1.0;
            if (element === this.auraType) {
                // if the incoming aura is stronger, apply it
                this._gauge = Math.max(gauge * AURA_TAX, this._gauge);
                // do not reset the decay rate.
                return 0.0;
            }

            if (this.auraType === "anemo") {
                if (element === "cryo") {
                    reactionCoefficient = 0.5;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0;
                } else if (element === "electro") {
                    reactionCoefficient = 0.5;
                } else if (element === "geo") {
                    reactionCoefficient = 0.0;
                } else if (element === "hydro") {
                    reactionCoefficient = 0.5;
                } else if (element === "pyro") {
                    reactionCoefficient = 0.5;
                }
            } else if (this.auraType === "cryo") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0;
                } else if (element === "electro") {
                    reactionCoefficient = 1.0;
                } else if (element === "geo") {
                    reactionCoefficient = 0.5;
                } else if (element === "hydro") {
                    reactionCoefficient = 1.0;
                    applyFrozen(gauge, this.gauge);
                } else if (element === "pyro") {
                    reactionCoefficient = 2.0;
                }
            } else if (this.auraType === "dendro") {
                if (element === "anemo") {
                    reactionCoefficient = 0.0;
                } else if (element === "cryo") {
                    reactionCoefficient = 0.0;
                } else if (element === "electro") {
                    reactionCoefficient = 1.0;
                    applyQuicken(gauge, this.gauge);
                } else if (element === "geo") {
                    reactionCoefficient = 0.0; // TODO: verify
                } else if (element === "hydro") {
                    reactionCoefficient = 0.5;
                } else if (element === "pyro") {
                    reactionCoefficient = 0.0;
                    // pretty sure burning cannot be refreshed by pyro
                    if (!auraExists("burning")) {
                        applyBurning();
                    }
                }
            } else if (this.auraType === "electro") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "cryo") {
                    reactionCoefficient = 1.0;
                } else if (element === "dendro") {
                    reactionCoefficient = 1.0;
                    applyQuicken(this.gauge, gauge);
                } else if (element === "geo") {
                    reactionCoefficient = 0.5;
                } else if (element === "hydro") {
                    reactionCoefficient = 0.0;
                } else if (element === "pyro") {
                    reactionCoefficient = 1.0;
                }
            } else if (this.auraType === "geo") {
                if (element === "anemo") {
                    reactionCoefficient = 0.0; // TODO: verify
                } else if (element === "cryo") {
                    reactionCoefficient = 0.5;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0; // TODO: verify
                } else if (element === "electro") {
                    reactionCoefficient = 0.5;
                } else if (element === "hydro") {
                    reactionCoefficient = 0.5;
                } else if (element === "pyro") {
                    reactionCoefficient = 0.5;
                }
            } else if (this.auraType === "hydro") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "cryo") {
                    reactionCoefficient = 1.0;
                    applyFrozen(this.gauge, gauge);
                } else if (element === "dendro") {
                    reactionCoefficient = 2.0;
                } else if (element === "electro") {
                    reactionCoefficient = 0.0;
                } else if (element === "geo") {
                    reactionCoefficient = 0.5;
                } else if (element === "pyro") {
                    reactionCoefficient = 0.5;
                }
            } else if (this.auraType === "pyro") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "cryo") {
                    reactionCoefficient = 0.5;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0;
                    applyBurning();
                } else if (element === "electro") {
                    reactionCoefficient = 1.0;
                } else if (element === "geo") {
                    reactionCoefficient = 0.5;
                } else if (element === "hydro") {
                    reactionCoefficient = 2.0;
                }
            } else if (this.auraType === "burning") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "cryo") {
                    reactionCoefficient = 0.5;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0;
                } else if (element === "electro") {
                    reactionCoefficient = 1.0;
                } else if (element === "geo") {
                    reactionCoefficient = 0.0;
                } else if (element === "hydro") {
                    reactionCoefficient = 2.0;
                } else if (element === "pyro") {
                    reactionCoefficient = 0.0;
                }
            } else if (this.auraType === "frozen") {
                if (element === "anemo") {
                    reactionCoefficient = 0.5;
                } else if (element === "cryo") {
                    reactionCoefficient = 0.0;
                } else if (element === "dendro") {
                    reactionCoefficient = 0.0;
                } else if (element === "electro") {
                    reactionCoefficient = 1.0;
                } else if (element === "geo") {
                    reactionCoefficient = 0.5; // TODO: shatter
                } else if (element === "hydro") {
                    reactionCoefficient = 0.0;
                } else if (element === "pyro") {
                    reactionCoefficient = 2.0;
                }
            } else if (this.auraType === "quicken") {
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
                } else if (element === "pyro") {
                    reactionCoefficient = 0.0;
                    // pretty sure burning cannot be refreshed by pyro
                    if (!auraExists("burning")) {
                        applyBurning();
                    }
                }
            }
            
            // for non-reacting elements
            if (reactionCoefficient === 0.0) {
                return gauge;
            }

            return this.attackAura(reactionCoefficient * gauge);
        }

        attackAura(gauge) {
            this._gauge -= gauge;
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
            this._gauge -= toRemove;
            return true;
        }
    
        update() {
            let width = (this._gauge / (this.auraType === "frozen" ? currentMaxFreezeGauge : AURA_MAX)) * 100;
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
            if (this.auraType === "dendro") {
                let burningAura = getAuraIfExists("burning");
                // if there is still a quicken aura that can continue feeding burning
                let quickenAura = getAuraIfExists("quicken");
                if (burningAura !== null && quickenAura === null) {
                    burningAura.remove();
                }
            }
            if (this.auraType === "quicken") {
                let burningAura = getAuraIfExists("burning");
                // if there is still a dendro aura that can continue feeding burning
                let quickenAura = getAuraIfExists("dendro");
                if (burningAura !== null && quickenAura === null) {
                    burningAura.remove();
                }
            }
        }
    }

    function auraExists(auraType) {
        return trackedAuras.some(aura => aura.auraType === auraType);
    }

    function getAuraIfExists(auraType) {
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
                frozen.setupFrozen(gauge);
            }
        } else {
            (new Aura("frozen", gauge)).add();
        }
    }

    function applyQuicken(electroGauge, dendroGauge) {
        let gauge = Math.min(electroGauge, dendroGauge);
        let quicken = getAuraIfExists("quicken");
        if (quicken !== null) {
            if (quicken.gauge < gauge) {
                quicken.setupQuicken(gauge);
            }
        } else {
            (new Aura("quicken", gauge)).add();
        }
    }

    function applyBurning() {
        let burning = getAuraIfExists("burning");
        if (burning !== null) {
            burning.setupBurning(2.0);
        } else {
            (new Aura("burning", 2.0)).add();
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
                burningAura = getAuraIfExists("burning");
                if (burningAura !== null) {
                    remaining = Math.min(remaining, burningAura.applyTrigger(element, gauge));
                }
            }
            // TODO: i assume quicken + dendro works similarly to pyro + burning?
            if (auraType === "dendro") {
                burningAura = getAuraIfExists("quicken");
                if (burningAura !== null) {
                    remaining = Math.min(remaining, burningAura.applyTrigger(element, gauge));
                }
            }
            // TODO: i assume frozen + cryo works similarly to pyro + burning?
            if (auraType === "cryo") {
                burningAura = getAuraIfExists("frozen");
                if (burningAura !== null) {
                    remaining = Math.min(remaining, burningAura.applyTrigger(element, gauge));
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
                (new Aura(element, gauge)).add();
            } else {
                existing.applyTrigger(element, gauge);
            }

        }
    }

    function decayAuras() {
        currentTime = performance.now();
        elapsedTime = currentTime - lastDecayTime;

        // electrocharged ticks
        electroAura = getAuraIfExists("electro");
        hydroAura = getAuraIfExists("hydro");
        if (electroAura !== null && hydroAura !== null &&
            // wiki says this is a thing but i say it's not
            // electroAura.gauge > 0.4 && hydroAura.gauge > 0.4 && 
            currentTime - lastElectroChargedTick > 1000.0) {
            electroAura.attackAura(0.4);
            hydroAura.attackAura(0.4);
            lastElectroChargedTick = currentTime;
        }

        // burning ticks
        burningAura = getAuraIfExists("burning");
        dendroAura = getAuraIfExists("dendro");
        if (burningAura !== null && dendroAura !== null &&
            currentTime - lastBurningApplication > 2000.0) {
            processElementalApplication("pyro", 1.0);
            lastBurningApplication = currentTime;
        }

        // general decay
        let auraIndex = 0;
        while (auraIndex < trackedAuras.length) {
            let aura = trackedAuras[auraIndex];
            let decayResult = 
                    (burningAura !== null && (aura.auraType === "dendro" || aura.auraType === "quicken")) ?
                    aura.decayWithRate(elapsedTime / 1000, Math.max(0.4, aura.decayRate * 2)) :
                    aura.decay(elapsedTime / 1000);
            if (decayResult) {
                auraIndex++;
            }
        }
        
        lastDecayTime = currentTime;
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
