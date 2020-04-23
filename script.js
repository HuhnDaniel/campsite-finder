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

	// Replace placeholderBtn with submit button ID
	$("#placeholderBtn").on("click", function(e) {
		e.preventDefault();
		searchState(state, 0);
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
		for (var i = 0; i < rec.length; i++) {
			if (rec[i].FacilityTypeDescription === "Campground") {

				// Replace placeholder-div with list target div
				$("#placeholder-div").append($("<article>").addClass("put-classes-here")
														   .attr("data-facilityID", rec[i].FacilityID)
														   .text(rec[i].FacilityName));
			}
		}
		console.log(meta.RESULTS.CURRENT_COUNT, meta.RESULTS.TOTAL_COUNT);

		// Check if all results are avalible, if not, print more
		if ((meta.RESULTS.CURRENT_COUNT + offset) < meta.RESULTS.TOTAL_COUNT) {
			offset += meta.SEARCH_PARAMETERS.LIMIT;
			searchState(state, offset);
		}
	});
}