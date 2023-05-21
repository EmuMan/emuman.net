const DARK_MODE_COOKIE_KEY = "darkMode";

let oldOnloadGED = window.onload;

window.onload = function() {

    if (oldOnloadGED !== null) oldOnloadGED();

    let root = document.documentElement;

    let darkMode = false;

    function setDarkModeCookie(value) {
        let converted = value ? "true" : "false";
        document.cookie = `${DARK_MODE_COOKIE_KEY}=${converted}; expires=Tue, 19 Jan 2038 04:14:07 GMT`;
    }

    function getDarkModeCookie() {
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(";");
        for (let element of ca) {
            while (element.charAt(0) === ' ') {
                element = element.substring(1);
            }
            if (element.indexOf(DARK_MODE_COOKIE_KEY) === 0) {
                let stringValue = element.substring(DARK_MODE_COOKIE_KEY.length + 1, element.length);
                return stringValue === "true";
            }
        }
        return null;
    }

    function setDarkMode() {
        darkMode = true;
        setDarkModeCookie(true);

        root.style.setProperty("--clr-neutral-000", "#eaedf8");
        root.style.setProperty("--clr-neutral-900", "#0a0a0a");

        root.style.setProperty("--clr-accent-900", "#13042b");
    }

    function setLightMode() {
        darkMode = false;
        setDarkModeCookie(false);

        root.style.setProperty("--clr-neutral-000", "#0a0a0a");
        root.style.setProperty("--clr-neutral-900", "#eaedf8");
        
        root.style.setProperty("--clr-accent-900", "#fafdff");
    }

    document.getElementById("darkmode").addEventListener("click", function () {
        if (darkMode) {
            setLightMode();
        } else {
            setDarkMode();
        }
    });

    if (getDarkModeCookie()) {
        setDarkMode();
    } else {
        setLightMode();
    }

}
