
// https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript
$(document).ready(function() {
    let searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has("id")) {
        window.history.replaceState(null, null, "?id=sunset_cafe");
        var id = "sunset_cafe"
    } else {
        var id = searchParams.get("id");
    }
    $("#song-table tr").each(function() {
        var currentID = $(this).attr("id");
        var currentIndex = $(this).find(".song-index").text();
        if (currentID != undefined) {
            if (currentID === id) {
                $(this).addClass("playing");
            }
            $(this).hover(
                function() {
                    $(this).addClass("hovered"); 
                    $(this).find(".song-index").html('<img src="/static/images/small_arrow.png"/>');
                },
                function() {
                    $(this).removeClass("hovered");
                    $(this).find(".song-index").text(currentIndex);
                }
            );
            $(this).click(function() {
                id = currentID;
                $("#playing").text($(this).find(".song-title").text());
                window.history.replaceState(null, null, "?id=" + id);
                $("tr").removeClass("playing");
                $(this).addClass("playing");
            });
            let song = new Audio("/static/music/" + currentID + ".mp3");
            song.onloadedmetadata = function() {
                $("#" + currentID).find(".song-duration").text(Math.floor(this.duration / 60) + ":" + Math.floor(this.duration % 60));
            };
        }
    });
    $("#playing").text($("#" + id).find(".song-title").text())
});
