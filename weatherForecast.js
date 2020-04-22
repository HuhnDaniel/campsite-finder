function weatherForecast() {

    // var cityInput = "London";
    var apiKey = "443955fb6787f379caecf22f8c6f2f2e";
    var queryURL = "https://pro.openweathermap.org/data/2.5/climate/month?q=London&appid=" + apiKey;

    $.ajax({

        url: queryURL,
        method: 'GET'

    }).then(function (res) {

        console.log(res);
    });
}

weatherForecast();