var crc32c = require('sse4_crc32');
var mongo = require('../models/mongo.js');
var settings = require('../settings.js');
var HashingRing = mongo.HashingRing;
var CollectionConstructor = mongo.CollectionConstructor;
var QueryLog = mongo.QueryLog;

/**
 * @type {Array}
 * Array: {
 *   collHash,
 *   joinTime
 * }
 */
var collections = [];

var initCollections = function() {
    HashingRing.find(function(err, docs) {
        if (err)
            return console.log('[initCollections]', err);

        collections = docs;
        collections.sort(compare);
        console.log('[initCollections]', collections);

        global.systemLock = false;
    });
};

var addCollection = function(hash, callback) {
    var i;
    hash = pad('' + hash, settings.hashLen, '0');

    for (i = 0; i < collections.length; i++)
        if (hash === collections[i].collHash)
            return callback && callback(null, collections);

    var collection = new HashingRing({
        collHash: hash,
        joinTime: +new Date()
    });

    collection.save(function(err, doc) {
        if (err) {
            console.log('[addCollection]', err);
            return callback && callback(err);
        }

        collections.thisPush(doc).sort(compare);
        console.log('[addCollection]', collections);
        callback && callback(null, collections);
    });
};

var removeCollection = function(hash, callback) {
    var i;
    hash = '' + hash;

    for (i = 0; i < collections.length; i++) {
        if (hash === collections[i].collHash) {
            HashingRing.findOneAndRemove({
                collHash: hash
            }, function(err) {
                if (err) {
                    console.log('[removeCollection]', err);
                    return callback && callback(err);
                }

                // because of the following return,
                // this i will be the specify value when it calls
                collections.splice(i, 1);
                console.log('[closure] i:', i);
                console.log('[removeCollection]', collections);
                callback && callback(null, collections);
            });
            return;
        }
    }
    callback && callback(null, collections);
};

var showCollections = function(callback) {
    callback && callback(null, collections);
};

var object2Collection = function(str) {
    var i, hash = crc32c.calculate(str);
    console.log('[object2Collection]', str, hash);

    for (i = 0; i < collections.length; i++) {
        if (hash <= collections[i].collHash) {
            return {
                hash: hash,
                collHash: collections[i].collHash
            };
        }
    }
    return {
        hash: hash,
        collHash: collections[0].collHash
    };
};


var findInLogs = function(str, callback) {
    QueryLog.findOne({
        keyword: str
    }, function(err, doc) {
        if (err) {
            console.log('[findInLogs]', err);
            return callback && callback(err);
        }

        callback && callback(null, doc);
    });
};

var saveLog = function(str, count, callback) {
    var hashes = object2Collection(str);
    var queryLog = new QueryLog({
        keyword: str,
        hash: hashes.hash,
        count: count,
        collHash: hashes.collHash,
        update: +new Date()
    });

    queryLog.save(function(err, doc) {
        if (err) {
            console.log('[saveLog]', err);
            return callback && callback(err);
        }

        callback && callback(null, doc);
    });
};

var find = function(str, collHash, callback) {
    // var collHash = object2Collection(str);
    CollectionConstructor(collHash).find({
        keyword: str
    }, function(err, docs) {
        if (err) {
            console.log('[find]', err);
            return callback && callback(err);
        }

        callback && callback(null, docs/*, collHash*/);
    });
};

var paginate = function(str, collHash, page, callback) {
    CollectionConstructor(collHash).find({
        keyword: str
    }).skip((page - 1) * settings.perPage).limit(settings.perPage)
    .sort('_id').exec(function(err, docs) {
        if (err) {
            console.log('[paginate]', err);
            return callback && callback(err);
        }

        callback && callback(null, docs);
    });
};

var save = function(docs, collHash, callback) {
    CollectionConstructor(collHash).create(docs, function(err) {
        if (err) {
            console.log('[save]', err);
            return callback && callback(err);
        }

        callback && callback();
    });
};


Array.prototype.thisPush = function(object) {
    this.push(object);
    return this;
};

var compare = function(a, b) {
    return a.collHash - b.collHash;
};

var pad = function(str, len, char) {
    return len - str.length === 0 ?
        str : new Array(len - str.length + 1).join(char) + str;
};


module.exports = {
    initCollections: initCollections,
    addCollection: addCollection,
    removeCollection: removeCollection,
    showCollections: showCollections,
    findInLogs: findInLogs,
    saveLog: saveLog,
    find: find,
    paginate: paginate,
    save: save
};