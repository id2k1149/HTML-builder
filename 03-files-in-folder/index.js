const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const dirPath = path.join(__dirname, 'secret-folder');

fsPromises
  .readdir(dirPath, {withFileTypes: true})
  .then(files => {
    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      fs.stat(filePath, (err, stats) => {
        if(err) throw err;
        if (stats.isFile()) {
          console.log(file.name.replace('.', ' - '), '-', stats.size);
        }
      });
    });         
  });
  