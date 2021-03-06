/* eslint-env jquery, browser */
$(document).ready(() => {
  // Place JavaScript code here...

  $('#postcode').on('keypress', function postcoder(e) {
    if (e.which === 13) {
      e.preventDefault();

      // Disable textbox to prevent multiple submit
      $(this).attr('disabled', 'disabled');

      // Do Stuff, submit, etc..
      $('#select_link').click();

      // Enable the textbox again if needed.
      $(this).removeAttr('disabled');
    }
  });

  $('#select_link').click(function click(e) {
    e.preventDefault();

    const $this = $(this);
    //  console.log($this);

    const council = $('#location');
    const postcode = $('#postcode');
    const address = $('#addressDropdown');
    const addressLabel = $('#addressDropdownLabel');
    const btnSubmit = $('#submit');

    //  Don't go further without 2 requirments
    if (!council.val() || !postcode.val()) {
      // eslint-disable-next-line no-undef
      Swal.fire({
        title: 'Error!',
        text: 'Please select a Council and enter a Postcode',
        type: 'error',
        confirmButtonText: 'Understood'
      });
      return false;
    }

    $this.attr('value', 'Please Wait... ');
    $this.attr('disabled', true);


    const data = {};
    data.council = council.val();
    data.postcode = postcode.val();
    data.message = 'Looking for postcode';

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/recycling/lookup',
      success(data) {
        // console.log(JSON.stringify(data));

        address.html(data.addresses);
        address.prop('hidden', false);
        address.prop('disabled', false);
        addressLabel.prop('hidden', false);
        btnSubmit.prop('disabled', false);
      },
      error(data) {
        console.log(data);

        // eslint-disable-next-line no-undef
        Swal.fire({
          title: 'Error!',
          text: `${data.statusText} ${data.responseJSON.error}`,
          type: 'error',
          confirmButtonText: 'Understood'
        });
      },
      complete() {
        console.log('Done');
        $this.attr('value', 'Find Address');
        $this.attr('disabled', false);
      }
    });
  });

  // When the user changes the council dropdown - Clear the address
  $('#location').change(() => {
    // console.log(this);
    document.getElementById('submit').setAttribute('disabled', true);
    document.getElementById('postcode').value = "";
    document.getElementById('addressDropdown').innerHTML = "<option value=''>-- Please re-search your address --</option>";
  });
  // When the user changes the address dropdown - Update the uprn
  $('#addressDropdown').change(function onChanger() {
    console.log(this);

    document.getElementById('uprn').setAttribute('value', this.value);
    console.log(this.options[this.selectedIndex].text);

    document
      .getElementById('address')
      .setAttribute('value', this.options[this.selectedIndex].text);
  });
});
