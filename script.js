
// var ridbApiKey = "51757596-4204-498b-a768-10846f885937";
// var ridbApiKey = "f768af14-4499-4dee-9ed7-bca0d58fdf85";
var ridbApiKey = "dd9db9b8-cd8a-43be-906b-60b309490362";
var openweathermapApiKey = "40c8ddef7d6dcf0fa45ee70ad6205851";
var myListArray = [];
var renderArray = []; // To hold all names without refresh

if (localStorage.getItem("data")) {
	myListArray = localStorage.getItem("data").split(",");
}

console.log(myListArray);
// Prefilter to allow access to protected HTTPS urls
// In ajax calls, add parameter crossDomain: true to enable
jQuery.ajaxPrefilter(function (options) {
	if (options.crossDomain && jQuery.support.cors) {
		options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
	}
});

$(document).ready(function () {

	$("[href=\"#index\"]").click(function () {
		$("#results").empty();
		$('#results-nav').toggle(false);
		$("#form-container").toggle(false);
		$('#index').toggle(true);
		$('#inputs').empty();
		// $(".hero").html("<h1 class=\"title is-large\">Campsite of the Day</h1>");
	})

	$("[href=\"#state\"]").click(function () {
		$("#results").empty();
		$('#results-nav').toggle(true);
		$("#form-container").toggle(true);
		$('#panel-heading').text('Search By State');
		$('#index').toggle(false);
		$('#inputs').empty();
		// $(".hero").html("<h1 class=\"title is-large\">Search by State</h1>");

		renderStateDropdown();
		renderSubmitBtn();
	});

	$("[href=\"#name\"]").click(function () {
		$("#results").empty();
		$('#results-nav').toggle(true);
		$("#form-container").toggle(true);
		$('#panel-heading').text('Name Search');
		$('#index').toggle(false);
		$('#inputs').empty();
		// $(".hero").html("<h1 class=\"title is-large\">Search by name</h1>");

		renderInputName();
		renderSubmitBtn();
	});

	$("[href=\"#city\"]").click(function () {
		$("#results").empty();
		$('#results-nav').toggle(true);
		$("#form-container").toggle(true);
		$('#panel-heading').text('Search By City');
		$('#index').toggle(false);
		$('#inputs').empty();
		// $(".hero").html("<h1 class=\"title is-large\">Search by City</h1>");

		renderInputCity();
		renderSubmitBtn();
	});

	$("#inputs").on("submit", function (e) {
		e.preventDefault();
		$("#results").empty();

		renderArray = [];

		if ($("#nameInput").val()) {
			var name = $("#nameInput").val();

			searchParkName(name, 0);

		} else if ($("#cityInput").val()) {
			var city = $("#cityInput").val();

			$.ajax({
				url: "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + openweathermapApiKey,
				method: "GET"
			}).then(function (weatherData) {
				lat = weatherData.coord.lat;
				lon = weatherData.coord.lon;
				searchCoords(lat, lon, 0);
			})

		} else {
			var state = $("#stateSelect").val();

			searchState(state, 0);
		}

	});

	// Dragging into mycampsite
	$("#panel-heading").on("click", "#campground-name", function () {
		var listID = $(this).attr("data-facilityID");
		console.log(this);

		$("#campground-name").draggable({
			snap: ".dropSave"
		});
		// Just using footer for now since we dont have any place to put in yet
		$("[href=\"#my-campsites\"]").droppable({
			drop: function (event, ui) {
				if (!myListArray.includes(listID)) {
					myListArray.unshift(listID);
				}

				localStorage.setItem("data", myListArray.toString());
				var name = $("#campground-name").text();
				$('#panel-heading').empty().append($("<p>").text(name)
					.attr("id", "campground-name")
					.attr("data-facilityID", listID));
			}
		});
	});
	// My Campsite display pulling from localStorage
	$("[href=\"#my-campsites\"]").click(function () {
		$("#inputs").empty();
		$("#panel-heading").text("");
		$("#results-nav").toggle(true);
		$("#results").empty().attr('class', 'is-visible');
		$(".hero").html("<h1 class=\"title is-large\">My Campsites</h1>");

		if (localStorage.getItem("data")) {
			var myListArray = localStorage.getItem("data").split(",");
			for (var i = 0; i < myListArray.length; i++) {
				searchParkID(myListArray[i]);
			}
		}
	});

	$("[href=\"#near-me\"]").click(function () {
		$("#results").empty();
		$('#results-nav').toggle(true);
		$("#form-container").toggle(false);
		$('#panel-heading').text('Campsites Near You');
		$('#index').toggle(false);
		$('#inputs').empty();
		// $(".hero").html("<h1 class=\"title is-large\">Campsites Near You</h1>");
		navigator.geolocation.getCurrentPosition(getCoords);
		renderArray = [];

		function getCoords(position) {
			searchCoords(position.coords.latitude, position.coords.longitude, 0);
		}
	});

	$("#results").on("click", ".panel-block", function () {
		$("#form-container").toggle(false);
		$('#inputs').empty();
		populateCampsiteInfo(this.getAttribute("data-facilityID"));
	});
});

