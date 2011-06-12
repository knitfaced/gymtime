	var jQT = $.jQTouch({
		icon: 'kilo.png', 
		statusBar: 'black'
	});
	
	
	var db
	var workoutID
	$(document).ready(function(){
		$('#createWorkout form').submit(createWorkout);
		$('#settings form').submit(saveSettings);
		$('#settings').bind('pageAnimationStart', loadSettings);
		$('#workouts li a').click(function(){
			workoutID = this.id; 
			refreshWorkout();
		});
		var shortName = 'gymtime';
		var version = '1.0';
		var displayName = 'gymtime';
		var maxSize = 65536;
		db = openDatabase(shortName, version, displayName, maxSize);
		db.transaction(
			function(transaction) {
				transaction.executeSql(
					'CREATE TABLE IF NOT EXISTS entries ' +
					' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
					'	exercise TEXT NOT NULL, ' +
					' time INTEGER NOT NULL );'
				);
			}
		);
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
		var time = $('#time').val();
		db.transaction(
			function(transaction) {
				transaction.executeSql(
					'INSERT INTO entries (exercise, time) VALUES (?, ?);',
					[exercise, time],
					function(){
						refreshWorkouts();
						jQT.goBack();
					},
					errorHandler
				);
			}
		);
		return false;
	}
	
	function refreshWorkout() { 
	    $('#workout ul li:gt(0)').remove();
		db.transaction(
			function(transaction) {
				transaction.executeSql(
					'SELECT * FROM entries WHERE id=?;',
					[workoutID],
					function (transaction, result) {
						
						for (var i=0; i < result.rows.length; i++) {
							var row = result.rows.item(i); 
							var newEntryRow = $('#entryTemplate').clone(); 
							newEntryRow.removeAttr('id'); 
							newEntryRow.removeAttr('style'); 
							newEntryRow.data('entryId', row.id); 
							newEntryRow.appendTo('#workout ul'); 
							newEntryRow.find('.label').text(row.exercise); 
							newEntryRow.find('.time').text(row.time);
							$('#workout h1').text(row.exercise);
							//$('#entryTemplate').removeAttr('style'); 
							
						}
						
					},
					errorHandler
				);
			}
		)
	}
	
	
	function buildURL(){
	
	}
	
	function refreshWorkouts() { 
	    $('#workouts ul li:gt(0)').remove();
		db.transaction(
			function(transaction) {
				transaction.executeSql(
					'SELECT * FROM entries;',
					[],
					function (transaction, result) {
						for (var i=0; i < result.rows.length; i++) {
							var row = result.rows.item(i); 
							var linkURL = "<a id=\"" + row.id + "\"" + " href=\"#workout\">" + row.exercise + "</a>"
							var newEntryRow = $('#entryTemplateWorkout').clone(); 
							newEntryRow.removeAttr('id'); 
							newEntryRow.removeAttr('style'); 
							newEntryRow.data('entryId', row.id); 
							newEntryRow.appendTo('#workouts ul'); 
							newEntryRow.find('.label').html(linkURL); 
							newEntryRow.find('.time').text(row.time);
							newEntryRow.find('.delete').click(function(){ 
								var clickedEntry = $(this).parent(); 
								var clickedEntryId = clickedEntry.data('entryId'); 
								deleteEntryById(clickedEntryId); clickedEntry.slideUp();
							});			
						}
						
					},
					errorHandler
				);
			}
		)
	}
	
	function deleteEntryById(id) { 
		db.transaction(
			function(transaction) {
				transaction.executeSql('DELETE FROM entries WHERE id=?;',
				[id], null, errorHandler);
			}
		);
	}
	
	function errorHandler(transaction, error) { 
		alert('Oops. Error was '+error.message+' (Code '+error.code+')'); 
		return true;
	}
	