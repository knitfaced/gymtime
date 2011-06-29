var jQT = $.jQTouch({
    icon: 'kilo.png',
    statusBar: 'black'
});


var db;
var workoutID;
$(document).ready(function () {
    $('#createWorkout form').submit(createWorkout);
    $('#createWorkoutPart form').submit(createWorkoutPart);
    $('#settings form').submit(saveSettings);
    $('#settings').bind('pageAnimationStart', loadSettings);
    var shortName, version, displayName, maxSize;
    shortName = 'gymtime';
    version = '1.0';
    displayName = 'gymtime';
    maxSize = 65536;
    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(

    function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS entries ' + ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + '	exercise TEXT NOT NULL);');
    });
    db.transaction(

    function (transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS workoutparts ' + ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + '	workoutpart TEXT NOT NULL, ' + '	exerciseID INTEGER NOT NULL, ' + ' timewp INTEGER NOT NULL );');

    });
    refreshWorkouts();

});



function loadSettings() {
    $('#age').val(localStorage.age);
    $('#budget').val(localStorage.budget);
    $('#weight').val(localStorage.weight);
}

function saveSettings() {
    localStorage.age = $('#age').val();
    localStorage.budget = $('#budget').val();
    localStorage.weight = $('#weight').val();
    jQT.goBack();
    return false;
}

function createWorkout() {
    // var date = sessionStorage.currentDate;
    var exercise = $('#exercise').val();
    //var time = $('#time').val();
    db.transaction(

    function (transaction) {
        transaction.executeSql('INSERT INTO entries (exercise) VALUES (?);', [exercise], function () {
            refreshWorkouts();
            jQT.goBack();
        }, errorHandler);
    });
    return false;
}

function createWorkoutPart(clickedEntryID) {
    var workoutpart = $('#workoutpart').val();
    var timewp = $('#timewp').val();
    var exerciseID = $('.idvalue').text();
    db.transaction(

    function (tx) {
        tx.executeSql('INSERT INTO workoutparts (workoutpart, timewp, exerciseID) VALUES (?, ?, ?);', [workoutpart, timewp, exerciseID], function () {
            refreshWorkout(exerciseID);
            jQT.goBack();
        }, errorHandler);
    });
    return false;
}

function refreshWorkout(clickedEntryID, ClickedEntryName) {
    $('#workout ul li:gt(0)').remove();
    $('#workout h1').text(ClickedEntryName);
    //	$('#createWorkoutPart h1').text(clickedEntryID);
    $('#createWorkoutPart .idvalue').text(clickedEntryID);
    db.transaction(

    function (transaction) {
        transaction.executeSql('SELECT * FROM workoutparts WHERE exerciseID=?;', [clickedEntryID], function (transaction, result) {

            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                var newEntryRow = $('#entryTemplate').clone();
                newEntryRow.removeAttr('id');
                newEntryRow.removeAttr('style');
                newEntryRow.data('entryId', row.id);
                newEntryRow.appendTo('#workout ul');
                newEntryRow.find('.label').text(row.workoutpart);
                newEntryRow.find('.time').text(row.timewp);
                newEntryRow.find('.delete').click(function () {
                    var clickedWorkoutPart = $(this).parent();
                    var clickedWorkoutPartID = clickedWorkoutPart.data('entryId');
                    deleteWorkoutPartById(clickedWorkoutPartID);
                    refreshWorkout(clickedEntryID);
                });

            }

        }, errorHandler);
    })

}


function refreshWorkouts() {
    $('#workouts ul li:gt(0)').remove();
    db.transaction(

    function (transaction) {
        transaction.executeSql('SELECT * FROM entries;', [], function (transaction, result) {
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                var linkURL = "<a id=\"" + row.id + "\"" + " href=\"#workout\">" + row.exercise + "</a>"
                var linkURL2 = "<a id=\"" + row.id + "\"" + " href=\"#doworkout\">" + row.exercise + "</a>"
                var newEntryRow = $('#entryTemplateWorkout').clone();
                newEntryRow.removeAttr('id');
                newEntryRow.removeAttr('style');
                newEntryRow.data('entryId', row.id);
                newEntryRow.data('exercise', row.exercise);
                newEntryRow.appendTo('#workouts ul');
                newEntryRow.find('.label').html(linkURL).click(function () {
                    var clickedEntry = $(this).parent();
                    var clickedEntryID = clickedEntry.data('entryId');
                    var ClickedEntryName = clickedEntry.data('exercise');
                    refreshWorkout(clickedEntryID, ClickedEntryName);
                });

                newEntryRow.find('.time').text(row.time);
                newEntryRow.find('.go').html(linkURL2).click(function () {
                    var clickedEntry = $(this).parent();

                    var clickedEntryID = clickedEntry.data('entryId');
                    var ClickedEntryName = clickedEntry.data('exercise');
                    doworkout(clickedEntryID, ClickedEntryName);
                });
                newEntryRow.find('.delete').click(function () {
                    var clickedEntry = $(this).parent();
                    var clickedEntryID = clickedEntry.data('entryId');
                    deleteEntryById(clickedEntryID);
                    clickedEntry.slideUp();
                    refreshWorkout();

                });
            }

        }, errorHandler);
    })
}

function doworkout(clickedEntryID, ClickedEntryName) {
    $('#doworkout h1').text(ClickedEntryName);
    db.transaction(

    function (transaction, result) {
        transaction.executeSql('SELECT * FROM workoutparts WHERE exerciseID=?;', [clickedEntryID], function (transaction, result) {
 
           for (var i = 0; i < result.rows.length; i++) {
                var row, countdown;
                row = result.rows.item(i);
								alert('i='+i+' starting workoutpart: '+row.workoutpart);                
								countdown_number = row.timewp;
                $('div.workoutbox').html(row.workoutpart + ' ' + '(' + ClickedEntryName + ')');
                $('#countdown_text').html(countdown_number);
                countdown_trigger();
                function countdown_trigger() {
                    //alert(countdown_number);                    
										$('#countdown_text').html(countdown_number);                    
										if (--countdown_number > 0) {                        
                        setTimeout(function(){countdown_trigger()}, 1000);         
                    }
                    else{
                        $('#countdown_text').html("Done");
                    }
                }
								alert('i='+i+' finished workoutpart: '+row.workoutpart);                
            }

        }, errorHandler);
    })
}



function deleteEntryById(id) {
    db.transaction(

    function (transaction) {
        transaction.executeSql('DELETE FROM entries WHERE id=?;', [id], null, errorHandler);
    });
}

function deleteWorkoutPartById(id) {
    db.transaction(

    function (transaction) {
        transaction.executeSql('DELETE FROM workoutparts WHERE id=?;', [id], null, errorHandler);
    });
}

function errorHandler(transaction, error) {
    alert('Oops. Error was ' + error.message + ' (Code ' + error.code + ')');
    return true;
}
