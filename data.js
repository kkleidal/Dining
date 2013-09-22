/*** Data management     ***/
/*** Author:  Ken Leidal ***/

/* Prototypes */
function Meal(begin, end, desc) {
	this.timeBegin = begin;
	this.timeEnd = end;
	this.description = desc;
}
function DiningHall(svgID, hallName) {
	this.id = svgID;
	this.name = hallName;
	this.meals = new Array();
	this.lookupMeal = function(time) {
		for (var i = 0; i < this.meals.length; i++) {
			if (this.meals[i].timeBegin <= time && this.meals[i].timeEnd > time) {
				return this.meals[i];
			}
		}
		return -1;
	};
}

var halls = new Array();
var hallsTemp = new Array();
/* Loads all data into halls variable */
function loadDiningData() {
	hallsTemp = new Array();
	loadSimmons();
	loadMaseeh();
	loadBaker();
	loadMcCormick();
	loadNext();
	halls = hallsTemp;
}

function loadSimmons() {
	/* TODO:  Create code which parses data from Simmons dining */
	$.get('fetch.php?h=simmons', function(data) {
		$("#simmons").html(data.replace("<","&lt;").replace(">","&gt;"));
	}, 'text');
}
function loadMaseeh() {
	/* TODO:  Create code which parses data from Maseeh dining */
	$.get('fetch.php?h=maseeh', function(data) {
		$("#maseeh").html(data.replace("<","&lt;").replace(">","&gt;"));
	}, 'text');
}
function loadBaker() {
	/* TODO:  Create code which parses data from Baker dining */
	$.get('fetch.php?h=baker', function(data) {
		$("#baker").html(data.replace("<","&lt;").replace(">","&gt;"));
	}, 'text');
}
function loadMcCormick() {
	/* TODO:  Create code which parses data from McCormick dining */
	$.get('fetch.php?h=mccormick', function(data) {
		$("#mccormick").html(data.replace("<","&lt;").replace(">","&gt;"));
	}, 'text');
}
function loadNext() {
	/* TODO:  Create code which parses data from Next dining */
	$.get('fetch.php?h=next', function(data) {
		$("#next").html(data.replace("<","&lt;").replace(">","&gt;"));
	}, 'text');
}
