window.onload = function() {
    let number = 0;
    let showAdvanced = false;
    numberElement = document.getElementById("number");
    advancedElement = document.getElementById("advanced");
    advancedBtnElement = document.getElementById("advanced-btn");

    function update() {
        let str = number.toString(10);
        let width = 10;
        str = str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
        numberElement.textContent = str;
    }

    function toggleAdvanced() {
        if (showAdvanced) {
            advancedElement.style.display = "none";
            advancedBtnElement.textContent = "Advanced mode";
            
        } else {
            advancedElement.style.display = "flex";
            advancedBtnElement.textContent = "Simple mode";
        }
        showAdvanced = !showAdvanced;
    }

    update();

    document.getElementById("mult3").addEventListener("click", function() {
        number *= 3;
        update();
    }, false);
    document.getElementById("add7").addEventListener("click", function() {
        number += 7;
        update();
    }, false);
    document.getElementById("div5").addEventListener("click", function() {
        number /= 5;
        update();
    }, false);
    document.getElementById("sub2").addEventListener("click", function() {
        number -= 2;
        update();
    }, false);
    
    document.getElementById("floor").addEventListener("click", function() {
        number = Math.floor(number);
        update();
    }, false);
    document.getElementById("sqrt").addEventListener("click", function() {
        number = Math.sqrt(number);
        update();
    }, false);
    document.getElementById("sqr").addEventListener("click", function() {
        number = Math.pow(number, 2);
        update();
    }, false);
    document.getElementById("log10").addEventListener("click", function() {
        number = Math.log10(number);
        update();
    }, false);

    document.getElementById("advanced-btn").addEventListener("click", toggleAdvanced, false);
}
