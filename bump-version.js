const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_PATH = path.join(__dirname, 'client', 'src', 'version.json');

function readVersion() {
  if (!fs.existsSync(VERSION_PATH)) {
    return { version: '0.0.0' };
  }
  return JSON.parse(fs.readFileSync(VERSION_PATH, 'utf8'));
}

function writeVersion(obj) {
  fs.writeFileSync(VERSION_PATH, JSON.stringify(obj, null, 2) + '\n');
}

// Safeguarded smart bump
function incSmart(v, mode) {
  let [maj, min, pat] = v.split('.').map(n => parseInt(n, 10) || 0);

  if (mode === 'major') {
    // bump MINOR, reset PATCH
    min += 1;
    pat = 0;
  } else {
    // default patch bump
    pat += 1;
  }

  // safeguard rollovers
  if (pat > 99) {
    pat = 0;
    min += 1;
  }
  if (min > 99) {
    min = 0;
    maj += 1;
  }

  return `${maj}.${min}.${pat}`;
}

(async () => {
  const data = readVersion();

  let mode = 'patch';
  try {
    const msg = execSync('git log -1 --pretty=%B').toString().toLowerCase();
    if (msg.includes('[major]')) mode = 'major';
  } catch {}

  data.version = incSmart(data.version || '0.0.0', mode);
  writeVersion(data);

  console.log('New version:', data.version);
})();
