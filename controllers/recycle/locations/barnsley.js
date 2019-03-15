const moment = require('moment');
const puppeteer = require('puppeteer');


exports.getNextCollection = async (postcode, uprn) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // headless: false
  });

  const page = await browser.newPage();
  await page.goto('https://wwwapplications.barnsley.gov.uk/WasteMVC/ViewCollection/SelectAddress');

  // Register DOM Elements
  const DOM_POSTCODE = '#Postcode';
  const DOM_POSTCODE_SUBMIT = 'input[name=person1_FindAddress]';
  // Perform
  await page.click(DOM_POSTCODE);
  await page.keyboard.type(postcode);
  // Go
  await page.click(DOM_POSTCODE_SUBMIT);
  //  Step 2 - Select Address From Dropdown
  // Register DOM Elements
  const DOM_ADDRESS = '#person1-address-results';
  // Perform
  await page.$(DOM_ADDRESS);
  await page.waitFor(1000);
  await page.select(DOM_ADDRESS, uprn);
  // Go
  // await page.click(DOM_ADDRESS_SUBMIT);
  // await page.waitForNavigation();

  await page.waitFor(1000);
  const RESULTS = await page.$('.highlight-content');

  const collectionType = await page.evaluate(el => el.innerHTML,
    await RESULTS.$('.ui-bin-next-type'))
    .then(result => result.trim())
    .then(result => `${result} bin(s)`);

  const collectionDateString = await page.evaluate(el => el.innerHTML,
    await RESULTS.$('.ui-bin-next-date'));

  await browser.close();

  let collectionDate;

  if (collectionDateString !== "Today") {
    //  Convert date string into proper date
    const dateFormat = 'dddd, MMMM DD, YYYY';
    collectionDate = moment(collectionDateString, dateFormat).toDate();
  } else {
    collectionDate = moment().toDate();
  }


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
      // headless: false
    });

    const page = await browser.newPage();
    await page.goto('https://wwwapplications.barnsley.gov.uk/WasteMVC/ViewCollection/SelectAddress');

    // Register DOM Elements
    const DOM_POSTCODE = '#Postcode';
    const DOM_POSTCODE_SUBMIT = 'input[name=person1_FindAddress]';
    // Perform
    await page.click(DOM_POSTCODE);
    await page.keyboard.type(postcode);
    // Go
    await page.click(DOM_POSTCODE_SUBMIT);
    //  Step 2 - Select Address From Dropdown
    // Register DOM Elements
    const DOM_ADDRESS = '#person1-address-results';
    // Perform
    await page.$(DOM_ADDRESS);
    await page.waitFor(1000);

    const addressSelector = await page.evaluate(el => el.innerHTML,
      await page.$(DOM_ADDRESS));

    await browser.close();

    return addressSelector;
  } catch (error) {
    throw new Error(`Couldn't locate data for postcode ${postcode} in Barnsley`);
  }
};
