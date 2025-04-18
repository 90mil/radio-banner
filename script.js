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
            displayErrorMessage();
        },
        play: function () {
            $(this).jPlayer("pauseOthers");
            $('.jp-play').hide();
            $('.jp-pause').show();

            // Notify parent window to pause any playing shows
            if (window.parent !== window) {
                window.parent.postMessage(JSON.stringify({
                    type: 'play',
                    source: 'banner'
                }), '*');
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

// Consolidate messages at the top level
const transitionMessages = [
    '... warming up the valve amps ...',
    '... aligning the tape heads ...',
    '... stabilizing vacuum tubes ...',
];

function getRandomMessage() {
    return transitionMessages[Math.floor(Math.random() * transitionMessages.length)];
}

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

// Add this helper function
function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function displayErrorMessage() {
    const bannerText = getRandomMessage();
    const scrollingText = `
        <p class="scrolling-text">
            ${Array(12).fill(`<span>${bannerText}</span>`).join('\n            ')}
        </p>`;
    document.getElementById('radio_banner').innerHTML = scrollingText;
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
        displayErrorMessage();
    }
}

function updateBanner(data) {
    const banner = document.getElementById('radio_banner');
    let bannerText = '';

    if (data.currentShow && data.currentShow.length > 0) {
        let displayText = "---";
        // Try to get track title from metadata first
        let showName = data.current?.metadata?.track_title
            ? decodeHtmlEntities(data.current.metadata.track_title)
            : decodeHtmlEntities(data.currentShow[0].name);

        // Remove .mp3 extension if present
        showName = showName.replace(/\.mp3$/, '');

        if (showName.includes("hosted by")) {
            const [titlePart, hostPart] = showName.split("hosted by").map(part => part.trim());
            displayText = `<span style="font-weight:bold">${titlePart}</span><span class="dot">·</span><span style="font-style:italic">hosted by ${hostPart}</span>`;
        } else {
            displayText = `<span style="font-weight:bold">${showName}</span>`;
        }

        let startTime = "--:--";
        let endTime = "--:--";
        try {
            startTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.starts))
                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            endTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.ends))
                .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error('Error processing time information:', e);
        }

        bannerText = `${displayText}<span class="dot">·</span>${startTime} – ${endTime}`;

        // Add LIVE indicator if it's a livestream
        if (data.current && data.current.type === 'livestream') {
            bannerText = `${bannerText} <span class="live-text">LIVE</span>`;
        }

    } else {
        bannerText = getRandomMessage();
    }

    const scrollingText = `
        <p class="scrolling-text">
            ${Array(12).fill(`<span>${bannerText}</span>`).join('\n            ')}
        </p>`;
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