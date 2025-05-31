const bannerApiWeek = 'https://neunzugmilradio.airtime.pro/api/week-info';
const bannerApiLive = 'https://neunzugmilradio.airtime.pro/api/live-info';

function getCurrentDayKey(date) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
}

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function roundToNearestHalfHourAndAdjustCET(date) {
    const adjustedDate = new Date(date);
    const cetOffset = adjustedDate.getTimezoneOffset() === -120 ? 2 : 1;
    adjustedDate.setHours(adjustedDate.getHours() + cetOffset);
    const m = adjustedDate.getMinutes();
    adjustedDate.setMinutes(m < 15 ? 0 : m < 45 ? 30 : (adjustedDate.setHours(adjustedDate.getHours() + 1), 0), 0, 0);
    return adjustedDate;
}

function formatShowInfo(title, start, end) {
    const startStr = roundToNearestHalfHourAndAdjustCET(new Date(start)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const endStr = roundToNearestHalfHourAndAdjustCET(new Date(end)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${title}<span class="dot">·</span>${startStr} – ${endStr}`;
}

function formatScheduleShowInfo(title, start, end) {
    const startStr = new Date(start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
    const endStr = new Date(end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
    return `${title}<span class="dot">·</span>${startStr} – ${endStr}`;
}

function displayBanner(text, isLive = false) {
    const bannerText = `${text}${isLive ? ' <span class="live-text">LIVE</span>' : ''}`;
    const content = `<p class="scrolling-text">${Array(12).fill(`<span>${bannerText}</span>`).join('\n')}</p>`;
    document.getElementById('radio_banner').innerHTML = content;
}

function displayErrorMessage() {
    const fallback = [
        '... warming up the valve amps ...',
        '... aligning the tape heads ...',
        '... stabilizing vacuum tubes ...'
    ];
    const message = fallback[Math.floor(Math.random() * fallback.length)];
    displayBanner(message);
}

function getCurrentScheduledShow(data) {
    const now = new Date();
    const shows = data[getCurrentDayKey(now)] || [];
    return shows.find(s => s.name !== '90mil Radio' &&
        new Date(s.start_timestamp) <= now &&
        new Date(s.end_timestamp) > now);
}

function buildDisplayTitle(rawTitle) {
    const title = decodeHtmlEntities(rawTitle).replace(/\.mp3$/, '');
    if (title.includes("hosted by")) {
        const [main, host] = title.split("hosted by").map(part => part.trim());
        return `<span style="font-weight:bold">${main}</span><span class="dot">·</span><span style="font-style:italic">hosted by ${host}</span>`;
    }
    return `<span style="font-weight:bold">${title}</span>`;
}

async function fetchBannerInfo() {
    try {
        // Step 1: Try schedule
        const weekRes = await fetch(bannerApiWeek, { cache: 'no-store' });
        if (weekRes.ok) {
            const weekData = await weekRes.json();
            const show = getCurrentScheduledShow(weekData);
            if (show) {
                const displayTitle = buildDisplayTitle(show.name);
                return displayBanner(formatScheduleShowInfo(displayTitle, show.start_timestamp, show.end_timestamp));
            }
        }

        // Step 2: Try live-info
        const liveRes = await fetch(bannerApiLive, { cache: 'no-store' });
        if (liveRes.ok) {
            const data = await liveRes.json();
            const show = data.currentShow?.[0];
            const meta = data.current?.metadata;

            if (show?.name && show.name !== '90mil Radio') {
                const displayTitle = buildDisplayTitle(show.name);
                return displayBanner(formatShowInfo(displayTitle, data.current.starts, data.current.ends), data.current?.type === 'livestream');
            }

            if (meta?.track_title) {
                const displayTitle = buildDisplayTitle(meta.track_title);
                return displayBanner(formatShowInfo(displayTitle, data.current.starts, data.current.ends));
            }
        }

        displayErrorMessage();
    } catch (err) {
        console.error("Banner fetch error:", err);
        displayErrorMessage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchBannerInfo();
    setInterval(fetchBannerInfo, 300000); // every 5 minutes
});
