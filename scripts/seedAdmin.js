const path = require('path');
const { loadEnv } = require('../src/bootstrap/loadEnv');

loadEnv(path.join(__dirname, '..'));

const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const { USER_ROLES } = require('../src/constants/userRoles');
const env = require('../src/config/env');

const seedAdmin = async () => {
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@estateadmin.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123';

  await mongoose.connect(env.mongodbUri);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.connection.close();
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: USER_ROLES.SUPER_ADMIN,
    isActive: true,
  });

  console.log('Super admin seeded successfully');
  console.log(`Email: ${email}`);
  console.log('Please change the default password after first login.');

  await mongoose.connection.close();
};

seedAdmin().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
