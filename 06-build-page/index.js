const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const distPath = path.join(__dirname, 'project-dist');
fs.mkdir(distPath, 
  { recursive: true }, 
  (err) => {
    if (err) throw err;
  });

const srcPath = path.join(__dirname, 'styles');
const dstPath = path.join(distPath, 'style.css');
bundleCSS(srcPath, dstPath);

const srcToCopyPath = path.join(__dirname, 'assets');
const assetsPath = path.join(distPath, 'assets');
copyDir(srcToCopyPath, assetsPath);

const htmlPath = path.join(distPath, 'index.html');
newHTML(htmlPath);

async function newHTML(destination) {
  
  await fsPromises
    .rm(destination,
      { recursive: true, force: true },
      err => {
        if (err) throw err;
      }
    );
  
  fs.open(destination, 'w', (err) => {
    if(err) throw err;
  });

  const templatePath = path.join(__dirname, 'template.html');
  const templateStream = fs.ReadStream(templatePath, 'utf-8');

  let data = '';
  templateStream.on('data', chunk => data += chunk);
  templateStream.on('end', () => {
    const componentsDirPath = path.join(__dirname, 'components');
    fsPromises
      .readdir(componentsDirPath, {withFileTypes: true})
      .then(async (files) => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          let componentFilePath = path.join(componentsDirPath, file.name);
          fs.stat(componentFilePath, (err, stats) => {
            if (!stats.isDirectory()) {
              const componentName = path.basename(file.name, '.html');
              const componentReadStream = fs.ReadStream(componentFilePath, 'utf8');
              let componentContent = '';
              componentReadStream.on('data', chunk => componentContent += chunk);
              componentReadStream.on('end', () => { 
                const regexp = new RegExp(`{{${componentName}}}`);
                data = data.replace(regexp, componentContent);
                fs.writeFile(destination, data, (err) => {
                  if (err) throw err;
                });
              });
            }
            if (err) throw err;
          });
        }
      });
  });
}

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
    .then(async (files) => {
      files.forEach(async (file) => {
        const srcFilePath = path.join(source, file.name);
        const dstFilePath = path.join(destination, file.name);
        fs.stat(srcFilePath, (err, stats) => {
          if (stats.isDirectory()) {
            copyDir(srcFilePath, dstFilePath);
          } else {
            fsPromises.copyFile(srcFilePath, dstFilePath);
          }
          if (err) throw err;
        });
      });         
    });
}

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
        if (file.isFile() && path.extname(filePath) === '.css') {
          fs.appendFile(filePath, '\n \n', (err) => {
            if (err) throw err;
          });
          let stream = fs.createReadStream(filePath, 'utf-8');
          stream.pipe(writeToFile);
          stream.on('end', () => {
            const readStream = fs.ReadStream(filePath, 'utf-8');
            let fileContent = '';
            readStream.on('data', chunk => fileContent += chunk);
            readStream.on('end', () => {
              let fileContentSplit = fileContent.split('\n');
              fileContentSplit.splice((fileContentSplit.length - 2), 2);
              let result = fileContentSplit.join('\n');
              fs.writeFile(filePath, result, (err) => {
                if (err) throw err;
              });
            });
          });
        }
      });
    });
}
