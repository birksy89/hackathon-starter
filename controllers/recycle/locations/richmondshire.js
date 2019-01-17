const moment = require('moment');
const axios = require('axios');


exports.getNextCollection = async (postcode, uprn) => {
  try {
    const url = `https://www.richmondshire.gov.uk/Umbraco/Api/BinRoundInfoApi/GetBinRoundData?uprn=${uprn}`;

    return axios.get(url)
      .then((res) => {
        const collections = res.data;
        if (!collections.length) {
          throw new Error(`Couldn't locate any collections for ${postcode} - ${uprn} in Richmondshire`);
        } else {
          return collections;
        }
      })
      .then(async (collections) => {
        // Only bring back ones which are in the future
        const futureCollections = collections.filter(collection =>
          moment(collection.start)
            .isAfter(moment.now()));

        const nextCollection = futureCollections[0];

        // Convert date string into proper date
        const collectionDate = moment(nextCollection.start).toDate();
        const collectionType = nextCollection.title;

        return {
          postcode,
          uprn,
          collectionDate,
          collectionType
        };
      });
  } catch (error) {
    throw new Error(`Couldn't locate any collections for ${postcode} - ${uprn} in Richmondshire`);
  }
};

exports.getAddressFromPostcode = async (postcode) => {
  try {
    const url = `https://www.richmondshire.gov.uk/Umbraco/Api/BinRoundInfoApi/GetAddressesForPostCode/${postcode}`;

    return axios.get(url)
      .then((res) => {
        const collections = res.data;
        if (!collections.length) {
          throw new Error(`Couldn't locate data for postcode ${postcode} in Richmondshire`);
        } else {
          return collections;
        }
      })
      .then(async (collections) => {
        const optionList = collections.map(address => `<option value="${address.UPRN}">${address.AddressText}</option>`);
        optionList.join('');

        const addressSelector = `
        <select class="form-control refuseAddress" id="address" name="address"><option value="">-- Please select your address --</option>
          ${optionList}
        </select>
        `;

        return addressSelector;
      });
  } catch (error) {
    throw new Error(`Couldn't locate data for postcode ${postcode} in Richmondshire`);
  }
};


// this.getNextCollection('dl10 5hg', '10012784379').then((x) => {
//   console.log(x);
// });
