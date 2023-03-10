window.onload = function() {
    let today = new Date();
    let weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today) 
    let month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today)
    let day = today.getDate();
    let suffix = day%10 == 1 ? "st" : (day%10 == 2 ? "nd" : (day%10 == 3 ? "rd" : "th"))
    document.getElementById("date").textContent = `${weekday}, ${month} ${day}${suffix}`;
}
