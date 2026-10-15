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

function fetchGridPrices() {
    fetch("https://visualisations.aemo.com.au/aemo/apps/api/report/ELEC_NEM_SUMMARY", {
        cache: "no-store"
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(function(data) {
        renderGridPrices(data);
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

function renderGridPrices(data) {
    var container = document.getElementById("grid-prices-container");
    if (!container) return;

    var summary = data.ELEC_NEM_SUMMARY || [];
    var pricesList = data.ELEC_NEM_SUMMARY_PRICES || [];

    var regionMap = {};
    pricesList.forEach(function(item) {
        if (item.REGIONID) {
            regionMap[item.REGIONID] = item.RRP;
        }
    });
    summary.forEach(function(item) {
        if (item.REGIONID && item.PRICE !== undefined) {
            regionMap[item.REGIONID] = item.PRICE;
        }
    });

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