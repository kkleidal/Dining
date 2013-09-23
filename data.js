/*** Data management
     Authors:  Ken Leidal (kkleidal@mit.edu) and John Parsons (parsonsj@mit.edu) ***/

/* Prototypes */
// A prototype class which holds data corresponding to a food item served during a meal, including its tag, name, and any additional description provided
function FoodItem(tagLine, foodName) {
	this.tag = tagLine;
	this.food = foodName;
	this.desc = "";
}
// A prototype class which holds all the relevant data for each meal, including times (and dates) and food items served
function Meal(begin, end, desc) {
	this.timeBegin = begin;
	this.timeEnd = end;
	this.description = desc;
	this.foodItems = new Array();
	// A function which returns all unique food item tags
	this.getTags = function() {
		var tags = new Array();
		for (var i = 0; i < this.foodItems.length; i++) {
			if (this.foodItems[i].tag != "" && tags.indexOf(this.foodItems[i].tag) == -1) {
				tags.push(this.foodItems[i].tag);
			}
		}
		return tags;
	}
	// A function which returns whether or not the meal is occuring at the given time
	this.occursAtTime = function(time) {
		return (this.timeBegin <= time && this.timeEnd > time);
	}
}
// A prototype class which holds all the relevant data for each dining hall, including meals found in the RSS feed
function DiningHall(svgID, hall_Name) {
	this.id = svgID;
	this.hallName = hall_Name;
	this.mealTimes = new Array();
	this.meals = new Array();
	// A function which finds any meals which are occuring at the given time
	this.lookupMeal = function(time) {
		for (var i = 0; i < this.meals.length; i++) {
			if (this.meals[i].occursAtTime(time)) {
				return this.meals[i];
			}
		}
		return -1;
	};
	// A function which returns a TimeRange prototype if a MealTime with the given name is found in the DiningHall's mealTimes array
	this.getMealTime = function(name) {
		for (var i = 0; i < this.mealTimes.length; i++) {
			if (this.mealTimes[i].mealName == name) return this.mealTimes[i].times;
		}
		return -1;
	}
	// Returns all unique food item tags found in its meals
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
// A prototype class which tracks meal names and times to be matched against the meal names found in the RSS feed
function MealTime(meal_Name, timeRange) {
	this.mealName = meal_Name;
	this.times = timeRange;
}
// A prototype class which provides time ranges (in 24-hour time) for meals.  Very primitive
function TimeRange(start, finish) {
	this.begin = start;
	this.end = finish;
}

var halls = new Array(5);
var hallsTemp = new Array(5); // TODO:  Change so that the data is loaded into this variable and then transfered into the halls variable to provide seemless transition for new data
/* Loads all data into halls variable.  Called from index.html */
function loadDiningData() {
	hallsTemp = new Array(5);
	// TODO: a more DRY way of loading more dining halls?
	loadSimmons();
	loadMaseeh();
	loadBaker();
	loadMcCormick();
	loadNext();
	halls = hallsTemp;
}
// function which deletes up to and including a designated search term and then returns the new substring
function deleteTo(orig, searchFor) {
	if (!(orig.indexOf(searchFor) >= 0)) return "";
	var newStr = orig.substring(orig.indexOf(searchFor) + searchFor.length, orig.length);
	return newStr;
}
// Turns RSS into Object-Oriented data structure -- it's magic!
function parseHallData(xml, hall) {
	while (xml.indexOf("<item>") >= 0) {
		// Strip off the header and prepare for parsing:
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
			// find the indices of the next start tags:
			var indexH3 = html.indexOf("<h3>");
			var indexH4 = html.indexOf("<h4>");
			var indexP = html.indexOf("<p>");
			// if there are no more of a certain start tag, hack so that the logic to determine the next start tag actually works:
			if (indexH3 == -1) indexH3 = html.length;
			if (indexH4 == -1) indexH4 = html.length;
			if (indexP == -1) indexP = html.length;
			if (indexP != html.length && indexP < indexH3 && indexP < indexH4) {
				// If there is additional data for a food item (found in paragraph tags), add it to the last recorded food item as a description
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
				// turn time ranges based on hours of operation into actual Date objects:
				var begin = new Date(date.valueOf());
				var end = new Date(date.valueOf());
				
				// Tragically, not all hours are integers. For instance, Baker House Dining opens at 5:30. Here's a workaround:
				var beginHour = Math.floor(mealTimes.begin);
				var beginMinutes = Math.floor((mealTimes.begin - beginHour) * 60);
				var endHour = Math.floor(mealTimes.end);
				var endMinutes = Math.floor((mealTimes.end - endHour) * 60);
				
				// Now we set the beginning/ending hours and minutes
				begin.setHours(beginHour, beginMinutes, 0, 0);
				end.setHours(endHour, endMinutes, 0, 0);
				
				if (mealTimes.end < 5) end.setDate(end.getDate() + 1);
				// add the meal to the dining hall
				hall.meals.push(new Meal(begin, end, mealName));
				html = deleteTo(html, "</h3>");
			} else if (indexH4 != html.length) {
				/* New Food Item! */
				html = deleteTo(html, "<h4>");
				var foodDesc = html.substring(0, html.indexOf("</h4>"));
				var tag = "";
				// Get food tag (the bit of data between the '[' and the ']')
				if (foodDesc.indexOf("[") >= 0) {
					foodDesc = deleteTo(foodDesc, "[");
					tag = foodDesc.substring(0, foodDesc.indexOf("]"));
					foodDesc = deleteTo(foodDesc, "]");
				}
				foodDesc = foodDesc.trim();
				// take what remains as the food's name
				food = new FoodItem(tag, foodDesc);
				// add the food to the newest meal
				hall.meals[hall.meals.length - 1].foodItems.push(food);
				html = deleteTo(html, "</h4>");
			}
		}
	}
}
// Temporary print function to prove that data was transfered from RSS to Object-Oriented data structures smoothly
function printHallData(hall, pId) { // hall:  the DiningHall object to be printed; pId: the id of the <p> object in index.html where data will be displayed
	var outHtml = "<h2>" + hall.hallName + "</h2>\n";
	var mealsServed = 0;
	var now = new Date();
	for (var i = 0; i < hall.meals.length; i++) {
		var meal = hall.meals[i];
		if (!meal.occursAtTime(now)) continue;
		mealsServed++;
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
	if (mealsServed == 0) outHtml += "<p>Nothing :(</p>";
	$("#" + pId).html(outHtml);
}
// Load, parse, and print the Simmons RSS feed:
function loadSimmons() {
	/* TODO:  Create code which parses data from Simmons dining */
	// AJAX call with JQuery to PHP to fetch RSS feed from Bon Appetit
	$.get('fetch.php?h=simmons', function(data) {
		// Create a new DiningHall with SVG id (for graphics use later) "h0" and name "Simmons" in array halls, which has indices 0->4 for each dining hall
		halls[0] = new DiningHall("h0","Simmons");

		// Assign Simmons's meal times, since the RSS feed doesn't include time data
		halls[0].mealTimes.push(new MealTime("Breakfast", new TimeRange(8, 10)));
		halls[0].mealTimes.push(new MealTime("Dinner", new TimeRange(17, 20)));
		halls[0].mealTimes.push(new MealTime("Brunch", new TimeRange(10, 13)));
		halls[0].mealTimes.push(new MealTime("Late Night", new TimeRange(21, 1)));

		// Parse the RSS feed and dump the data into the Object-Oriented Data Structure
		parseHallData(data, halls[0]);
		
		// Call temporary print function to prove that the data was parsed smoothly
		// TODO: update to actual print function? - John
		printHallData(halls[0], "simmons");
	}, 'text');
}
// Load, parse, and print the Maseeh RSS feed:
function loadMaseeh() {
	// AJAX call with JQuery to PHP to fetch RSS feed from Bon Appetit
	
	// Same as above: we download the data for Masseeh
	$.get('fetch.php?h=maseeh', function(data) {
		halls[1] = new DiningHall("h1", "Maseeh");
		var hall = halls[1]; // Make fewer keystrokes with these time saving variables
		var times = hall.mealTimes;
		
		// Assign meal times
		times.push(new MealTime("Breakfast", new TimeRange(8, 11)));
		times.push(new MealTime("Lunch", new TimeRange(11, 15)));
		times.push(new MealTime("Brunch", new TimeRange(10, 13)));
		times.push(new MealTime("Dinner", new TimeRange(17, 21)));
		
		// Parse and print everything
		parseHallData(data, hall);
		printHallData(hall, "maseeh")
		
	}, 'text');
}
// Load, parse, and print the Baker RSS feed:
function loadBaker() {
	// AJAX call with JQuery to PHP to fetch RSS feed from Bon Appetit
	$.get('fetch.php?h=baker', function(data) {
		halls[2] = new DiningHall("h2", "Baker");
		var hall = halls[2]; // Make fewer keystrokes with these time saving variables
		var times = hall.mealTimes;
		
		// Assign meal times
		times.push(new MealTime("Breakfast", new TimeRange(8, 10)));
		times.push(new MealTime("Brunch", new TimeRange(10, 13)));
		times.push(new MealTime("Dinner", new TimeRange(17.5, 20.5))); // The .5 represents 30 minutes when converted
		
		// Parse and print everything
		parseHallData(data, hall);
		printHallData(hall, "baker")
	}, 'text');
}
// Load, parse, and print the McCormick RSS feed:
function loadMcCormick() {
	// AJAX call with JQuery to PHP to fetch RSS feed from Bon Appetit
	$.get('fetch.php?h=mccormick', function(data) {
		halls[3] = new DiningHall("h3", "McCormick");
		var hall = halls[3]; // Make fewer keystrokes with these time saving variables
		var times = hall.mealTimes;
		
		// Assign meal times
		times.push(new MealTime("Breakfast", new TimeRange(8, 10)));
		times.push(new MealTime("Brunch", new TimeRange(10, 13)));
		times.push(new MealTime("Dinner", new TimeRange(17, 20)));
		
		// Parse and print everything
		parseHallData(data, hall);
		printHallData(hall, "mccormick")
		
	}, 'text');
}
// Load, parse, and print the Next RSS feed:
function loadNext() {
	// AJAX call with JQuery to PHP to fetch RSS feed from Bon Appetit
	// Not actually sure if Next House is connected to the Internet due to its remote location.
	// TODO: site inspection of Next house to verify/refute this claim.
	$.get('fetch.php?h=next', function(data) {
		halls[4] = new DiningHall("h4", "Next");
		var hall = halls[4]; // Make fewer keystrokes with these time saving variables
		var times = hall.mealTimes;
		
		// Assign meal times
		times.push(new MealTime("Breakfast", new TimeRange(8, 10)));
		times.push(new MealTime("Brunch", new TimeRange(10, 13)));
		times.push(new MealTime("Dinner", new TimeRange(17.5, 20.5))); // The .5 represents 30 minutes when converted
		
		// Parse and print everything
		parseHallData(data, hall);
		printHallData(hall, "next")
		
	}, 'text');
}
