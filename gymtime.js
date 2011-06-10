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
			refreshEntries();
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
						refreshEntries();
						jQT.goBack();
					},
					errorHandler
				);
			}
		);
		return false;
	}
	
	function refreshEntries() { 
		//var currentDate = sessionStorage.currentDate; 
		//$('#date h1').text(currentDate);
		//$('#date ul li:gt(0)').remove();
		//
		
		//
		alert(workoutID);
	    $('#exercise ul li:gt(0)').remove();
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
							newEntryRow.appendTo('#exercise ul'); 
							newEntryRow.find('.label').text(row.exercise); 
							//newEntryRow.find('.time').text(row.time);
							$('#workout h1').text(row.exercise);
							//$('#entryTemplate').removeAttr('style'); 
							
						}
						
					},
					errorHandler
				);
			}
		)
	}
	
	function errorHandler(transaction, error) { 
		alert('Oops. Error was '+error.message+' (Code '+error.code+')'); 
		return true;
	}
	