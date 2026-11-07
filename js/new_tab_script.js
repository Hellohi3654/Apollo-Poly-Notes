$(document).ready(function() {
    updateClock(); //initial loading of clock
    initGridPrices(); //initial loading of NEM grid prices

    setTimeout(function() {
        $("#icon-wrapper").css({
            'opacity': 1
        }, 200); //fade in icons on load
    }, 100);

    i = setTimeout(function() { //fade out icons on load after 2 seconds
        $("#icon-wrapper").css({
            'opacity': 0
        }, 400);
    }, 2000);

    setTimeout(function() { //fade in #time-wrapper on load
        $("#time-wrapper").css({
            'opacity': 1
        }, 200);
    }, 100);

});

function findIndexByKeyValue(array, property, string) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == string) {
            return i;
        }
    }
    return null;
}

function updateClock() { //get time
    var d = new Date();
    var date = d.getDate();
    var hour = d.getHours();
    if (hour <= 9) {
        hour = "0" + hour;
    }
    var minute = d.getMinutes();
    if (minute <= 9) {
        minute = "0" + minute;
    }
    var second = d.getSeconds();
    if (second <= 9) {
        second = "0" + second;
    }
    var weekday = new Array(7);
    weekday[0] = "SUNDAY";
    weekday[1] = "MONDAY";
    weekday[2] = "TUESDAY";
    weekday[3] = "WEDNESDAY";
    weekday[4] = "THURSDAY";
    weekday[5] = "FRIDAY";
    weekday[6] = "SATURDAY";
    var day = weekday[d.getDay()];
    var monthno = new Array(12);
    monthno[0] = "JANUARY";
    monthno[1] = "FEBRUARY";
    monthno[2] = "MARCH";
    monthno[3] = "APRIL";
    monthno[4] = "MAY";
    monthno[5] = "JUNE";
    monthno[6] = "JULY";
    monthno[7] = "AUGUST";
    monthno[8] = "SEPTEMBER";
    monthno[9] = "OCTOBER";
    monthno[10] = "NOVEMBER";
    monthno[11] = "DECEMBER";
    var month = monthno[d.getMonth()];
    switch (date) {
        case 1:
        case 21:
        case 31:
            date = date + "st";
            break;
        case 2:
        case 22:
            date = date + "nd";
            break;
        case 3:
        case 23:
            date = date + "rd";
            break;
        default:
            date = date + "th";
            break;
    }

    document.getElementById("date").innerHTML = day + "<br>" + date + " of " + month;
    var fullTime = hour + ":" + minute + ":" + second;
    document.getElementById("time").innerHTML = fullTime;
    document.getElementById("tab_title").innerHTML = "New Tab - " + fullTime;
    setTimeout(updateClock, 500); //refresh clock every second
}

/* =========================================
   AEMO NEM LIVE GRID PRICES
   ========================================= */

function initGridPrices() {
    fetchGridPrices();
}

var NEMWEB_DISPATCH_DIR = "https://nemweb.com.au/Reports/Current/DispatchIS_Reports/";

function fetchGridPrices() {
    // 1. Read the NEMWeb directory listing and pick the newest dispatch zip
    fetch(NEMWEB_DISPATCH_DIR, { cache: "no-store" })
    .then(function(response) {
        if (!response.ok) throw new Error("HTTP error " + response.status + " (listing)");
        return response.text();
    })
    .then(function(html) {
        var matches = html.match(/PUBLIC_DISPATCHIS_\d{12}_\d+\.zip/gi);
        if (!matches || !matches.length) throw new Error("No dispatch files found in listing");
        matches.sort();
        var latest = matches[matches.length - 1];
        // 2. Download the zip
        return fetch(NEMWEB_DISPATCH_DIR + latest, { cache: "no-store" });
    })
    .then(function(response) {
        if (!response.ok) throw new Error("HTTP error " + response.status + " (zip)");
        return response.arrayBuffer();
    })
    // 3. Unzip and parse the CSV
    .then(unzipFirstFile)
    .then(function(csvText) {
        renderGridPrices(parseDispatchPrices(csvText));
        scheduleNextGridPriceFetch();
    })
    .catch(function(err) {
        console.error("[NEM Prices] Fetch error:", err);
        var container = document.getElementById("grid-prices-container");
        if (container && !container.querySelector(".state-price-card")) {
            container.innerHTML = '<div class="price-card-loading">Unable to load NEM prices (retrying in 15s)...</div>';
        }
        setTimeout(fetchGridPrices, 15000);
    });
}

