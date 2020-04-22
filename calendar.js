// Using Jquery datepicker
// https://jqueryui.com/datepicker/#date-range

// Need to be added on your HTML
/* <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script> */

// CSS for Calendar UI but I dont think you can use this since you already have bulma?
/* <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"> */

$(function () {
    var dateFormat = "mm/dd/yy",
    // Your starting date input ID
        from = $("#from")
            .datepicker({
                defaultDate: "+1w",
                changeMonth: true,
                numberOfMonths: 1
            })
            .on("change", function () {
                to.datepicker("option", "minDate", getDate(this));
            }),
    // Your end date input ID
        to = $("#to").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1
        })
            .on("change", function () {
                from.datepicker("option", "maxDate", getDate(this));
            });

    function getDate(element) {
        var date;
        try {
            date = $.datepicker.parseDate(dateFormat, element.value);
        } catch (error) {
            date = null;
        }

        return date;
    }
});


