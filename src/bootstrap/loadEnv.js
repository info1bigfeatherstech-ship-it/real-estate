const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Load environment variables from the backend root directory.
 * Must run before any module reads process.env (including src/config/env.js).
 */
const loadEnv = (rootDir = path.join(__dirname, '..', '..')) => {
  dotenv.config({ path: path.join(rootDir, '.env') });

  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
  }
};

module.exports = { loadEnv };
