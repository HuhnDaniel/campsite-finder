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
		$("#placeholder-div").empty();
	})

	$("[href=\"#state\"]").click(function() {
		$("#inputs").empty();
		renderStateDropdown();
		renderSubmitBtn();
	});
	
	$("[href=\"#name\"]").click(function() {
		$("#inputs").empty();
		renderInputName();
		renderSubmitBtn();
	});

	$("[href=\"#city\"]").click(function() {
		$("#inputs").empty();
		renderInputCity();
		renderSubmitBtn();
	});
	
	// Replace placeholderBtn with submit button ID
	$("#inputs").on("submit", function(e) {
		e.preventDefault();
		
		if ($("#nameInput").val()) {
			var name = $("#nameInput").val();
			
			$("#placeholder-div").empty();
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
			
			$("#placeholder-div").empty();
			searchState(state, 0);
		}
	});
	
		$("[href=\"#near-me\"]").click(function() {
			$("#inputs").empty();
			$("#placeholder-div").empty();

			navigator.geolocation.getCurrentPosition(getCoords);
			function getCoords(position) {				
				searchCoords(position.coords.latitude, position.coords.longitude, 0);
			}

		});
});

// Function to search campsites in a specific state
function searchState(state, offset) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?state=" + state + "&offset=" + offset + "&full=true&apikey=" + ridbApiKey,
		method: "GET",
		crossDomain: true
	}).then(function(facilities) {
		console.log(facilities);
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
	
			// Replace placeholder-div with list target div
			$("#placeholder-div").append($("<article>").addClass("put-classes-here")
													   .attr("data-facilityID", rec[i].FacilityID)
													   .text(rec[i].FacilityName));
		}
	}
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
		.text("submit")
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