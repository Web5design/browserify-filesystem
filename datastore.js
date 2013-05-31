const util = require('util');
// const IDBStore = require('idb-wrapper');
const PseudoStore = require('./pseudostore');
const EventEmitter = require('events').EventEmitter;

function nothing() {}

// function DataStore(name) {
//   this.ready = true;
//   // this.store = new IDBStore({
//   this.store = {
//     storeName: 'PseudoFS',
//     onStoreReady: function() {
//       debugger;
//       this.ready = true;
//       this.emit('ready');
//       this._flush();
//     },
//   };
//   this.queue = [];
// };
function DataStore(name) {
  // this.ready = false;
  this.ready = true;
  this.store = new PseudoStore({
    storeName: 'myVirtualFileSystem',
  });
  // this.queue = [];
};
util.inherits(DataStore, EventEmitter);

DataStore.prototype.exists = function(path, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'read',
      args: [path, callback],
    });
  return this.__exists(path, callback);
};

DataStore.prototype.writeFile = function(path, data, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'write',
      args: [path, data, callback],
    });
  return this.__write(path, data, callback);
};

DataStore.prototype.readFile = function(path, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'read',
      args: [path, callback],
    });
  return this.__read(path, callback);
};

DataStore.prototype.readdir = function(path, callback) {
  if (!this.ready)
    return this._enqueue({
      type: 'readdir',
      args: [path, callback],
    });
  return this.__readdir(path, callback);
};

DataStore.prototype.unlink = function(path, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'unlink',
      args: [path, callback],
    });
  return this.__unlink(path, callback);
};

DataStore.prototype.rename = function(path, newPath, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'rename',
      args: [path, newPath, callback],
    });
  return this.__rename(path, newPath, callback);
};

DataStore.prototype.mkdir = function(path, callback) {
  callback = callback || nothing;
  if (!this.ready)
    return this._enqueue({
      type: 'mkdir',
      args: [path, callback],
    });
  return this.__mkdir(path, callback);
};

// PRIVATE METHODS

DataStore.prototype._enqueue = function(actionPlan) {
  console.log('queuing', actionPlan.type);
  this.queue.push(actionPlan);
  if (this.ready)
    this._flush();
};

DataStore.prototype._flush = function() {
  var action;
  while ((action = this.queue.shift())) {
    var method = this['__' + action.type];
    method.apply(this, action.args);
  }
};

// CORE METHODS

DataStore.prototype.__exists = function(path, callback) {
  return this.store.hasIndex(path, function(exists) {
    callback(exists);
  }, function(err) {
    callback(err);
  });
};

DataStore.prototype.__write = function(path, data, callback) {
  var id;
  // build data object
  const dataObj = {
    path: path,
    data: data,
    lastModified: Date.now(),
  };
  // Check for presence in hierarchy
  id = this.store.idForPath(path);
  if ( id == undefined ) {
    // Add to objectStore
    id = this.store.addToObjectStore(dataObj);
    // Add to hierarchy
    this.store.addToHierarchy(path,id);
  } else {
    // Overwrite object at id
    this.store.put(id,dataObj);
  }
  

  callback(null);

  // this.store.put(path, dataObj, function() {
  //   callback(null);
  // }, function(err) {
  //   callback(err);
  // });
};

DataStore.prototype.__mkdir = function(path, callback) {
  this.store.mkdir(path);
  callback(null);
};

DataStore.prototype.__read = function(path, callback) {
  this.store.lookup(path, function(data) {
    callback(null, data);
  }, function(err) {
    callback(err);
  });
};

DataStore.prototype.__readdir = function(path, callback) {
  this.store.getAll(function(data) {
    callback(null, data.map(extract('path')));
  }, function(err) {
    callback(err);
  });
};

DataStore.prototype.__unlink = function(path, callback) {
  this.store.remove(path, function() {
    callback();
  }, function(err) {
    callback(err);
  });
};

DataStore.prototype.__rename = function(path, newPath, callback) {
  console.log("renaming '"+path+"' to '"+newPath+"'");
  this.readFile(path, function(err, data) {
    if (err) return callback(err);
    this.writeFile(newPath, data, function(err) {
      if (err) return callback(err);
      this.unlink(path, function(err) {
        return callback(err);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

function extract(field) {
  return function(doc) {
    return doc[field];
  }
}

module.exports = DataStore;
