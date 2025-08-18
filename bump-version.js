// bump-version.js
const fs = require('fs');
const path = require('path');

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

function inc(v) {
  const [maj, min, pat] = v.split('.').map(n => parseInt(n, 10) || 0);
  return `${maj}.${min}.${pat + 1}`;
}

// Optional: allow major/minor bumps via commit message keywords
// e.g. include [minor] or [major] in your commit message to override
function incSmart(v, mode) {
  let [maj, min, pat] = v.split('.').map(n => parseInt(n, 10) || 0);
  if (mode === 'major') { maj += 1; min = 0; pat = 0; }
  else if (mode === 'minor') { min += 1; pat = 0; }
  else { pat += 1; }
  return `${maj}.${min}.${pat}`;
}

(async () => {
  const data = readVersion();

  // detect bump mode from last commit message (optional)
  let mode = 'patch';
  try {
    const { execSync } = require('child_process');
    const msg = execSync('git log -1 --pretty=%B').toString().toLowerCase();
    if (msg.includes('[major]')) mode = 'major';
    else if (msg.includes('[minor]')) mode = 'minor';
  } catch {}

  data.version = incSmart(data.version || '0.0.0', mode);
  writeVersion(data);
  console.log('New version:', data.version);
})();
