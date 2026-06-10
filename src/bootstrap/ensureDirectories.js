const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const RUNTIME_DIRS = ['logs', 'uploads', 'temp'];

const ensureDirectories = (rootDir = path.join(__dirname, '..', '..')) => {
  for (const dir of RUNTIME_DIRS) {
    const absPath = path.join(rootDir, dir);
    try {
      if (!fs.existsSync(absPath)) {
        fs.mkdirSync(absPath, { recursive: true });
      }
    } catch (error) {
      logger.warn({ dir: absPath, err: error.message }, 'Failed to ensure runtime directory');
    }
  }

  const uploadsKeep = path.join(rootDir, 'uploads', '.gitkeep');
  if (!fs.existsSync(uploadsKeep)) {
    try {
      fs.writeFileSync(uploadsKeep, '');
    } catch {
      // Non-fatal
    }
  }
};

module.exports = { ensureDirectories };
