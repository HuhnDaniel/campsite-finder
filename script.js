// Prefilter to allow access to protected HTTPS urls
// In ajax calls, add parameter crossDomain: true to enable
jQuery.ajaxPrefilter(function(options) {
	if (options.crossDomain && jQuery.support.cors) {
		options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
	}
});