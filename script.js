var ridbApiKey = "dd9db9b8-cd8a-43be-906b-60b309490362";
var openweathermapApiKey = "40c8ddef7d6dcf0fa45ee70ad6205851";

// Prefilter to allow access to protected HTTPS urls
// In ajax calls, add parameter crossDomain: true to enable
jQuery.ajaxPrefilter(function(options) {
	if (options.crossDomain && jQuery.support.cors) {
		options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
	}
});

$(document).ready(function() {

	$("[href=\"#index\"]").click(function() {
		$("#inputs").empty();
		$(".hero").html("<h1 class=\"title is-large\">Campsite of the Day</h1>");
	})

	$("[href=\"#state\"]").click(function() {
		$("#inputs").empty();
		$(".hero").html("<h1 class=\"title is-large\">Search by State</h1>");

		renderStateDropdown();
		renderSubmitBtn();
	});
	
	$("[href=\"#name\"]").click(function() {
		$("#inputs").empty();
		$(".hero").html("<h1 class=\"title is-large\">Search by name</h1>");

		renderInputName();
		renderSubmitBtn();
	});

	$("[href=\"#city\"]").click(function() {
		$("#inputs").empty();
		$(".hero").html("<h1 class=\"title is-large\">Search by City</h1>");

		renderInputCity();
		renderSubmitBtn();
	});
	
	// Replace placeholderBtn with submit button ID
	$("#inputs").on("submit", function(e) {
		e.preventDefault();
		
		if ($("#nameInput").val()) {
			var name = $("#nameInput").val();
			
			searchParkName(name, 0);
			
		} else if ($("#cityInput").val()) {
			var city = $("#cityInput").val();
			
			$.ajax({
				url: "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + openweathermapApiKey,
				method: "GET"
			}).then(function(weatherData) {				
				lat = weatherData.coord.lat;
				lon = weatherData.coord.lon;
				searchCoords(lat, lon, 0);
			})
			
		} else {
			var state = $("#stateSelect").val();
			
			searchState(state, 0);
		}
	});
	
	$("[href=\"#near-me\"]").click(function() {
		$("#inputs").empty();
		$(".hero").html("<h1 class=\"title is-large\">Campsites Near You</h1>");
		navigator.geolocation.getCurrentPosition(getCoords);

		function getCoords(position) {				
			searchCoords(position.coords.latitude, position.coords.longitude, 0);
		}
	});

	$(".hero").on("click", ".put-classes-here", function() {
		$("#inputs").empty();
		populateCampsiteInfo(this.getAttribute("data-facilityID"));
	})
});

// Function to search campsites in a specific state
function searchState(state, offset) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?state=" + state + "&offset=" + offset + "&full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function(facilities) {
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
	}).then(function(facilities) {
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
	}).then(function(facilities) {
		var rec = facilities.RECDATA;
		var meta = facilities.METADATA;

		filterForCampsites(rec);
		
		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchCity(lat, lon, offset);
		}
	})
}

function filterForCampsites(rec) {
	for (var i = 0; i < rec.length; i++) {
		if (rec[i].FacilityTypeDescription === "Campground") {
	
			$(".hero").append($("<article>").addClass("put-classes-here")
													   .attr("data-facilityID", rec[i].FacilityID)
													   .text(rec[i].FacilityName));
		}
	}
}

function populateCampsiteInfo(identification) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities/" + identification + "?full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function(campground) {
		console.log(campground);
		$(".hero").html("<h1 class=\"title is-large\">" + campground.FacilityName + "</h1>");

		$(".hero").append($("<p>").html(campground.FacilityDescription));

		var addr = campground.FACILITYADDRESS[0];
		$(".hero").append($("<p>").text("Address: " + addr.FacilityStreetAddress1 + " " + addr.AddressStateCode + ", " + addr.AddressCountryCode + " " + addr.PostalCode));

		$(".hero").append($("<p>").html("Phone: " + campground.FacilityPhone + "    Online At: <a href=\"" + campground.LINK[0].URL + "\">" + campground.LINK[0].URL + "</a>"));
	})
}

// Creat State Dropdown Function  
function renderStateDropdown() {
	$("<select>").addClass("select")
		.attr("id","stateSelect")
		.appendTo("#inputs");

		var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
		for (var i = 0; i < states.length; i++) {
			$("<option>").text(states[i])
				.attr("value", states[i])
				.appendTo($("#stateSelect"));
		}
}

function renderSubmitBtn() {
	$("<button>").addClass("button")
		.attr("type","submit")
		.attr("id","submitBtn")
		.text("Submit")
		.appendTo("#inputs");
}

//  Create Name Input Function
function renderInputName() {
	$("<input>").addClass("input")
		.attr("type","text")
		.attr("placeholder","Search by Name")
		.attr("id","nameInput")
		.appendTo("#inputs");
}

function renderInputCity() {
	$("<input>").addClass("input")
		.attr("type","text")
		.attr("placeholder","Search by City")
		.attr("id","cityInput")
		.appendTo("#inputs");
}