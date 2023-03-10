window.onload = function() {
    window.onscroll = function() {updateNavbar()};
    var navbar = document.getElementById("main-navbar");
    var mainContent = document.getElementById("main-content");
    var sticky = navbar.offsetTop;
    function updateNavbar() {
        if (window.pageYOffset >= sticky) {
            navbar.classList.add("sticky");
            mainContent.classList.add("solo");
        } else {
            navbar.classList.remove("sticky");
            mainContent.classList.remove("solo");
        }
    }
};
