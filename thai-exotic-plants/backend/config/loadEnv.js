const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Try multiple common locations for the .env file to accommodate moves
const candidatePaths = [
  // backend/.env
  path.resolve(__dirname, '../.env'),
  // project root .env
  path.resolve(__dirname, '../../.env'),
  // current working directory .env (fallback)
  path.resolve(process.cwd(), '.env')
];

for (const envPath of candidatePaths) {
  try {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      // eslint-disable-next-line no-console
      console.log(`🔧 Loaded environment from: ${envPath}`);
      break;
    }
  } catch (_) {
    // ignore and try next path
  }
}

module.exports = {};


