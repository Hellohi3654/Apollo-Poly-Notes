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

    chrome.storage.sync.get(['active', 'noteObject'], function(data) { //FOLDERS
        var noteObject = data.noteObject;
        var existingFolders = [];
        if (noteObject) {
            for (i = 0; i < noteObject.length; i++) {
                if (existingFolders.indexOf(noteObject[i].folder) === -1) {
                    existingFolders.push(noteObject[i].folder);
                }
            }
        }
        //chrome.storage.sync.remove('noteObject');
        if (!noteObject || noteObject[0].folder == "") { //ADD DEFAULT FOLDERS IF NONE FOUND
            var noteObject = [{
                "folder": "All",
                "notes": []
            }, {
                "folder": "Work",
                "notes": []
            }, {
                "folder": "Personal",
                "notes": []
            }];
            $('#add').before("<li>" + noteObject[i] + "</li>")
            chrome.storage.sync.set({
                'noteObject': noteObject
            });
        } else {
            for (i = 0; i < existingFolders.length; i++) {
                if (existingFolders[i] !== "") {
                    $('#add').before("<li title=" + existingFolders[i] + ">" + existingFolders[i] + "</li>");
                }
            }
        }

        var active = data.active; //set active tag on last active menu
        if (!active) {
            $('#folders li:nth-child(1)').addClass('active-tab');
        } else {
            for (var i = 0; i < noteObject.length + 1; i++) { //LOOP FOLDERS
                if ($('#folders li:nth-child(' + i + ')').text().toLowerCase() === active.toLowerCase()) { //IF FOLDER TEXT MATCHES STORED ACTIVE TAG
                    $('#folders li:nth-child(' + i + ')').addClass('active-tab'); //ADD CLASS ACTIVE-TAB CLASS
                }
            }
            for (i = 0; i < noteObject.length; i++) { //LOOP FOLDERS IN ARRAY
                if (noteObject[i].note) {
                    if (noteObject[i].folder == active) { //IF OBJECT FOLDER = ACTIVE TAG
                        $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].note + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                    } else if (active == "All") {
                        $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].note + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                    }
                }
            }
        }


        var noteFolder = $('.active-tab').text(); //load notes
        for (var i = 0; i < noteObject.length; i++) {
            if (noteObject[i].folder == noteFolder) {
                for (var j = 0; j < noteObject[i].notes.length; j++) {
                    $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].notes[j] + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                }
            } else if (noteFolder == "All") {
                for (var j = 0; j < noteObject[i].notes.length; j++) {
                    $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].notes[j] + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                }
            }
        }

        $('#add').click(function() { // add folders
            $("<li contenteditable='true'></li>").insertBefore('#add');
            $('#add').prev().focus();
        })

        $(document).on('dblclick', '#folders li', function(e) { //double click to edit
            var folderName = $(this).text();
            if (folderName != "All") {
                $(this).attr('contenteditable', 'true');
                $(this).focus();
            }
            var folderName = $(this).attr('title');
            $(this).text(folderName);
        })

        $(document).on('keyup keydown', '#folders li', function(e) { //leave input when enter is pressed or shift enter
            if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13) || (e.keyCode == 13 && e.shiftKey)) {
                e.preventDefault();
                $(this).blur();
            }
        })

        $(document).on('focus', '#folders li', function() {
            var oldFolderName = $(this).text();
            var noteObjectIndex = findIndexByKeyValue(noteObject, "folder", $(this).text());
            if (noteObject) {
                for (i = 0; i < noteObject.length; i++) {
                    if (noteObject[i].folder === oldFolderName && noteObject[i].note) {
                        notes.push(noteObject[i].note);
                    }
                }
            }

            var currentFolders = [];
            for (i = 0; i < $('#folders li').length; i++) {
                currentFolders.push($('#folders li:nth-child(' + i + ')').text().toLowerCase());
            }

            $(this).on('focusout', function() {
                var folderName = $(this).text();
                $('#folders li').removeAttr('contenteditable');
                $('#folders li').removeClass('active-tab');
                $(this).addClass('active-tab');


                var currentFolderIndex = currentFolders.indexOf(folderName.toLowerCase()); //INDEX OF ALREADY EXISITING FOLDER IN ARRAY OF CURRENTFOLDERS
                if (folderName === "" || folderName.trim().length <= 0) { //IF FOLDER IS EMPTY
                    $('#folders li:nth-child(1)').addClass('active-tab');
                    chrome.storage.sync.set({
                        "active": $('#folders li:nth-child(1)').text()
                    })
										var nowActive = $('.active-tab').text();
                    $(this).remove();
										$('#notes-wrapper .note').remove();
										for (var i = 0; i < noteObject.length; i++){
											for(var j = 0; j < noteObject[i].notes.length; j++){
												if(noteObject[i].folder !== oldFolderName){
													$("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].notes[j] + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
												}
											}
										}
                    for (i = noteObject.length - 1; i >= 0; i--) {
                        if (!noteObjectIndex) {

                        } else if (noteObjectIndex >= 0) {
                            if (noteObject[i].folder === oldFolderName) {
                                noteObject.splice(i, 1);
                            }
                        } else {

                        }
                    }
                } else { //IF FOLDER NAME ISN'T EMPTY
                    if (oldFolderName) {}
                    if (!oldFolderName && currentFolderIndex !== -1) { //IF FOLDERNAME IS FOUND
                        $(this).remove(); //REMOVE FOLDER
                        $('#folders li:nth-child(' + currentFolderIndex + ')').addClass('active-tab'); //ADD ACTIVE-TAB TO FOLDER THAT TRIED TO BE CREATED BUT ALREADY EXISTS
                        chrome.storage.sync.set({
                            "active": folderName
                        });
                    } else if (oldFolderName && currentFolderIndex !== -1) {
                        var oldFolderIndex = currentFolders.indexOf(oldFolderName.toLowerCase());
                        $('#folders li:nth-child(' + oldFolderIndex + ')').text(oldFolderName);
                    } else { //IF NEW FOLDER NAME DOESN'T ALREADY EXIST
                        if (oldFolderName) { //IF FOLDER EXISTED AND IS BEING RENAMED
                            for(var i = 0; i < noteObject.length; i++){
															if(noteObject[i].folder == oldFolderName){
																noteObject[i].folder = folderName;
																chrome.storage.sync.set({
				                            "active": folderName
				                        });
																break;
															}
														}
                        } else { //IF FOLDER IS NEW
                            $(this).attr('title', folderName);
                            noteObject.push({
                                "folder": folderName,
                                "notes": []
                            }); //ADD NEW FOLDER TO ARRAY
                            chrome.storage.sync.set({
                                "active": folderName
                            }); //SYNC NEW ACTIVE TAG
                            $('#folders li:last').prev().addClass('active-tab'); //ADD ACTIVE TAG TO NEW FOLDER
                        }
                    }
                }
                chrome.storage.sync.set({
                    'noteObject': noteObject
                });
                //chrome.storage.sync.remove('noteObject');
            })
        })


        $("#folders").on("click", "li", function() { // show notes to specific folder
            var noteFolder = $(this).text();

            $('#notes-wrapper .note').remove();
            for (i = 0; i < noteObject.length; i++) {
                if (noteObject[i].folder == noteFolder) {

                    for (var j = 0; j < noteObject[i].notes.length; j++) {
                        $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].notes[j] + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                    }
                } else if (noteFolder == "All") {
                    for (var j = 0; j < noteObject[i].notes.length; j++) {
                        $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteObject[i].notes[j] + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                    }
                }
            }
        })


        $("#input-box").keypress(function(e) { //create notes
            var noteText = $('#input-box').val();
            var noteFolder = $('.active-tab').text();
            if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                if (noteText != "" && noteText != " " && noteText.charAt(0) != " ") {
                    for (var i = 0; i < noteObject.length; i++) {
                        if (noteObject[i].folder == noteFolder) {
                            noteObject[i].notes.push(noteText);
                            $("#notes-wrapper").prepend("<div class='note'><span contenteditable='true'>" + noteText + "</span><div class='remove glyphicon glyphicon-remove'></div> </div>");
                            $(this).val('');
                            chrome.storage.sync.set({
                                'noteObject': noteObject
                            });
                        }
                    }
                } else {
                    $(this).val('');
                }
            }
        });



        $(document).on('focus', '.note>span', function() { //edit notes
						var ogStored = $(this).text();
            var storedNote = $(this).text();
            //var storedNoteIndex = findIndexByKeyValue(noteObject, "note", storedNote);
						// for(var i=0; i<noteObject.length; i++){
						// 	if(noteObject[i].notes.includes(storedNote)){
						// 		var storedNoteIndex = noteObject[i].notes[];
						// 	}
						// }
            //var foundFolder = noteObject[storedNoteIndex].folder;


            $(this).on('keydown keyup', function(e) { //save notes on keyup
                var newNoteText = $(this).text();

                if ((e.keyCode == 13) || (e.keyCode == 13 && e.shiftKey)) {
                    e.preventDefault();
                    window.getSelection().removeAllRanges();
                }
                if (newNoteText != "" && newNoteText != " " && newNoteText.charAt(0) != " ") {
                    var newNoteText = $(this).text();
										for(var i = 0; i < noteObject.length; i++){
											for(var j = 0; j < noteObject[i].notes.length; j++){
												if(noteObject[i].notes[j] == storedNote){
													noteObject[i].notes[j] = newNoteText;
													storedNote = newNoteText;
												}
											}
										}
                     chrome.storage.sync.set({
                         'noteObject': noteObject
                     });
                } else {
                    for(var i = 0; i < noteObject.length; i++){
											for(var j = 0; j <noteObject[i].notes.length; j++){
												if(noteObject[i].notes[j] == storedNote){
													noteObject[i].notes.splice(j, 1);
													$(this).parent().remove();
												}
											}
										}
                    chrome.storage.sync.set({
                        'noteObject': noteObject
                    });
                }
            });
        })

        $(document).on('click', '.remove', function() { //removes note if X is pressed
            var text = $(this).parent().text();
            var toFind = (text.substring(0, text.length - 1));
            for (var i = 0; i < noteObject.length; i++) {
                if (noteObject[i].notes.includes(toFind)) {
                    storedNoteIndex = noteObject[i].notes.indexOf(toFind);
                    noteObject[i].notes.splice(storedNoteIndex, 1);
                    $(this).parent().remove();
                    chrome.storage.sync.set({
                        'noteObject': noteObject
                    });
                }
            }
        });
    })

    $(document).on('click', '#folders li', function() { //add active tab
        var active = $(this).text();
        $('#folders li').removeClass('active-tab');
        $(this).addClass('active-tab');
        chrome.storage.sync.set({
            "active": active
        });
    })

    $("#folders").mousewheel(function(event, delta) { //scroll folders with mouse wheel
        this.scrollLeft -= (delta * 30);
        event.preventDefault();
    });

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
