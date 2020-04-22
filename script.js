var apiKey = "dd9db9b8-cd8a-43be-906b-60b309490362";

// Prefilter to allow access to protected HTTPS urls
// In ajax calls, add parameter crossDomain: true to enable
jQuery.ajaxPrefilter(function(options) {
	if (options.crossDomain && jQuery.support.cors) {
		options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
	}
});

// Function to search campsites in a specific state
var state = "KS";
function searchState(state) {
	$.ajax({
		url: "https://ridb.recreation.gov/api/v1/facilities?state=" + state + "&full=true&apikey=" + apiKey,
		method: "GET",
		crossDomain: true
	}).then(function(facilities) {
		console.log(facilities);

		// Filter through facilities looking for only campsites
		var campsites = [];
		for (var i = 0; i < facilities.RECDATA.length; i++) {
			if (facilities.RECDATA[i].FacilityTypeDescription === "Campground") {
				campsites.push(facilities.RECDATA[i]);
			}
		}
		console.log(campsites);
	});
}

searchState(state);