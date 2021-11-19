window.onload = function() {
    let now = new Date();
    let period = now.getHours() <= 11 ? 'AM' : 'PM';
    let hours = now.getHours() % 12;
    if (hours == 0) hours = 12;
    hours = hours.toString().padStart(2, '0')
    let minutes = now.getMinutes();
    minutes = minutes.toString().padStart(2, '0')
    document.getElementById("time").textContent = `${hours}:${minutes}${period}`;
}