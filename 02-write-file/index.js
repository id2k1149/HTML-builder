const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

fs.open(filePath, 'w', (err) => {
  if(err) throw err;
});

const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Please enter any text or type exit to exit \n '
});

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
  case 'exit':
    console.log('Have a great day!');
    process.exit(0);
    break;
  default:
    console.log(`Line '${line.trim()}' has been added!`);
    fs.appendFile(filePath, line.trim() + '\n', (err) => {
      if(err) throw err;
    });
    break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!!!');
  process.exit(0);
});
