$(document).ready(function() {
    updateClock(); //initial loading of clock
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

})

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


    document.getElementById("date").innerHTML = day + " " + date + " of " + month;
    document.getElementById("time").innerHTML = hour + ":" + minute + ":" + second;
    document.getElementById("tab_title").innerHTML = "New Tab - " + hour + ":" + minute + ":" + second;
    setTimeout(updateClock, 500); //refresh clock every second
}