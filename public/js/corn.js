let oldOnloadGED = window.onload;

window.onload = function() {

    if (oldOnloadGED !== null) oldOnloadGED();

    let redirectToInvite = function() {
        window.location.href = "https://discordapp.com/oauth2/authorize?client_id=461849775516418059&scope=bot&permissions=0";
    }
    
    document.getElementById("add-corn-1").addEventListener("click", redirectToInvite);
    document.getElementById("add-corn-2").addEventListener("click", redirectToInvite);

}
