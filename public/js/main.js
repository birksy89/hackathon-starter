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

  $('#select_link').click((e) => {
    e.preventDefault();

    const council = $('#location');
    const postcode = $('#postcode');
    const address = $('#addressDropdown');

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
        address.prop('disabled', false);
      },
      error(data) {
        console.log(data);

        // eslint-disable-next-line no-alert
        alert(`${data.statusText} ${data.responseJSON.error}`);
      }
    });
  });

  // When the user changes the dropdown - Update the uprn
  $('#addressDropdown').change(function onChanger() {
    console.log(this);

    document.getElementById('uprn').setAttribute('value', this.value);
    console.log(this.options[this.selectedIndex].text);

    document
      .getElementById('address')
      .setAttribute('value', this.options[this.selectedIndex].text);
  });
});
