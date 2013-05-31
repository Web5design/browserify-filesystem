const fs = require('./');
const FileListStream = require('fileliststream');

const logger = {
  write: function write(data) {
    const textAreaElem = document.getElementById('output');
    textAreaElem.value = data;
  }
}
const body = document.body;
function noop(name) {
  return function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
};

body.addEventListener('dragenter', noop('dragEnter'));
body.addEventListener('dragleave', noop('dragLeave'));
body.addEventListener('dragexit', noop('dragExit'));
body.addEventListener('dragover', noop('dragOver'));
body.addEventListener('drop', function (event) {
  event.stopPropagation();
  event.preventDefault();

  const fileListStream = FileListStream(event.dataTransfer.files);
  const file = fileListStream[0];
  const writestream = fs.createWriteStream(file.name);
  file.pipe(writestream).on('close', function () {
    addLinkItem(writestream.path);
  });

  return false;
});

function addLinkItem(path) {
  const ol = document.getElementById('fileList');
  const liElem = document.createElement('li');
  const aElem = document.createElement('a');
  aElem.innerHTML = path;

  aElem.addEventListener('click', function () {
    const readstream = fs.createReadStream(path);
    readstream.pipe(logger);
    event.preventDefault();
    return false;
  }, false);

  liElem.appendChild(aElem);
  ol.appendChild(liElem);
}

// write some initial files
fs.writeFile("read.me","Hello World",noop);
fs.writeFile("read.me","hay wuurl",noop);
fs.writeFile("tmp.log","app started",noop);
fs.writeFile("documents/taxes.txt","cash money",noop);

// update view
(function () {
  fs.readdir('.', function (err, files) {
    files.map(addLinkItem);
  });
})();

window.fs = fs;

// for debugging
window.paramChecker = function(a,b,c,d,e,f,g){var p=[a,b,c,d,e,f,g]; console.log(p); window.last_params=p};


