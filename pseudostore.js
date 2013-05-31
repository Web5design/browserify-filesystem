(function (name, definition, global) {
  if (typeof define === 'function') {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    global[name] = definition();
  }
})('PseudoStore', function () {

  "use strict";

  var defaults = {
    storeName: 'Store',
    storePrefix: 'PStore-',
    dbVersion: 1,
    keyPath: 'path',
    autoIncrement: true,
    onStoreReady: function () {

    },
    onError: function(error){
      throw error;
    },
    ids: [],
    hierarchy: {},
    objectStore: {},
  };

  var PseudoStore = function (kwArgs, onStoreReady) {

    for(var key in defaults){
      this[key] = typeof kwArgs[key] != 'undefined' ? kwArgs[key] : defaults[key];
    }

    // this.dbName = this.storePrefix + this.storeName;
    // this.dbVersion = parseInt(this.dbVersion, 10);

    // use provided onStoreReady if provided
    onStoreReady && (this.onStoreReady = onStoreReady);

    // this.idb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    // this.keyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;

    this.consts = {
      'DIR':          0,
      'FILE':         1,
      'SYMLINK':      2,
    }

    // this.openDB();
    this.onStoreReady();
  };

  PseudoStore.prototype = /** @lends PseudoStore */ {

    /**
     * The version of PseudoStore
     *
     * @type String
     */
    version: '0.0.0',

    /*******************
     * adapter api (?) *
     ******************/

    addToObjectStore: function(data) {
      var id = this._getNextId();
      this.put(id,data);
      return id;
    },

    addToHierarchy: function(path, id) {
      if (typeof path == "string") path = _splitPathIntoSegments(path);
      var parentDirPath = path.slice(0,-1);
      var fileName = path[path.length-1];
      // make directories
      if (path.length>1) this.mkdir(parentDirPath);
      _cd(this.hierarchy,path.slice(0,-1))[fileName] = {type: this.consts['FILE'], id: id};
    },

    mkdir: function(path) {
      self = this;
      if (typeof path == "string") path = _splitPathIntoSegments(path);
      // make directories
      var pwd = this.hierarchy;
      path.forEach(function(segment){
        if (pwd[segment] === undefined) pwd[segment]={type: self.consts['DIR']};
        pwd = segment;
      });
    },

    lookup: function(path, callback) {
      var id = this.idForPath(path);
      callback(this.objectStore[id]);
    },

    idForPath: function(path) {
      if (typeof path == "string") path = _splitPathIntoSegments(path);
      var parentDirPath = path.slice(0,-1);
      var fileName = path[path.length-1];
      var pwd = _cd(this.hierarchy,parentDirPath);
      if (pwd!==undefined && pwd[fileName]!==undefined) return pwd[fileName].id;
    },

    /*********************
     * data manipulation *
     *********************/

    /**
     * Puts an object into the store. If an entry with the given id exists,
     * it will be overwritten. This method has a different signature for inline
     * keys and out-of-line keys; please see the examples below.
     *
     * @param {*} [key] The key to store. This is only needed if IDBWrapper
     *  is set to use out-of-line keys. For inline keys - the default scenario -
     *  this can be omitted.
     * @param {Object} value The data object to store.
     * @param {Function} [onSuccess] A callback that is called if insertion
     *  was successful.
     * @param {Function} [onError] A callback that is called if insertion
     *  failed.
     * @example
        // Storing an object, using inline keys (the default scenario):
        var myCustomer = {
          customerid: 2346223,
          lastname: 'Doe',
          firstname: 'John'
        };
        myCustomerStore.put(myCustomer, mySuccessHandler, myErrorHandler);
        // Note that passing success- and error-handlers is optional.
     * @example
        // Storing an object, using out-of-line keys:
       var myCustomer = {
         lastname: 'Doe',
         firstname: 'John'
       };
       myCustomerStore.put(2346223, myCustomer, mySuccessHandler, myErrorHandler);
      // Note that passing success- and error-handlers is optional.
     */

    put: function (key, value, onSuccess, onError) {
      
      onError || (onError = function (error) {
        console.error('Could not write data.', error);
      });
      onSuccess || (onSuccess = noop);

      this.objectStore[key]=value;
      var hasSuccess = true;
      var result = this.objectStore[key];

      var callback = hasSuccess ? onSuccess : onError;
      callback(result);
      
    },

    /**
     * Retrieves an object from the store. If no entry exists with the given id,
     * the success handler will be called with null as first and only argument.
     *
     * @param {*} key The id of the object to fetch.
     * @param {Function} [onSuccess] A callback that is called if fetching
     *  was successful. Will receive the object as only argument.
     * @param {Function} [onError] A callback that will be called if an error
     *  occurred during the operation.
     */
    get: function (key, onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not read data.', error);
      });
      onSuccess || (onSuccess = noop);
      
      var hasSuccess = key in this.objectStore;
      var result = this.objectStore[key]
      
      var callback = hasSuccess ? onSuccess : onError;
      callback(result);
    },

    /**
     * Fetches all entries in the store.
     *
     * @param {Function} [onSuccess] A callback that is called if the operation
     *  was successful. Will receive an array of objects.
     * @param {Function} [onError] A callback that will be called if an error
     *  occurred during the operation.
     */
    getAll: function (onSuccess, onError) {
      onError || (onError = function (error) {
        console.error('Could not read data.', error);
      });
      onSuccess || (onSuccess = noop);
      
      var entries = new Array();
      for (var key in this.objectStore) {
        entries.push(this.objectStore[key]);
      }
      onSuccess( entries );
    },

    /************
     * indexing *
     ************/

    /**
     * Checks if an index with the given name exists in the store.
     *
     * @param {String} indexName The name of the index to look for
     * @return {Boolean} Whether the store contains an index with the given name
     */
    hasIndex: function (key, onSuccess, onError) {
      var exists = key in this.objectStore;
      onSuccess(exists);
      return exists;
    },

    _getNextId: function() {
      var newId = 0;
      while (-1 != this.ids.indexOf(newId)) {
        newId++;
      }
      this.ids.push(newId);
      return newId;
    },

  };

  // helpers

  var _cd = function(pwd,path) {
    if (typeof path == "string") path = _splitPathIntoSegments(path);
    path.forEach(function(segment){
      pwd = pwd[segment];
    });
    return pwd;
  };

  var _splitPathIntoSegments = function(path) { return path.split("/"); };

  var noop = function () {};
  var empty = {};
  var mixin = function (target, source) {
    var name, s;
    for (name in source) {
      s = source[name];
      if (s !== empty[name] && s !== target[name]) {
        target[name] = s;
      }
    }
    return target;
  };

  PseudoStore.version = PseudoStore.prototype.version;

  // finalize

  return PseudoStore;

}, this);
