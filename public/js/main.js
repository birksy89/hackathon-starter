/* eslint-env jquery, browser */
$(document).ready(() => {
  // Place JavaScript code here...

  $("#postcode").on("keypress", function(e) {
    if (e.which === 13) {
      e.preventDefault();

      //Disable textbox to prevent multiple submit
      $(this).attr("disabled", "disabled");

      //Do Stuff, submit, etc..
      $("#select_link").click();

      //Enable the textbox again if needed.
      $(this).removeAttr("disabled");
    }
  });

  $("#select_link").click(function(e) {
    e.preventDefault();

    var council = $("#location");
    var postcode = $("#postcode");
    var address = $("#addressDropdown");

    var data = {};
    data.council = council.val();
    data.postcode = postcode.val();
    data.message = "Looking for postcode";

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      url: "/api/recycling/darlington",
      success: function(data) {
        //console.log(JSON.stringify(data));

        address.html(data.addresses);
        address.prop("disabled", false);
      },
      error: function(data) {

        console.log(data);
        
        alert(data.statusText + " " + data.responseJSON.error)
      }
    });
  });

  //When the user changes the dropdown - Update the uprn
  $("#addressDropdown").change(function() {
    console.log(this);

    document.getElementById("uprn").setAttribute("value", this.value);
    console.log(this.options[this.selectedIndex].text);

    document
      .getElementById("address")
      .setAttribute("value", this.options[this.selectedIndex].text);
  });
});