// Minimal zip reader: extracts the first file using the central directory
// and the browser's built-in DecompressionStream (no external libraries).
function unzipFirstFile(buffer) {
    var view = new DataView(buffer);
    var bytes = new Uint8Array(buffer);

    // Find the End Of Central Directory record (signature 0x06054b50)
    var eocd = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) return Promise.reject(new Error("Invalid zip (no EOCD)"));

    var cdOffset = view.getUint32(eocd + 16, true);
    if (view.getUint32(cdOffset, true) !== 0x02014b50) {
        return Promise.reject(new Error("Invalid zip (bad central directory)"));
    }
    var method = view.getUint16(cdOffset + 10, true);
    var compSize = view.getUint32(cdOffset + 20, true);
    var localOffset = view.getUint32(cdOffset + 42, true);

    // Local file header: fixed 30 bytes + file name + extra field
    var nameLen = view.getUint16(localOffset + 26, true);
    var extraLen = view.getUint16(localOffset + 28, true);
    var dataStart = localOffset + 30 + nameLen + extraLen;
    var data = bytes.subarray(dataStart, dataStart + compSize);

    if (method === 0) {
        return Promise.resolve(new TextDecoder().decode(data));
    }
    if (method !== 8) {
        return Promise.reject(new Error("Unsupported zip compression method " + method));
    }
    var stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Response(stream).text();
}

// Pull regional RRP ($/MWh) values out of the DISPATCH,PRICE table of a DispatchIS CSV.
function parseDispatchPrices(csvText) {
    var regionMap = {};
    var header = null;
    var lines = csvText.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf("I,DISPATCH,PRICE,") === 0) {
            header = line.split(",");
        } else if (header && line.indexOf("D,DISPATCH,PRICE,") === 0) {
            var cols = line.split(",");
            var region = cols[header.indexOf("REGIONID")];
            var intervention = cols[header.indexOf("INTERVENTION")];
            var rrp = parseFloat(cols[header.indexOf("RRP")]);
            // Prefer the non-intervention (pricing) run if both exist
            if (region && !isNaN(rrp) && (intervention === "0" || !(region in regionMap))) {
                regionMap[region] = rrp;
            }
        }
    }
    if (!Object.keys(regionMap).length) throw new Error("No DISPATCH PRICE rows in CSV");
    return regionMap;
}

function scheduleNextGridPriceFetch() {
    var now = new Date();
    // Offset is 1 min 30 seconds (90s) after each 5 min interval (300s block)
    var secondsIntoBlock = (now.getMinutes() % 5) * 60 + now.getSeconds() + (now.getMilliseconds() / 1000);
    var targetOffset = 90; // 1m 30s
    var secondsToWait;

    if (secondsIntoBlock >= (targetOffset - 0.5)) {
        secondsToWait = (300 - secondsIntoBlock) + targetOffset;
    } else {
        secondsToWait = targetOffset - secondsIntoBlock;
    }

    var msToWait = Math.round(secondsToWait * 1000);
    console.log("[NEM Prices] Next fetch scheduled in " + Math.round(secondsToWait) + "s");
    setTimeout(fetchGridPrices, msToWait);
}

function renderGridPrices(regionMap) {
    var container = document.getElementById("grid-prices-container");
    if (!container) return;

    var regions = [
        { code: "NSW", id: "NSW1" },
        { code: "QLD", id: "QLD1" },
        { code: "VIC", id: "VIC1" },
        { code: "SA",  id: "SA1" },
        { code: "TAS", id: "TAS1" }
    ];

    var cardsHtml = "";
    regions.forEach(function(r) {
        var priceVal = regionMap[r.id];
        var priceText = "--";
        var priceClass = "price-normal";

        if (typeof priceVal === "number" && !isNaN(priceVal)) {
            var rounded = priceVal.toFixed(2);
            if (rounded === "-0.00") rounded = "0.00";
            if (priceVal < 0) {
                priceText = "-$" + Math.abs(priceVal).toFixed(2);
                priceClass = "price-negative";
            } else {
                priceText = "$" + Number(rounded).toFixed(2);
                if (priceVal > 300) {
                    priceClass = "price-spike";
                } else if (priceVal > 100) {
                    priceClass = "price-elevated";
                } else {
                    priceClass = "price-normal";
                }
            }
        }

        cardsHtml += '<div class="state-price-card" title="' + r.code + ' Live Spot Price">' +
            '<span class="state-code">' + r.code + '</span>' +
            '<span class="state-price ' + priceClass + '">' + priceText + '</span>' +
            '<span class="state-unit">$/MWh</span>' +
            '</div>';
    });

    container.innerHTML = cardsHtml;
}