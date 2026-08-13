const fs = require('fs');
const html = fs.readFileSync('A:/projectmedicare/apps/frontend/splash_html.txt', 'utf16le');
const matches = [...html.matchAll(/<link rel=\"apple-touch-startup-image\" href=\"public(.*?)\" media=\"(.*?)\">/g)];
const out = matches.map(m => ({ url: m[1], media: m[2] }));
fs.writeFileSync('A:/projectmedicare/apps/frontend/splash_json.json', JSON.stringify(out, null, 2));
