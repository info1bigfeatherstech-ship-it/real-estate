const path = require('path');
const { loadEnv } = require('../src/bootstrap/loadEnv');

loadEnv(path.join(__dirname, '..'));

const mongoose = require('mongoose');
const Property = require('../src/models/Property.model');
const AccommodationInquiry = require('../src/models/AccommodationInquiry.model');
const env = require('../src/config/env');

const run = async () => {
  await mongoose.connect(env.mongodbUri);

  const propertyResult = await Property.updateMany(
    { listingType: 'For Sale' },
    { $set: { listingType: 'For Sell' } }
  );

  const villaPropertyResult = await Property.updateMany(
    { propertyType: 'Villa' },
    { $set: { propertyType: 'Independent House' } }
  );

  const villaInquiryResult = await AccommodationInquiry.updateMany(
    { propertyType: 'Villa' },
    { $set: { propertyType: 'Independent House' } }
  );

  console.log('Listing type migration:', propertyResult.modifiedCount, 'properties updated to For Sell');
  console.log('Property type migration:', villaPropertyResult.modifiedCount, 'properties Villa -> Independent House');
  console.log('Inquiry migration:', villaInquiryResult.modifiedCount, 'inquiries Villa -> Independent House');

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
