const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary");
const twilio = require("twilio")(
  "AC8f9efa9754e44d893b46b0f605822667",
  "b472e8159e3e23add20b45916297cced"
);

cloudinary.config({
  cloud_name: "birksy",
  api_key: "916718182388156",
  api_secret: "4VuxM6M8c7LBZ3wHjqOXItJAb_o"
});

(async () => {
  const browser = await puppeteer.launch({
    //headless: false
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.darlington.gov.uk/environment-and-planning/street-scene/weekly-refuse-and-recycling-collection-lookup/"
  );

  //Register Values to be used
  const POSTCODE = "DL2 2GE";
  const UPRN = "UPRN010013316003";

  //Register DOM Elements
  const DOM_POSTCODE = "#postcode";
  const DOM_POSTCODE_SUBMIT = "#postcodeLookupButton";
  //Perform
  await page.click(DOM_POSTCODE);
  await page.keyboard.type(POSTCODE);
  //Go
  await page.click(DOM_POSTCODE_SUBMIT);
  await page.waitForNavigation();

  //  Step 2 - Select Address From Dropdown
  //Register DOM Elements
  const DOM_ADDRESS = "#address";
  const DOM_ADDRESS_SUBMIT = "#mode";
  //Perform
  await page.select(DOM_ADDRESS, UPRN);
  //Go
  await page.click(DOM_ADDRESS_SUBMIT);
  await page.waitForNavigation();

  const RESULTS = await page.$("#detailsDisplay");

  const SCREENSHOT_PATH = `../public/${UPRN}-${Date.now()}.png`;

  await RESULTS.screenshot({ path: SCREENSHOT_PATH });

  await browser.close();

  //Send Image up to cloudinary
  var cloudinaryUpload = await cloudinary.v2.uploader.upload(
    SCREENSHOT_PATH,
    function(error, result) {
      //console.log(result, error);

      //If the file has been uploaded to cloudinary - Delete from local
      var fs = require("fs");
      var filePath = SCREENSHOT_PATH;
      fs.unlinkSync(filePath);

      return result;
    }
  );

  console.log(cloudinaryUpload.secure_url);

  const message = {
    to: "whatsapp:+447799061149",
    from: "whatsapp:+14155238886",
    body: `New Recycling Message...`,
    mediaUrl: cloudinaryUpload.secure_url
  };
  twilio.messages.create(message).then(sentMessage => {
    console.log(`Text send to ${sentMessage.to}`);
  });
})();
