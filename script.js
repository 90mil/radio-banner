// jPlayer setup
$(document).ready(function () {
    $("#jquery_jplayer_1").jPlayer({
        ready: function () {
            $(this).jPlayer("setMedia", {
                mp3: "https://neunzugmilradio.out.airtime.pro/neunzugmilradio_a"
            });
        },
        error: function (event) {
            console.error("jPlayer error:", event.jPlayer.error);
            // Optionally show error in banner
            document.getElementById('radio_banner').innerHTML = 'Audio stream temporarily unavailable';
        },
        play: function () {
            $(this).jPlayer("pauseOthers");
            $('.jp-play').hide();
            $('.jp-pause').show();

            // Notify parent window to pause any playing shows
            if (window.parent !== window) {
                window.parent.postMessage('bannerPlaying', '*');
            }
        },
        pause: function () {
            $('.jp-pause').hide();
            $('.jp-play').show();
        },
        swfPath: "/js",
        supplied: "mp3",
        cssSelectorAncestor: "#jp_container_1",
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true
    });

    $('.jp-play').click(function () {
        $("#jquery_jplayer_1").jPlayer("play");
    });

    $('.jp-pause').click(function () {
        $("#jquery_jplayer_1").jPlayer("pause");
    });
});

// Banner script
const apiUrl = 'https://neunzugmilradio.airtime.pro/api/live-info';

function roundToNearestHalfHourAndAdjustCET(date) {
    // Create a copy of the date to avoid modifying the original
    const adjustedDate = new Date(date);

    // Get timezone offset in hours for the current date
    // During summer time (DST) it will be 2, during winter time it will be 1
    const cetOffset = adjustedDate.getTimezoneOffset() === -120 ? 2 : 1;

    // Add the correct offset
    adjustedDate.setHours(adjustedDate.getHours() + cetOffset);

    const minutes = adjustedDate.getMinutes();
    let roundedMinutes;

    if (minutes < 15) {
        roundedMinutes = 0;
    } else if (minutes < 45) {
        roundedMinutes = 30;
    } else {
        roundedMinutes = 0;
        adjustedDate.setHours(adjustedDate.getHours() + 1);
    }

    adjustedDate.setMinutes(roundedMinutes, 0, 0);
    return adjustedDate;
}

async function fetchLiveInfo() {
    try {
        const response = await fetch(apiUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        updateBanner(data);
    } catch (error) {
        console.error('Error fetching track information:', error);
        document.getElementById('radio_banner').innerHTML = 'Error loading track information.';
    }
}

function updateBanner(data) {
    const banner = document.getElementById('radio_banner');
    let bannerText = '';

    if (data.current && data.current.type === 'livestream') {
        if (data.currentShow && data.currentShow.length > 0) {
            const showName = data.currentShow[0].name || "No Show Name";
            bannerText = `<a style="font-weight:bold">${showName}</a> - <span class="live-text">LIVE</span>`;
        } else {
            bannerText = `Live Broadcast - <span class="live-text">LIVE</span>`;
        }
    } else if (data.current && data.current.type === 'track') {
        let trackName = "Unknown Track";

        if (data.currentShow && data.currentShow.length > 0) {
            if (data.currentShow[0].name === "90mil Radio") {
                trackName = data.current.name || "Unknown Track";
            } else {
                trackName = data.currentShow[0].name || "Unknown Track";
            }
        } else {
            trackName = data.current.name || "Unknown Track";
        }

        let startTime = "Unknown Start Time";
        let endTime = "Unknown End Time";
        try {
            startTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.starts))
                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            endTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.ends))
                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error('Error processing time information:', e);
        }

        bannerText = `<a style="font-weight:bold">${trackName}</a> - ${startTime} - ${endTime}`;
    } else {
        bannerText = 'No information available.';
    }

    const scrollingText = `<p class="scrolling-text">${bannerText} &nbsp;</p><p class="scrolling-text">${bannerText} &nbsp;</p><p class="scrolling-text">${bannerText} &nbsp;</p>`;
    banner.innerHTML = scrollingText;
}

// Initial fetch and set interval for frequent updates
fetchLiveInfo();
setInterval(fetchLiveInfo, 300000); // Update every 5 minutes

// Add message listener at the top level
window.addEventListener('message', function (event) {
    if (event.data === 'pause') {
        $("#jquery_jplayer_1").jPlayer("pause");
    }
}); 