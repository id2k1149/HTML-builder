const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const source = 'files';
const destination = 'files-copy';

const srcPath = path.join(__dirname, source);
const dstPath = path.join(__dirname, destination);

copyDir(srcPath, dstPath);

async function copyDir(source, destination) {
  
  await fsPromises
    .rm(destination,
      { recursive: true, force: true },
      err => {
        if (err) throw err;
      }
    );
  
  await fsPromises
    .mkdir(destination, 
      { recursive: true },
      err => {
        if (err) throw err;
      }
    );

  await fsPromises
    .readdir(source, {withFileTypes: true})
    .then(files => {
      files.forEach(file => {
        const srcFilePath = path.join(source, file.name);
        const dstFilePath = path.join(destination, file.name);
        fs.stat(srcFilePath, (err, stats) => {
          if (err) throw err;
          if (stats.isDirectory()) {
            copyDir(srcFilePath, dstFilePath);
          } else {
            fsPromises.copyFile(srcFilePath, dstFilePath);
          }
        });
      });         
    });
}
