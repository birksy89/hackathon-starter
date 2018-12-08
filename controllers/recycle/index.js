const moment = require('moment');
const darlington = require('./locations/darlington');
const richmondshire = require('./locations/richmondshire');
const User = require('../../models/User');
/*
    This is the scheduler
*/
exports.scheduler = async () => {
  const query = { 'profile.uprn': { $ne: null } };
  User.find(query).then((users) => {
  // Perform an action for all the users
    users.map(async (user) => {
      const {
        profile: { location, postcode, uprn },
        collections: { nextCollectionType, nextCollectionDate }
      } = user;

      // Check to see how many days till next collection
      const daysTillCollection = moment(nextCollectionDate).diff(moment(), 'days');
      console.log(daysTillCollection);

      // Check to see if it's still in the future
      if (daysTillCollection === 1) {
        console.log('Send out notifications now!!');
      } else if (daysTillCollection > 1) {
        console.log(`Everything's fine... the ${nextCollectionType} will be picked up ${moment(nextCollectionDate).fromNow()}`);
      } else {
        // If it's not - Then we need to go off and find the "next collection date"
        console.log('Go get new one...');

        // Set up variable...
        let nextCollection;

        switch (location) {
          case 'Darlington':
            nextCollection = await darlington.getNextCollection(postcode, uprn);
            break;
          case 'Richmondshire':
            nextCollection = await richmondshire.getNextCollection(postcode, uprn);
            break;
          case 'Hambleton':
            // TBD
            break;
          default:
            console.log('No location / Council Available for this user ...');
        }

        if (nextCollection) {
          console.log(nextCollection);
          user.collections.nextCollectionDate = nextCollection.collectionDate;
          user.collections.nextCollectionType = nextCollection.collectionType;
          user.save();
        }
      }


      return user;
    });
  });
};
//  Run it!
this.scheduler();


/*
    This is used on the user profile page to lookup their address from a given postcode
    It acts as a switch to use the appropriate function for the given council
*/
exports.getAddressFromPostcode = async (req, res, next) => {
  try {
    const { council, postcode } = req.body;
    let addresses;
    switch (council) {
      case 'Darlington':
        addresses = await darlington.getAddressFromPostcode(postcode);
        break;
      case 'Richmondshire':
        addresses = await richmondshire.getAddressFromPostcode(postcode);
        break;
      case 'Hambleton':
        // TBD
        break;
      default:
        console.log('No location / Council Selected ...');
    }

    const response = req.body;
    response.addresses = addresses;
    res.json(response);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.toString() });
  }
};
