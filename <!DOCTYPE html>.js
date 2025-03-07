< !DOCTYPE html >
    <html lang="en">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>90mil Radio Banner</title>
                    <!-- Google Font: Abel -->
                    <link href="https://fonts.googleapis.com/css2?family=Abel&display=swap" rel="stylesheet">
                        <!-- jQuery -->
                        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                        <!-- jPlayer CSS -->
                        <link href="https://cdnjs.cloudflare.com/ajax/libs/jplayer/2.9.2/skin/blue.monday/jplayer.blue.monday.min.css" rel="stylesheet" />
                        <!-- jPlayer JS -->
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/jplayer/2.9.2/jplayer/jquery.jplayer.min.js"></script>
                        <style>
                            body {
                                font - family: 'Abel', sans-serif;
        }

                            .radio_banner {
                                background - color: white;
                            color: black;
                            padding: 5px;
                            box-sizing: border-box;
                            width: 100%;
                            height: 30px;
                            position: relative;
                            display: flex;
                            align-items: center;
                            overflow: hidden;
                            font-family: 'Abel', sans-serif;
                            font-size: 14px;
        }

                            .jp-controls-container {
                                display: flex;
                            align-items: center;
                            margin-right: 10px;
        }

                            .jp-controls {
                                display: flex;
                            justify-content: center;
                            align-items: center;
        }

                            .jp-play, .jp-pause {
                                width: 20px;
                            height: 20px;
                            border: 2px solid black;
                            border-radius: 50%;
                            background-color: white;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            transition: background-color 0.3s, border-color 0.3s;
                            position: relative;
                            appearance: none;
        }

                            .jp-play::before {
                                content: '';
                            width: 0;
                            height: 0;
                            border-left: 8px solid black;
                            border-top: 5px solid transparent;
                            border-bottom: 5px solid transparent;
        }

                            .jp-pause::before, .jp-pause::after {
                                content: '';
                            position: absolute;
                            width: 2px;
                            height: 10px;
                            background-color: black;
        }

                            .jp-pause::before {
                                left: 6px;
        }

                            .jp-pause::after {
                                right: 6px;
        }

                            .jp-play:hover, .jp-pause:hover {
                                background - color: #000000;
                            border-color: #ffffff;
        }

                            .jp-play:hover::before {
                                border - left - color: white;
        }

                            .jp-pause:hover::before, .jp-pause:hover::after {
                                background - color: white;
        }

                            .scrolling-container {
                                display: flex;
                            white-space: nowrap;
                            overflow: hidden;
                            flex: 1;
        }

                            .scrolling-text {
                                margin - right: 50px;
                            display: inline-block;
                            animation: loopText 15s infinite linear;
        }

                            @keyframes loopText {
                                from {
                                transform: translateX(0%);
            }
                            to {
                                transform: translateX(-100%);
            }
        }

                            .live-text {
                                color: green;
                            font-weight: bold;
        }
                        </style>
                    </head>
                    <body>
                        <div class="radio_banner">
                            <div class="jp-controls-container">
                                <div id="jquery_jplayer_1" class="jp-jplayer"></div>
                                <div id="jp_container_1" class="jp-controls" role="application" aria-label="media player">
                                    <button class="jp-play" role="button" tabindex="0"></button>
                                    <button class="jp-pause" role="button" tabindex="0" style="display:none;"></button>
                                </div>
                            </div>
                            <span style="margin-right: 10px; font-weight: bold;">90mil Radio</span>
                            <div class="scrolling-container" id="radio_banner">
                                Loading...
                            </div>
                        </div>

                        <script>
        // jPlayer setup
                            $(document).ready(function(){
                                $("#jquery_jplayer_1").jPlayer({
                                    ready: function () {
                                        $(this).jPlayer("setMedia", {
                                            mp3: "https://neunzugmilradio.out.airtime.pro/neunzugmilradio_a" // Your stream URL
                                        });
                                    },
                                    play: function () { // To avoid multiple jPlayers playing together.
                                        $(this).jPlayer("pauseOthers");
                                        $('.jp-play').hide();
                                        $('.jp-pause').show();
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

                            $('.jp-play').click(function() {
                                $("#jquery_jplayer_1").jPlayer("play");
            });

                            $('.jp-pause').click(function() {
                                $("#jquery_jplayer_1").jPlayer("pause");
            });
        });

                            // Banner script
                            const apiUrl = 'https://neunzugmilradio.airtime.pro/api/live-info';

                            // Function to round time to the nearest half hour and adjust to CET
                            function roundToNearestHalfHourAndAdjustCET(date) {
                                date.setHours(date.getHours() + 1);  // Add 1 hour for CET adjustment
                            const minutes = date.getMinutes();
                            let roundedMinutes;

                            if (minutes < 15) {
                                roundedMinutes = 0;
            } else if (minutes < 45) {
                                roundedMinutes = 30;
            } else {
                                roundedMinutes = 0; // Move to the next hour if above 45
                            date.setHours(date.getHours() + 1);
            }

                            date.setMinutes(roundedMinutes, 0, 0);  // Set seconds and milliseconds to 0
                            return date;
        }

                            // Fetching live-info with reduced latency
                            async function fetchLiveInfo() {
            try {
                const response = await fetch(apiUrl, {cache: 'no-store' });
                            if (!response.ok) {
                    throw new Error(HTTP error! Status: ${response.status});
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
                            bannerText = <a style="font-weight:bold">${showName}</a> - <span class="live-text">LIVE</span>;
                } else {
                                bannerText = Live Broadcast - <span class="live-text">LIVE</span>;
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
                                startTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.starts)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                            endTime = roundToNearestHalfHourAndAdjustCET(new Date(data.current.ends)).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit' });
                } catch (e) {
                                console.error('Error processing time information:', e);
                }

                            bannerText = <a style="font-weight:bold">${trackName}</a> - ${startTime} - ${endTime};
            } else {
                                bannerText = 'No information available.';
            }

                            const scrollingText = <p class="scrolling-text">${bannerText} &nbsp;</p><p class="scrolling-text">${bannerText} &nbsp;</p><p class="scrolling-text">${bannerText} &nbsp;</p>;
                            banner.innerHTML = scrollingText;
        }

                            // Initial fetch and set interval for frequent updates
                            fetchLiveInfo();
                            setInterval(fetchLiveInfo, 300000); // Update every 5 minutes
                        </script>
                    </body>
                </html>