const element = document.getElementById("season")
element.addEventListener("change", (e) => {
    window.location.replace("https://www.emuman.net/cbrenders?season=" + e.target.value);
})
