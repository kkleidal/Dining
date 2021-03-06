var diningHalls = ["Simmons","Maseeh","Baker","McCormick","Next"];
var originalFills = new Array(diningHalls.length);
var grayFill = "#212121";

guiCtrlInit = function() {
	// TODO:  Write function for when page is fully loaded

	// Select default hall
	var defaultHall = getDefaultHall();
	selectedHall = defaultHall;
	clickLnk(selectedHall);
	
	// Load original fill colors
	for (var i = 0; i < diningHalls.length; i++) {
		originalFills[i] = $("#poly" + diningHalls[i]).css("fill");
	}
	
	loadDiningData(function() {
		clickLnk(selectedHall);
	});
};
var selectedHall = 1;
clickLnk = function(hallId) {
	// TODO:  Finish code for what happens when a link for a dining hall is clicked
	selectedHall = hallId;
	for (var i = 0; i < diningHalls.length; i++) {
		// Change selected tab:
		var curId = "#mnu" + diningHalls[i];
		$(curId).toggleClass("current_page_item", i == hallId);
		
		// Make current hall glow:
		toggleGlow(i, i == hallId);
	}
	if (hallsLoaded != null && hallsLoaded[hallId]) printHallData(hallId);
	else $("#results").html("<p class=\"desc\">Loading Data...</p>");
};
lnkDefault = function() {
	setDefaultHall(selectedHall);
}
/*hallColor = function(hallId, isGray) {
	var strGoalColor = grayFill;
	if (!isGray) strGoalColor = originalFills[hallId];
	goalState = { "fill" : strGoalColor }
	$("#poly" + diningHalls[hallId]).animate(goalState, 5000, function() {
		alert("Animation Complete");
	});
};
fadeHall = function(hallId, opacity) {
	var hallName = diningHalls[hallId];
	var jqueryRef = "#graphics" + hallName;
	var linkJR = "#bldg" + hallName;
	if (opacity == 0) {
		$(linkJR).click("");
	} else {
		$(linkJR).click("clickLnk(diningHalls.indexOf('" + hallName + "'));");
	}
	$(jqueryRef).fadeTo(opacity, 5000, function() { });
}*/
hallColor = function(hallId, opacity, duration) {
	var hallName = diningHalls[hallId];
	var jqueryRef = "#graphics" + hallName;	
	var linkJR = "#bldg" + hallName;
	goalState = { "opacity" : opacity }
	if (opacity == 0) {
		$(linkJR).click("");
	} else {
		$(linkJR).click("clickLnk(diningHalls.indexOf('" + hallName + "'));");
	}
	$(jqueryRef).animate(goalState, duration, function() {
		// Animation complete
	});
};
toggleGlow = function(hallId, glow) {
	var curId = "#poly" + diningHalls[hallId];
	var val = "none";
	if (glow) val = "url('#dropGlow')";
	$(curId).css("filter", val);
}
