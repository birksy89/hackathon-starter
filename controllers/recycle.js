const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary");
const twilio = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

cloudinary.config({
  cloud_name: "birksy",
  api_key: "916718182388156",
  api_secret: "4VuxM6M8c7LBZ3wHjqOXItJAb_o"
});

//Trialing out schedule work
// var schedule = require("node-schedule");
// var j = schedule.scheduleJob("42 * * * * *", function() {
//   console.log("At this point, I'd send the data - But I've commented it out.")
//   //module.exports.getCollectionDates();
// });

exports.getCollectionDates = async () => {
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

  const SCREENSHOT_PATH = `${__dirname}/../public/${UPRN}-${Date.now()}.png`;

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

  //WhatsApp Message
  // const message = {
  //   to: "whatsapp:+447799061149",
  //   from: "whatsapp:+14155238886",
  //   body: `New Recycling Message...`,
  //   mediaUrl: cloudinaryUpload.secure_url
  // };

  const message = {
    to: "+447799061149",
    from: "+441325952196",
    body: `New Recycling Message...`
    //Can't send media outside of US / Canada
    //mediaUrl: cloudinaryUpload.secure_url
  };
  twilio.messages.create(message).then(sentMessage => {
    console.log(`Text send to ${sentMessage.to}`);
  });
};

exports.getAddressFromPostcode = async (req, res, next) => {
  
  //console.log(req.body);

  let { council, postcode } = req.body;

  var addresses;

  switch (council) {
    case "Darlington":
      addresses = await postcode2addDarlington(postcode);
      break;
    case "Richmondshire":
      //TBD
      break;
    case "Hambleton":
      //TBD
      break;
    default:
      console.log("Running Default Function...");
  }

  let response = req.body;

  response.addresses = addresses;

  res.json(response);
  return;
};

async function postcode2addDarlington(postcode) {

  const browser = await puppeteer.launch({
    //headless: false
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.darlington.gov.uk/environment-and-planning/street-scene/weekly-refuse-and-recycling-collection-lookup/"
  );

    //Register DOM Elements
    const DOM_POSTCODE = "#postcode";
    const DOM_POSTCODE_SUBMIT = "#postcodeLookupButton";
    //Perform
    await page.click(DOM_POSTCODE);
    await page.keyboard.type(postcode);
    //Go
    await page.click(DOM_POSTCODE_SUBMIT);
    await page.waitForNavigation();
  
    //  Step 2 - Select Address From Dropdown
    //Register DOM Elements
    const DOM_ADDRESS = "#address";
    //Perform
    // await page.select(DOM_ADDRESS, UPRN);
    const addressSelector = await page.evaluate(el => el.innerHTML, await page.$(DOM_ADDRESS));
    return addressSelector;



}
