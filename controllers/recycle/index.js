const moment = require('moment');
const schedule = require('node-schedule');
const twilio = require('twilio')(process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN);
const darlington = require('./locations/darlington');
const richmondshire = require('./locations/richmondshire');
const User = require('../../models/User');


/*
    This is the checker
*/
exports.checker = async () => {
  const query = { 'profile.uprn': { $ne: null } };
  User.find(query).then((users) => {
  // Perform an action for all the users
    users.map(async function checkCollectionStatus(user) {
      const {
        profile: { location, postcode, uprn },
        collections: { nextCollectionType, nextCollectionDate }
      } = user;

      // Check to see how many days till next collection
      const daysTillCollection = moment(nextCollectionDate).diff(moment(), 'days');
      // console.log(daysTillCollection);

      // Check to see if it's still in the future
      if (daysTillCollection === 1) {
        console.log('Send out notifications now!!');
        module.exports.notifier(user);
      } else if (daysTillCollection > 1) {
        console.log(`Everything's fine... the ${nextCollectionType} will be picked up ${moment(nextCollectionDate).fromNow()}`);
      } else {
        // If it's not - Then we need to go off and find the "next collection date"
        console.log('Need to get new collection dates...');

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

          // At this point - run the function again with the new collection dates
          checkCollectionStatus(user);
        }
      }


      return user;
    });
  });
};


/*
    This is used to notify users
*/
exports.notifier = async (user) => {
  const {
    profile: { location, postcode, uprn },
    collections: { nextCollectionType, nextCollectionDate }
  } = user;

  const friendlyDate = moment(nextCollectionDate).format('dddd, MMMM Do YYYY');

  const messageBody = `Your ${nextCollectionType} will be collected on ${friendlyDate}`;

  const message = {
    to: '+447799061149',
    from: '+441325952196',
    body: messageBody
  };

  console.log(messageBody);

  // twilio.messages.create(message).then((sentMessage) => {
  //   console.log(`Text send to ${sentMessage.to}`);
  // });
};


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

/*
    This is the scheduler
*/
const j = schedule.scheduleJob('42 * * * * *', () => {
  module.exports.checker();
});
