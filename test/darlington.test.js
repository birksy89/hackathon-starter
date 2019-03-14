/* eslint-disable no-undef */
const darlington = require('../controllers/recycle/locations/darlington');

test('Looking up DL2 2GE should return a GSD Address', async () => {
  jest.setTimeout(10000); // Wait a max of 10 secs before marked as FAIL
  const data = await darlington.getAddressFromPostcode("DL2 2GE");
  expect(data).toMatch(/George Stephenson Drive, DARLINGTON, DL2 2GE/);
});

test('Looking postcode/uprn should return a collection date and type', async () => {
  jest.setTimeout(10000); // Wait a max of 10 secs before marked as FAIL
  const data = await darlington.getNextCollection("DL2 2GE", "UPRN010013316003");
  // console.log(data);
  expect(data).toHaveProperty('postcode');
  expect(data).toHaveProperty('uprn');
  expect(data).toHaveProperty('collectionDate');
  expect(data).toHaveProperty('collectionType');
  // Check Contains Expected Data:
  expect(['Recycling', 'Refuse']).toContain(data.collectionType);
  expect(data.collectionDate instanceof Date).toBeTruthy();
});
