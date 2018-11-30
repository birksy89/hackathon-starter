const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false
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

  const RESULTS = await page.$('#detailsDisplay');

  await RESULTS.screenshot({ path: `../public/${UPRN}-${Date.now()}.png` });


  await browser.close();
})();
