/*** Data management     ***/
/*** Author:  Ken Leidal ***/

/* Prototypes */
function FoodItem(tagLine, foodName) {
	this.tag = tagLine;
	this.food = foodName;
	this.desc = "";
}
function Meal(begin, end, desc) {
	this.timeBegin = begin;
	this.timeEnd = end;
	this.description = desc;
	this.foodItems = new Array();
	this.getTags = function() {
		var tags = new Array();
		for (var i = 0; i < this.foodItems.length; i++) {
			if (this.foodItems[i].tag != "" && tags.indexOf(this.foodItems[i].tag) == -1) {
				tags.push(this.foodItems[i].tag);
			}
		}
		return tags;
	}
}
function DiningHall(svgID, hall_Name) {
	this.id = svgID;
	this.hallName = hall_Name;
	this.mealTimes = new Array();
	this.meals = new Array();
	this.lookupMeal = function(time) {
		for (var i = 0; i < this.meals.length; i++) {
			if (this.meals[i].timeBegin <= time && this.meals[i].timeEnd > time) {
				return this.meals[i];
			}
		}
		return -1;
	};
	this.getMealTime = function(name) {
		for (var i = 0; i < this.mealTimes.length; i++) {
			if (this.mealTimes[i].mealName == name) return this.mealTimes[i].times;
		}
		return -1;
	}
	this.getTags = function() {
		var tags = new Array();
		for (var i = 0; i < this.meals.length; i++) {
			var mealTags = this.meals[i].getTags();
			for (var t = 0; t < mealTags.length; t++) {
				if (tags.indexOf(mealTags[i]) == -1) tags.push(mealTags[i]);
			}
		}
		return tags;
	}
}
function MealTime(meal_Name, timeRange) {
	this.mealName = meal_Name;
	this.times = timeRange;
}
function TimeRange(start, finish) {
	this.begin = start;
	this.end = finish;
}

var halls = new Array(5);
var hallsTemp = new Array(5);
/* Loads all data into halls variable */
function loadDiningData() {
	hallsTemp = new Array(5);
	loadSimmons();
	loadMaseeh();
	loadBaker();
	loadMcCormick();
	loadNext();
	halls = hallsTemp;
}
function deleteTo(orig, searchFor) {
	if (!(orig.indexOf(searchFor) >= 0)) return "";
	var newStr = orig.substring(orig.indexOf(searchFor) + searchFor.length, orig.length);
	return newStr;
}
function parseHallData(xml, hall) {
	while (xml.indexOf("<item>") >= 0) {
		xml = deleteTo(xml, "<item>");
		xml = deleteTo(xml, "<title>");
		var strDate = xml.substring(0, xml.indexOf("</title>"));
		var date = new Date(strDate);
		xml = deleteTo(xml, "<description>");
		var html = xml.substring(0, xml.indexOf("</description>"));
		html = html.replace(new RegExp("&lt;", 'g'),"<").replace(new RegExp("&gt;", 'g'),">").replace(new RegExp("&amp;", 'g'),"&").replace(new RegExp("&nbsp;", 'g')," ");
		/* alert(html); */
		while (html.indexOf("<h4>") >= 0 || html.indexOf("<h3>") >= 0 || html.indexOf("<p>") >= 0) {
			/* Tag available for parsing */
			var indexH3 = html.indexOf("<h3>");
			var indexH4 = html.indexOf("<h4>");
			var indexP = html.indexOf("<p>");
			if (indexH3 == -1) indexH3 = html.length;
			if (indexH4 == -1) indexH4 = html.length;
			if (indexP == -1) indexP = html.length;
			if (indexP != html.length && indexP < indexH3 && indexP < indexH4) {
				html = deleteTo(html, "<p>");
				var desc = html.substring(0, html.indexOf("</p>"));
				var foods = hall.meals[hall.meals.length - 1].foodItems;
				var food = foods[foods.length - 1];
				food.desc = desc;
				html = deleteTo(html, "</p>");
			}
			else if (indexH3 != html.length && indexH3 < indexH4) {
				/* alert("h3") */
				/* New Meal! */
				html = deleteTo(html, "<h3>");
				var mealName = html.substring(0, html.indexOf("</h3>"));
				var mealTimes = hall.getMealTime(mealName);
				/* alert(mealTimes.begin); */
				if (mealTimes.begin == undefined) {
					mealName = "Unknown Meal";
					mealTimes.begin = 0;
					mealTimes.end = 24;
				}
				var begin = new Date(date.valueOf());
				var end = new Date(date.valueOf());
				begin.setHours(mealTimes.begin, 0, 0, 0);
				end.setHours(mealTimes.end, 0, 0, 0);
				if (mealTimes.end < 5) end.setDate(end.getDate() + 1);
				hall.meals.push(new Meal(begin, end, mealName));
				html = deleteTo(html, "</h3>");
			} else if (indexH4 != html.length) {
				/* New Food Item! */
				html = deleteTo(html, "<h4>");
				var foodDesc = html.substring(0, html.indexOf("</h4>"));
				var tag = "";
				if (foodDesc.indexOf("[") >= 0) {
					foodDesc = deleteTo(foodDesc, "[");
					tag = foodDesc.substring(0, foodDesc.indexOf("]"));
					foodDesc = deleteTo(foodDesc, "]");
				}
				foodDesc = foodDesc.trim();
				food = new FoodItem(tag, foodDesc);
				hall.meals[hall.meals.length - 1].foodItems.push(food);
				html = deleteTo(html, "</h4>");
			}
		}
	}
}
function loadSimmons() {
	/* TODO:  Create code which parses data from Simmons dining */
	$.get('fetch.php?h=simmons', function(data) {
		halls[0] = new DiningHall("h0","Simmons");
		halls[0].mealTimes.push(new MealTime("Breakfast", new TimeRange(8, 10)));
		halls[0].mealTimes.push(new MealTime("Dinner", new TimeRange(17, 20)));
		halls[0].mealTimes.push(new MealTime("Brunch", new TimeRange(10, 13)));
		halls[0].mealTimes.push(new MealTime("Late Night", new TimeRange(21, 1)));
		parseHallData(data, halls[0]);
		var outHtml = "<h2>Simmons</h2>\n";
		for (var i = 0; i < halls[0].meals.length; i++) {
			var meal = halls[0].meals[i];
			outHtml += "<h3>" + meal.description + " (" + meal.timeBegin.toLocaleString() + " - " + meal.timeEnd.toLocaleString() + ")</h3>\n";
			outHtml += "<ul>\n";
			for (var f = 0; f < meal.foodItems.length; f++) {
				var food = meal.foodItems[f];
				outHtml += "<li>" + food.tag + ": " + food.food;
				if (food.desc != "") outHtml += " (" + food.desc + ")";
				outHtml += "</li>\n";
			}
			outHtml += "</ul>\n";
		}
		$("#simmons").html(outHtml);
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
