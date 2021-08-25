const fs = require('fs');

function maybeValue(value){
  let result = null;
  if (value) {
    try {
      result = value.replace('"', '');
      result = JSON.parse(value);
    } catch (err) {
      result = value;
    }
  }

  return result;
}

function nicerName(domain){
  let result = domain;
  if (result) {
    result = result.replace(/^(www|login|mobile|signin|accounts|en|de|auth|app|account|id|my|m)\./g, '');
  }
  return result;
}

// TODO: Use yargs to get the input file and further options like "dry-run" and so on.
const sourceFilename = process.argv[2];
if (!sourceFilename) {
  console.error('Specify a source file in the first argument');
  process.exit(1);
}

const outputFilename = process.argv[3] || 'output.csv';

console.log("Output is", outputFilename);

const content = fs.readFileSync(sourceFilename).toString().split('\n');

const headers = content.splice(0,1)[0].split(',').map(h => JSON.parse(h));
const domains = {};
const rows = content.map(row => {
  const rowObject = {};
  const rowArray = row.split(',');

  headers.forEach((value, index) =>  {
    rowObject[value] = maybeValue(rowArray[index]);
  });

  if (rowObject.url){
    const url = new URL(rowObject.url);
    if (!rowObject.name){
      rowObject.name = nicerName(url.hostname);
    }
    // const collisionKey = `${rowObject.name}-${rowObject.username}`;
    const collisionKey = `${rowObject.name}`;
    domains[collisionKey] = domains[collisionKey] ? domains[collisionKey]+1 : 1;
  }

  return rowObject;
}).filter(row => row.url !== null);

// TODO: Parametrize options for collisions

// Checking for colissions
// const collided = Object.keys(domains).filter(d => domains[d] > 1);
// console.log("COLLISIONS", collided.length, collided);

// Writing output
const onePasswordFormatHeaders = ['name', 'url', 'username', 'password'];

fs.writeFileSync(outputFilename, onePasswordFormatHeaders.join(',') + '\n');
rows.forEach(r =>  {
  const row = [];
  onePasswordFormatHeaders.forEach(h => {
    row.push(`"${r[h]}"`);
  });
  fs.writeFileSync(outputFilename, row.join(',')+'\n', {flag: 'a'});
});
