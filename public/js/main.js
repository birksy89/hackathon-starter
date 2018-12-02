/* eslint-env jquery, browser */
$(document).ready(() => {
  // Place JavaScript code here...

  $("#select_link").click(function(e) {
    e.preventDefault();

    var council = $("#location");
    var postcode = $("#postcode");
    var address = $("#address");

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
      }
    });
  });

  //When the user changes the dropdown - Update the uprn
  $("#address").change(function() {
   
    document.getElementById("uprn").setAttribute("value", this.value);
    
  });
});
