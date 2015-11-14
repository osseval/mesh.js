var mesh         = require('mesh');
var EventEmitter = require("events").EventEmitter;
var MongoClient  = require("mongodb").MongoClient;
var Response     = mesh.Response;
var Bus          = mesh.Bus;

/**
 */

function Adapter(options) {
  MongoClient.connect(options, this._onConnection.bind(this));
  this._collections = {};
  this.idProperty   = "_id";
}

/**
 */

Object.assign(Adapter.prototype, EventEmitter.prototype, {

  /**
   */

  run: function(operation, onRun) {
    if (!this.target) return this.once("connect", this.run.bind(this, operation, onRun));
    if (!operation.collection) return onRun(new Error("a collection must exist"));
    var method = this[operation.action];
    if (!method) return onRun();
    var collection = this._collection(operation);
    method.call(this, collection, operation, onRun);
  },

  /**
   */

  insert: function(collection, operation, onRun) {
    collection.insert(operation.data, function(err, result) {
      if (err) return onRun(err);
      return onRun(void 0, result.ops);
    });
  },

  /**
   */

  load: function(collection, operation, onRun) {
    var query = operation.query || {};
    if (operation.multi) {
      onRun(void 0, collection.find(query));
    } else {
      collection.findOne(query, onRun);
    }
  },

  /**
   */

  remove: function(collection, operation, onRun) {
    var query = operation.query || {};
    if (operation.multi) {
      collection.remove(query, onRun);
    } else {
      collection.removeOne(query, onRun);
    }
  },

  /**
   */

  update: function(collection, operation, onRun) {
    var query = operation.query || {};
    if (operation.multi) {
      collection.update(query, { $set: operation.data }, { multi: true }, onRun);
    } else {
      collection.updateOne(query, { $set: operation.data }, onRun);
    }
  },

  /**
   */

  _collection: function(operation) {
    var collection = this._collections[operation.collection];
    if (collection) return collection;
    collection = this._collections[operation.collection] = this.target.collection(operation.collection);
    return collection;
  },

  /**
   */

  _onConnection: function(err, target) {
    if (err) this.emit(err);
    this.target = target;
    this.emit("connect");
  }
});

/**
 */

function _toArray(value) {
  if (value == void 0) return [];
  return Object.prototype.toString.call(value) === "[object Array]" ? value : [value];
}

function MongoDsBus(options) {
  this.adapter = new Adapter(options);
}

Bus.extend(MongoDsBus, {
  execute: function(operation) {
    return Response.create((writable) => {
      this.adapter.run(operation, (err, result) => {
        if (err) return writable.abort(err);
        if (result && result.each) {
          var next = function() {
            result.nextObject((err, item) => {
              if (err) return writable.abort(err);
              if (!item) return writable.close();
              writable.write(item).then(next);
            })
          };
          next();
        } else {
          _toArray(result).forEach((value) => {
            writable.write(value);
          });
          writable.close();
        }
      });
    });
  }
});

module.exports = MongoDsBus;
