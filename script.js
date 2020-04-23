var apiKey = "dd9db9b8-cd8a-43be-906b-60b309490362";

// Prefilter to allow access to protected HTTPS urls
// In ajax calls, add parameter crossDomain: true to enable
jQuery.ajaxPrefilter(function(options) {
	if (options.crossDomain && jQuery.support.cors) {
		options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
	}
});

$(document).ready(function() {

	// Replace state with query selector for dropdown
	var state = "KS";
	// Replace park name with query selector for keyword input
	var name = "Tuttle Creek Cove";

	// Replace placeholderBtn with submit button ID
	$("#placeholderBtnState").on("click", function(e) {
		e.preventDefault();
		$("#placeholder-div").empty();

		searchState(state, 0);
	});

	$("#placeholderBtnName").on("click", function(e) {
		e.preventDefault();
		$("#placeholder-div").empty();

		searchParkName(name, 0);
	});
});

// Function to search campsites in a specific state
function searchState(state, offset) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?state=" + state + "&offset=" + offset + "&full=true&apikey=" + apiKey,
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
		url: "https://ridb.recreation.gov/api/v1/facilities?query=" + name + "&offset=" + offset + "&full=true&apikey=" + apiKey,
		method: "GET",
		crossDomain: true
	}).then(function(facilities) {
		console.log(facilities);
		var rec = facilities.RECDATA;
		var meta = facilities.METADATA;

		filterForCampsites(rec);
		
		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchParkName(name, offset);
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
$("placeholderBtnState").click(function(){
	function renderStateDropdown(){
		$("<select>").addClass("select")
			.attr("id","stateSelect")
			.appendTo("#placeholder-div");
		}
	function renderSubmitBtn(){
		$("<button>").addClass("button")
			.attr("type","submit")
			.attr("id","submitBtn")
			.appendTo("#placeholder-div");
		}

	var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
	for (var i = 0; i < states.length; i++) {
		$("<option>").text(states[i])
			.attr("value", states[i])
			.appendTo($("#stateSelect"));
        }
});

//  Create Name Input Function
$("#placeholderBtnName").click(function(){
	function renderInput(){
		$("<input>").addClass("input")
			.attr("type","text")
			.attr("placeholder","Search by Name")
			.attr("id","nameInput")
			.appendTo("#placeholder-div");
	}
	function renderSubmitBtn(){
		$("<button>").addClass("button")
			.attr("type","submit")
			.attr("id","submitBtn")
			.appendTo("#placeholder-div");
		}
});

// UserInput Return
$("#submitBtn").click(function(){
	var userInput = $("#nameInput");
	var name = userInput.val();
	// Run the search by Name function

	var userSelect = $("stateSelect");
	var state = userSelect.val();
	// Run the search by State function
});

