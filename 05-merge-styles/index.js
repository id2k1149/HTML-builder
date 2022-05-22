const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const srcPath = path.join(__dirname, 'styles');
const dstPath = path.join(__dirname, 'project-dist', 'bundle.css');

bundleCSS(srcPath, dstPath);

async function bundleCSS(source, destination) {
  fs.open(destination, 'w', (err) => {
    if(err) throw err;
  });

  const writeToFile = fs.createWriteStream(destination);

  await fsPromises
    .readdir(source, {withFileTypes: true})
    .then(async (files) => {
      files.forEach(async (file) => { 
        const filePath = path.join(source, file.name); 
        if (file.isFile && path.extname(filePath) === '.css') {
          fs.appendFile(filePath, '\n \n', (err) => {
            if (err) throw err;
          });
          let stream = fs.createReadStream(filePath, 'utf-8');
          stream.pipe(writeToFile);
          stream.on('end', () => {
            const readStream = fs.ReadStream(filePath, 'utf-8');
            let data = '';
            readStream.on('data', chunk => data += chunk);
            readStream.on('end', () => {
              let dataSplit = data.split('\n');
              dataSplit.splice((dataSplit.length - 2), 2);
              let result = dataSplit.join('\n');
              fs.writeFile(filePath, result, (err) => {
                if (err) throw err;
              });
            });
          });
        }
      });
    });
}
