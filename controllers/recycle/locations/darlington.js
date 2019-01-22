const moment = require('moment');
const puppeteer = require('puppeteer');


exports.getNextCollection = async (postcode, uprn) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://www.darlington.gov.uk/environment-and-planning/street-scene/weekly-refuse-and-recycling-collection-lookup/');

  // Register DOM Elements
  const DOM_POSTCODE = '#postcode';
  const DOM_POSTCODE_SUBMIT = '#postcodeLookupButton';
  // Perform
  await page.click(DOM_POSTCODE);
  await page.keyboard.type(postcode);
  // Go
  await page.click(DOM_POSTCODE_SUBMIT);
  await page.waitForNavigation();

  //  Step 2 - Select Address From Dropdown
  // Register DOM Elements
  const DOM_ADDRESS = '#address';
  const DOM_ADDRESS_SUBMIT = '#mode';
  // Perform
  await page.select(DOM_ADDRESS, uprn);
  // Go
  await page.click(DOM_ADDRESS_SUBMIT);
  await page.waitForNavigation();

  const RESULTS = await page.$('#detailsDisplay');

  const collectionType = await page.evaluate(el => el.innerHTML,
    await RESULTS.$('.refuse-results .panel-heading h2'));

  const collectionDateString = await page.evaluate(el => el.innerHTML,
    await RESULTS.$('.refuse-results .panel-footer p'));

  await browser.close();

  //  Convert date string into proper date
  const dateFormat = 'dddd DD MMMM YYYY';
  const collectionDate = moment(collectionDateString, dateFormat).toDate();

  return {
    postcode,
    uprn,
    collectionDate,
    collectionType
  };
};

exports.getAddressFromPostcode = async (postcode) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      //  headless: false
    });

    const page = await browser.newPage();
    await page.goto('https://www.darlington.gov.uk/environment-and-planning/street-scene/weekly-refuse-and-recycling-collection-lookup/');

    // Register DOM Elements
    const DOM_POSTCODE = '#postcode';
    const DOM_POSTCODE_SUBMIT = '#postcodeLookupButton';
    // Perform
    await page.click(DOM_POSTCODE);
    await page.keyboard.type(postcode);
    // Go
    await page.click(DOM_POSTCODE_SUBMIT);
    await page.waitForNavigation();

    //  Step 2 - Select Address From Dropdown
    // Register DOM Elements
    const DOM_ADDRESS = '#address';
    // Perform
    // await page.select(DOM_ADDRESS, UPRN);
    const addressSelector = await page.evaluate(el => el.innerHTML,
      await page.$(DOM_ADDRESS));
    return addressSelector;
  } catch (error) {
    throw new Error(`Couldn't locate data for postcode ${postcode} in Darlington`);
  }
};
