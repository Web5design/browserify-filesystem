const util = require('util');
const Stream = require('stream');
const DataStore = require('./datastore');
const fs = {};
const FILESYSTEM = new DataStore();

// "Fully" Implemented API

fs.createWriteStream = function createWriteStream(path) {
  return new WriteStream(path);
};

fs.createReadStream = function createReadStream(path) {
  return new ReadStream(path);
};

fs.exists = FILESYSTEM.exists.bind(FILESYSTEM);
fs.existsSync = FILESYSTEM.exists.bind(FILESYSTEM);
fs.rename = FILESYSTEM.rename.bind(FILESYSTEM);
fs.writeFile = FILESYSTEM.writeFile.bind(FILESYSTEM);
fs.writeFileSync = FILESYSTEM.writeFile.bind(FILESYSTEM);
fs.readFile = FILESYSTEM.readFile.bind(FILESYSTEM);
fs.readFileSync = FILESYSTEM.readFile.bind(FILESYSTEM);
fs.readdir = FILESYSTEM.readdir.bind(FILESYSTEM);
fs.readdirSync = FILESYSTEM.readdir.bind(FILESYSTEM);
fs.unlink = FILESYSTEM.unlink.bind(FILESYSTEM);
fs.mkdir = FILESYSTEM.mkdir.bind(FILESYSTEM);
fs.mkdirSync = FILESYSTEM.mkdir.bind(FILESYSTEM);

// Need LOVE

fs.open = function(path, flags, mode, callback){
  // shift for optional args
  if (callback === undefined){
    callback = mode;
    mode = undefined;
  };
  notifyStub("open"); callback(); };
fs.openSync = function(path, flags, mode){ notifyStub("openSync"); };
// fs.party -- not actually in fs module (?)
fs.read = function(fd, buffer, offset, length, position, callback){
  notifyStub("read"); return callback(null,null,null);
};
fs.readSync = function(fd, buffer, offset, length, position){
  notifyStub("readSync"); return null;
};
fs.symlink = function(srcpath, dstpath, type, callback){
  // shift for optional args
  if (callback === undefined){
    callback = type;
    type = undefined;
  };
  notifyStub("symlink"); callback();
};
fs.symlinkSync = function(srcpath, dstpath, type){ notifyStub("symlinkSync"); }



// Stubbed API

fs.chown = function(path, uid, gid, callback){ notifyStub("chown"); callback(); };
fs.chownSync = function(path, uid, gid){ notifyStub("chownSync"); };
fs.close = function(fd, callback){ notifyStub("close"); callback(); };
fs.closeSync = function(fd){ notifyStub("closeSync"); };
fs.fchmod = function(fd, mode, callback){ notifyStub("fchmod"); callback(); };
fs.fchmodSync = function(fd, mode){ notifyStub("fchmodSync"); };
fs.fchown = function(fd, uid, gid, callback){ notifyStub("fchown"); callback(); };
fs.fchownSync = function(fd, uid, gid){ notifyStub("fchownSync"); };
fs.futimes = function(fd, atime, mtime, callback){ notifyStub("futimes"); callback(); };
fs.futimesSync = function(fd, atime, mtime){ notifyStub("futimesSync"); };
fs.lchmod = function(path, mode, callback){ notifyStub("lchmod"); callback(); };
fs.lchmodSync = function(path, mode){ notifyStub("lchmodSync"); };
fs.lchown = function(path, uid, gid, callback){ notifyStub("lchown"); callback(); };
fs.lchownSync = function(path, uid, gid){ notifyStub("lchownSync"); };
fs.lstat = function(path, callback){ notifyStub("lstat"); callback(null, {}); };
fs.lstatSync = function(path, callback){ notifyStub("lstatSync"); return {}; };
// fs.lutimes -- not actually in fs module (?)
// fs.lutimesSync -- not actually in fs module (?)
fs.realpath = function(path, cache, callback){
  // shift for optional args
  if (callback === undefined){
    callback = cache;
    cache = undefined;
  };
  notifyStub("realpath"); callback(path);
};
fs.realpathSync = function(path, mode){ notifyStub("mkdirSync"); return path;};
fs.stat = function(path, callback){ notifyStub("stat"); callback(null, null); };
fs.statSync = function(path){ notifyStub("statSync"); return null; };
fs.unlink = function(path, callback){ notifyStub("unlink"); callback(); };
fs.unlinkSync = function(path){ notifyStub("unlinkSync"); };
// fs.utimensat -- not actually in fs module (?)
// fs.utimensatSync -- not actually in fs module (?)
fs.watch = function(filename, options, listener){ notifyStub("watch"); };

// Process overrides
process._cwd = "/";
process.cwd = function () { return this._cwd; };
process.chdir = function (dir) { this._cwd = dir; };

// Helpers

function notifyStub( method ) { console.log("WARN: stub '"+method+"' called. Callback called if provided") }

// Internals

function WriteStream(path) {
  this._buffer = '';
  this.path = path;
  this.writable = true;
  this.bytesWritten = 0;
};
util.inherits(WriteStream, Stream);

WriteStream.prototype.write = function write(data) {
  this._buffer += data;
  this.bytesWritten += data.length;
};

WriteStream.prototype.end = function end() {
  FILESYSTEM.writeFile(this.path, this._buffer, function (err) {
    this.emit('close');
  }.bind(this));
};

function ReadStream(path) {
  this.readable = true;
  this.path = path;
};
util.inherits(ReadStream, Stream);

ReadStream.prototype.pipe = function pipe(dest) {
  console.log('path', this.path);
  FILESYSTEM.readFile(this.path, function (err, dataObj) {
    dest.write(dataObj.data);
  });
  return dest;
};

fs.ReadStream = ReadStream;
fs.WriteStream = WriteStream;

fs.___FILESYSTEM = FILESYSTEM;

module.exports = fs;