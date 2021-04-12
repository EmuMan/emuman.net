
// https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript
var currentSong = undefined;
var id = undefined;
var seekIsClicked = false;
var songList = [];
var lastVolume = 80;

function durationStr(duration) {
    return ("0" + Math.floor(duration / 60)).slice(-2) + ":" + ("0" + Math.floor(duration % 60)).slice(-2);
};

function newSong(songID, play) {
    // update currently playing text
    $("#playing").text($("#" + songID).find(".song-title").text());
    // update url
    window.history.replaceState(null, null, "?id=" + songID);
    // update playing colors in table
    $("tr").removeClass("playing");
    $("#" + songID).addClass("playing");
    // pause current song
    if (currentSong != undefined) {
        currentSong.pause();
    }
    // create new song
    currentSong = new Audio("/static/music/" + songID + ".mp3");
    // initialize audio volume at 80%
    currentSong.volume = 0.8;
    // initialize seek bar at 0
    $("#seek").val("0");
    $("#seek").attr("value", "0");
    // update duration and seek bar max when meta data is loaded
    currentSong.onloadedmetadata = function() {
        $("#duration").text(durationStr(currentSong.duration));
        $("#seek").attr("max", parseInt(currentSong.duration));
    };
    // when the seek bar is moved, also change the song time
    $("#seek").bind("change", function() {
        currentSong.currentTime = $(this).val();
        if (!isPlaying()) {
            currentSong.pause();
        }
    });
    $(document).on("input", "#volume", function() {
        if (isMuted()) {
            setMuted(false);
        } 
        setVolume($(this).val() / 100);
    });
    // when the song time changes, also move the seek bar
    currentSong.addEventListener("timeupdate", function() {
        if (!seekIsClicked) {
            $("#seek").val(parseInt(currentSong.currentTime));
            $("#seek").attr("value", parseInt(currentSong.currentTime));
            $("#time").text(durationStr(currentSong.currentTime));
        }
    });
    // whether or not to automatically play
    if (play) {
        currentSong.addEventListener("canplaythrough", function() {
            setPlaying(true);
        }, false);
    }
    // when the song ends, go to the next one
    currentSong.addEventListener("ended", function() {
        nextSong();
    });
};

function nextSong() {
    let index = songList.indexOf(id);
    if (index >= songList.length - 1) {
        id = songList[0];
    } else {
        id = songList[index + 1];
    }
    newSong(id, true);
};

function prevSong() {
    let index = songList.indexOf(id);
    if (index == 0) {
        id = songList[songList.length - 1];
    } else {
        id = songList[index - 1];
    }
    newSong(id, true);
};

function isPlaying() {
    return $("#play").find("img").attr("id") === "pause-button";
};

function setPlaying(playingStatus) {
    if (playingStatus) {
        $("#play-button").attr("src", "/static/images/pause.png");
        $("#play-button").attr("id", "pause-button");
        currentSong.play();
    } else {
        $("#pause-button").attr("src", "/static/images/play.png");
        $("#pause-button").attr("id", "play-button");
        currentSong.pause();
    }
};

function isMuted() {
    return $("#mute").find("img").attr("id") === "mute-button";
}

function setMuted(muteStatus) {
    if (muteStatus) {
        $("#speaker-button").attr("src", "/static/images/mute.png");
        $("#speaker-button").attr("id", "mute-button");
        lastVolume = currentSong.volume;
        setVolume(0);
    } else {
        $("#mute-button").attr("src", "/static/images/speaker.png");
        $("#mute-button").attr("id", "speaker-button");
        setVolume(lastVolume);
    }
};

function setVolume(volume) {
    currentSong.volume = volume;
    $("#volume").val(volume * 100);
    $("#volume").attr("value", volume * 100);
}

$(document).ready(function() {
    let searchParams = new URLSearchParams(window.location.search);
    let firstSong = $("#song-table").find("tbody").find("tr").eq(0).attr("id");

    if (!searchParams.has("id")) {
        window.history.replaceState(null, null, "?id=" + firstSong);
        id = firstSong;
    } else {
        id = searchParams.get("id");
    }

    $("#song-table tr").each(function() {
        var currentID = $(this).attr("id");
        var currentIndex = $(this).find(".song-index").text();
        if (currentID != undefined) {
            songList.push(currentID); // add this song id to the list for easy later ordered access (next/prev song, etc.)
            if (currentID === id) {
                $(this).addClass("playing");
            }
            $(this).hover(
                function() {
                    $(this).addClass("hovered"); 
                    $(this).find(".song-index").html('<button><img src="/static/images/small_arrow.png"></button>');
                },
                function() {
                    $(this).removeClass("hovered");
                    $(this).find(".song-index").text(currentIndex);
                }
            );
            $(this).click(function() {
                id = currentID;
                newSong(id, true);
            });
            let song = new Audio("/static/music/" + currentID + ".mp3");
            song.onloadedmetadata = function() {
                $("#" + currentID).find(".song-duration").text(durationStr(this.duration));
            };
        }
    });

    newSong(id, false);

    // so we don't automatically update the seek bar when it is clicked
    $("#seek").mousedown(function() {
        seekIsClicked = true;
    });
    $("body").mouseup(function() {
        seekIsClicked = false;
    });

    $("#play").click(function() {
        setPlaying(!isPlaying());
    });

    $("#prev").click(prevSong);
    $("#next").click(nextSong);

    $("#mute").click(function() {
        setMuted(!isMuted());
    });

    $("#playing").text($("#" + id).find(".song-title").text());

});