// Function to search campsites in a specific state
function searchState(state, offset) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?state=" + state + "&offset=" + offset + "&full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function (facilities) {
		var rec = facilities.RECDATA;
		var meta = facilities.METADATA;

		// Filter through facilities looking for only campsites
		filterForCampsites(rec);

		// Check if all results are avalible, if not, print more
		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchState(state, offset);
		}
	});
}

// Function to search campsites with name/keyword/description/stay limit
function searchParkName(name, offset) {

	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?query=" + name + "&offset=" + offset + "&full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function (facilities) {
		var rec = facilities.RECDATA;
		var meta = facilities.METADATA;

		filterForCampsites(rec);

		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchParkName(name, offset);
		}
	})

}

// Function to search campsites near input city
function searchCoords(lat, lon, offset) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?latitude=" + lat + "&longitude=" + lon + "&offset=" + offset + "&full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function (facilities) {
		var rec = facilities.RECDATA;
		var meta = facilities.METADATA;
		filterForCampsites(rec);


		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchCoords(lat, lon, offset);
		}
	})
}


function filterForCampsites(rec) {
	for (var i = 0; i < rec.length; i++) {
		var obj = {};
		if (rec[i].FacilityTypeDescription === "Campground") {
			obj.name = toTitleCase(rec[i].FacilityName);
			obj.id = rec[i].FacilityID;

		}
		if (Object.keys(obj).length === 0) {
			continue;
		}
		renderArray.push(obj);
	}

	renderResults(renderArray);
}


function renderResults(array) {
	renderArray = array;
	$('#results').empty();

	$(renderArray).each(function (index) {
		$("#results").append($("<li>").addClass("panel-block")
			.attr("data-facilityID", renderArray[index].id)
			.text(renderArray[index].name));
	})

}

function populateCampsiteInfo(identification) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities/" + identification + "?full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function (campground) {
		console.log(campground);
		$("#results").empty();

		// $(".hero").html("<h1 class=\"title is-large\">" + campground.FacilityName + "</h1>");
		$('#panel-heading').empty().append($("<p>").text(campground.FacilityName)
			.attr("id", "campground-name")
			.attr("data-facilityID", identification));

		$("#results").append($("<p>").html(campground.FacilityDescription));

		var addr = campground.FACILITYADDRESS[0];
		$("#results").append($("<p>").text("Address: " + addr.FacilityStreetAddress1 + " " + addr.AddressStateCode + ", " + addr.AddressCountryCode + " " + addr.PostalCode));

		$("#results").append($("<p>").html("Phone: " + campground.FacilityPhone + "    Online At: <a href=\"" + campground.LINK[0].URL + "\">" + campground.LINK[0].URL + "</a>"));

		campgroundWeather(campground.FacilityLatitude, campground.FacilityLongitude);
	});
}

function searchParkID(identification) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities/" + identification + "?full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function (campground) {
		$("#results").append($("<li>").addClass("panel-block")
			.attr("data-facilityID", campground.FacilityID)
			.text(campground.FacilityName));
	});
}

function campgroundWeather(lat, lon) {
	$.ajax({
		url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + openweathermapApiKey,
		method: "GET"
	}).then(function (weatherObj) {
		console.log(weatherObj);

		$("#results").append($("<h2>").text("7 Day Forecast"));
		var weatherDiv = $("<div>");

		for (var i = 0; i < weatherObj.daily.length; i++) {
			weatherDiv.append($("<p>").text(moment.unix(weatherObj.daily[i].dt).format("M/D/YYYY")));
			weatherDiv.append($("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherObj.daily[i].weather[0].icon + ".png"));
			weatherDiv.append($("<p>").text("Temp: " + (Math.round(weatherObj.daily[i].temp.day * 10) / 10) + "° F"));
		}
		$("#results").append(weatherDiv);
	})
}

// Creat State Dropdown Function  
function renderStateDropdown() {
	var input = $("<select>").addClass("select")
		.attr("id", "stateSelect");

	var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
	for (var i = 0; i < states.length; i++) {
		$("<option>").text(states[i])
			.attr("value", states[i])
			.appendTo($(input));
	}
	var field = $('<div class="field">');
	field.html('<label class="label">Select a State</label>');
	field.append(input).appendTo('#inputs');
}

function renderSubmitBtn() {
	$("<button class='is-inline'>").addClass("button")
		.attr("type", "submit")
		.attr("id", "submitBtn")
		.text("Submit")
		.appendTo(".field");
}

//  Create Name Input Function
function renderInputName() {
	var input = $("<input>").addClass("input")
		.attr("type", "text")
		.attr("placeholder", "Search by Name")
		.attr("id", "nameInput");
	var field = $('<div class="field">');
	field.html('<label class="label">Name of Campsite</label>');
	field.append(input).appendTo('#inputs');

}

function renderInputCity() {
	var input = $("<input>").addClass("input")
		.attr("type", "text")
		.attr("placeholder", "Search by City")
		.attr("id", "cityInput");
	var field = $('<div class="field">');
	field.html('<label class="label">City</label>');
	field.append(input).appendTo('#inputs');
}


//Consistent Title Case for Names
function toTitleCase(str) {
	var lcStr = str.toLowerCase();
	return lcStr.replace(/(?:^|\s)\w/g, function (match) {
		return match.toUpperCase();
	});
}