/**
 * @jest-environment node
 */

/* eslint-disable no-undef */
const richmondshire = require('../controllers/recycle/locations/richmondshire');

test('Looking up DL10 5HG should return an Aske Address', async () => {
  jest.setTimeout(10000); // Wait a max of 10 secs before marked as FAIL
  const data = await richmondshire.getAddressFromPostcode("DL10 5HG");
  expect(data).toMatch(/Aske, DL10 5HG/);
});

test('Looking postcode/uprn should return a collection date and type', async () => {
  jest.setTimeout(10000); // Wait a max of 10 secs before marked as FAIL
  const data = await richmondshire.getNextCollection("DL10 5HG", "10034641402");
  // console.log(data);
  expect(data).toHaveProperty('postcode');
  expect(data).toHaveProperty('uprn');
  expect(data).toHaveProperty('collectionDate');
  expect(data).toHaveProperty('collectionType');
  // Check Contains Expected Data:
  expect(data.collectionType).toBeTruthy();
  expect(data.collectionDate instanceof Date).toBeTruthy();
});
