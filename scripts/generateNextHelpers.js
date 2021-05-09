const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.resolve(__dirname, '../dist/client/index.html'), 'utf8')
fs.writeFileSync(path.resolve(__dirname, '../dist/server/template.js'), `
export default ${JSON.stringify(template)};
`);
